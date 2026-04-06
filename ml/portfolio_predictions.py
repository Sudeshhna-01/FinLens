"""
Portfolio forecasts — stores one MLInsight per user with type portfolio_prediction.
Uses Finnhub real-time quotes when FINNHUB_API_KEY is set, else DB marks.
Not investment advice.
"""

import os
import sys
import json
import uuid
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from typing import Optional

from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found")
    sys.exit(1)


def connect():
    return psycopg2.connect(DATABASE_URL)


def effective_price(row):
    cur = row.get("currentPrice")
    avg = float(row["avgPrice"] or 0)
    if cur is not None and float(cur) >= 0:
        return float(cur)
    return avg


def finnhub_quote(symbol):
    """Delayed real-time quote (Finnhub free tier). Returns None if no key or error."""
    key = os.getenv("FINNHUB_API_KEY")
    if not key:
        return None
    q = urllib.parse.quote(symbol, safe="")
    url = f"https://finnhub.io/api/v1/quote?symbol={q}&token={key}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "FinLens-ML/1.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode())
        c = float(data.get("c") or 0)
        pc = float(data.get("pc") or 0)
        price = c if c > 0 else (pc if pc > 0 else None)
        if price is None or price <= 0:
            return None
        d = data.get("d")
        dp = data.get("dp")
        return {
            "price": price,
            "change": float(d) if d is not None else None,
            "change_percent": float(dp) if dp is not None else None,
            "prev_close": pc,
        }
    except Exception as exc:
        print(f"    [Finnhub] {symbol}: {exc}")
        return None


def run(user_id: Optional[str] = None):
    src = (
        "Finnhub live quotes + momentum model"
        if os.getenv("FINNHUB_API_KEY")
        else "Database marks + momentum model"
    )
    print(f"FinLens portfolio prediction ({src})")
    print("=" * 50)
    conn = connect()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    if user_id:
        cur.execute('SELECT id FROM \"User\" WHERE id = %s', (user_id,))
    else:
        cur.execute('SELECT id FROM \"User\"')
    users = cur.fetchall()
    cur.close()

    if not users:
        print("No users")
        conn.close()
        return

    saved = 0
    for u in users:
        uid = u["id"]
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """
            SELECT sh.id, sh.quantity, sh."avgPrice", sh."currentPrice",
                   s.symbol
            FROM "StockHolding" sh
            JOIN "Stock" s ON s.id = sh."stockId"
            WHERE sh."userId" = %s
            """,
            (uid,),
        )
        rows = cur.fetchall()
        cur.close()

        if not rows:
            continue

        holdings_out = []
        current_total = 0.0
        projected_total = 0.0
        live_marks = 0

        for h in rows:
            qty = float(h["quantity"] or 0)
            avg = float(h["avgPrice"] or 0)
            fh = finnhub_quote(h["symbol"])
            if fh:
                cur_p = fh["price"]
                mark_source = "finnhub"
                live_marks += 1
            else:
                cur_p = effective_price(h)
                mark_source = "database"

            momentum = (cur_p - avg) / avg if avg > 0 else 0.0
            # Blend cost-basis momentum with recent session move (if live)
            session_adj = 0.0
            if fh and fh.get("change_percent") is not None:
                session_adj = max(-0.2, min(0.2, float(fh["change_percent"]) / 100.0))

            damp = 0.12 + min(0.08, abs(session_adj) * 2.0)
            blended = max(-0.25, min(0.25, momentum * 0.7 + session_adj * 0.3))
            projected_price = max(0.0, cur_p * (1.0 + blended * damp))
            cur_val = qty * cur_p
            proj_val = qty * projected_price
            current_total += cur_val
            projected_total += proj_val
            unrealized_pct = momentum * 100.0

            if momentum > 0.02:
                signal = "bullish"
            elif momentum < -0.02:
                signal = "bearish"
            else:
                signal = "neutral"

            holdings_out.append(
                {
                    "symbol": h["symbol"],
                    "quantity": round(qty, 4),
                    "avg_price": round(avg, 2),
                    "mark_price": round(cur_p, 2),
                    "mark_source": mark_source,
                    "unrealized_pct": round(unrealized_pct, 2),
                    "projected_price_30d": round(projected_price, 2),
                    "projected_value_30d": round(proj_val, 2),
                    "signal": signal,
                }
            )

        implied_change_pct = (
            ((projected_total - current_total) / current_total * 100.0)
            if current_total > 0
            else 0.0
        )

        price_note = (
            f"Mark prices: {live_marks}/{len(holdings_out)} from Finnhub (delayed)."
            if live_marks
            else "Mark prices from your saved holdings (set FINNHUB_API_KEY for live quotes)."
        )
        payload = {
            "category": "portfolio_outlook",
            "type": "momentum_forecast",
            "message": (
                f"30-day outlook (model): ~${projected_total:,.2f} vs ${current_total:,.2f} today "
                f"({implied_change_pct:+.1f}% implied). {price_note}"
            ),
            "awareness": (
                "Educational only — not investment advice. "
                "Live quotes are delayed; projections blend momentum with a simple horizon model."
            ),
            "holdings": holdings_out,
            "totals": {
                "current_value": round(current_total, 2),
                "projected_value_30d": round(projected_total, 2),
                "implied_change_pct": round(implied_change_pct, 2),
                "live_finnhub_marks": live_marks,
            },
            "priority": 2,
            "user_id": uid,
            "generated_at": datetime.now().isoformat(),
        }

        insight_id = f"pf_{uuid.uuid4().hex[:12]}"
        c2 = conn.cursor()
        c2.execute(
            'DELETE FROM "MLInsight" WHERE "userId" = %s AND type = %s',
            (uid, "portfolio_prediction"),
        )
        c2.execute(
            """
            INSERT INTO "MLInsight" (id, "userId", type, data, "generatedAt", "validUntil")
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                insight_id,
                uid,
                "portfolio_prediction",
                json.dumps(payload),
                datetime.now(),
                datetime.now() + timedelta(days=14),
            ),
        )
        conn.commit()
        c2.close()
        saved += 1
        print(f"  ✓ User {uid[:8]}… — {len(holdings_out)} holdings ({live_marks} live marks)")

    conn.close()
    print(f"\n✓ Saved portfolio predictions for {saved} user(s)")
    print("=" * 50)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate portfolio prediction insight(s).")
    parser.add_argument("--user", dest="user_id", help="User ID to refresh (optional)")
    args = parser.parse_args()
    run(user_id=args.user_id)
