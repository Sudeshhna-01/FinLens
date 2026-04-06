"""
Overspending Risk Prediction (Linear Regression)

Features per user (simple, explainable):
- last_3mo_spend: total spend over the last 3 months
- trend_slope: slope of monthly spend over the last 3 months (positive = rising)
- category_dominance: max category proportion in the last 3 months (concentration risk)

Model:
- Linear Regression (interpretable weights)

Outputs:
- risk_score: 0–100 scaled score
- risk_level: low / medium / high (rule-based on score thresholds)

Usage:
  python overspending_risk.py  # runs a synthetic demo with plots

Expected input DataFrame columns:
- user_id
- amount (numeric)
- occurred_at (datetime)
- category (string)
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error
import matplotlib.pyplot as plt


def prepare_features(df: pd.DataFrame, as_of: pd.Timestamp | None = None) -> pd.DataFrame:
    """
    Build feature matrix per user for the last 3 months.
    """
    if as_of is None:
        as_of = pd.Timestamp.utcnow()
    df = df.copy()
    df["occurred_at"] = pd.to_datetime(df["occurred_at"])

    start = as_of - pd.DateOffset(months=3)
    recent = df[df["occurred_at"] >= start]

    # Monthly spend for slope calculation
    recent["year_month"] = recent["occurred_at"].dt.to_period("M")
    monthly = (
        recent.groupby(["user_id", "year_month"])["amount"]
        .sum()
        .reset_index()
    )

    # Compute slope via simple linear fit over months (index as t)
    slopes = []
    for uid, sub in monthly.groupby("user_id"):
        # If fewer than 2 points, slope = 0
        if len(sub) < 2:
            slope = 0.0
        else:
            t = np.arange(len(sub)).reshape(-1, 1)
            y = sub["amount"].values
            lr = LinearRegression()
            lr.fit(t, y)
            slope = float(lr.coef_[0])
        slopes.append({"user_id": uid, "trend_slope": slope})
    slope_df = pd.DataFrame(slopes)

    # Last 3 months total
    total_df = (
        recent.groupby("user_id")["amount"]
        .sum()
        .reset_index()
        .rename(columns={"amount": "last_3mo_spend"})
    )

    # Category dominance: max proportion
    cat = (
        recent.groupby(["user_id", "category"])["amount"]
        .sum()
        .reset_index()
    )
    cat["user_total"] = cat.groupby("user_id")["amount"].transform("sum")
    cat["cat_prop"] = cat["amount"] / cat["user_total"]
    dom_df = (
        cat.groupby("user_id")["cat_prop"]
        .max()
        .reset_index()
        .rename(columns={"cat_prop": "category_dominance"})
    )

    # Combine
    feat_df = total_df.merge(slope_df, on="user_id", how="left").merge(dom_df, on="user_id", how="left")
    feat_df = feat_df.fillna(0)
    return feat_df


def scale_to_0_100(raw_scores: np.ndarray) -> np.ndarray:
    """
    Min-max scale to 0-100. If constant, return 50s.
    """
    min_s, max_s = raw_scores.min(), raw_scores.max()
    if np.isclose(min_s, max_s):
        return np.full_like(raw_scores, 50.0)
    return 100 * (raw_scores - min_s) / (max_s - min_s)


def risk_level(score: float) -> str:
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"


def train_model(feat_df: pd.DataFrame, target: pd.Series) -> tuple[LinearRegression, pd.DataFrame]:
    """
    Train a linear regression model; returns model and a DataFrame with predictions + risk labels.
    """
    X = feat_df[["last_3mo_spend", "trend_slope", "category_dominance"]]
    y = target.values

    model = LinearRegression()
    model.fit(X, y)

    raw_preds = model.predict(X)
    risk_scores = scale_to_0_100(raw_preds)
    out = feat_df.copy()
    out["raw_pred"] = raw_preds
    out["risk_score"] = risk_scores
    out["risk_level"] = out["risk_score"].apply(risk_level)

    # Simple metrics on training data (for illustration)
    r2 = r2_score(y, raw_preds)
    rmse = mean_squared_error(y, raw_preds, squared=False)
    print(f"Train R^2: {r2:.3f}, RMSE: {rmse:.2f}")

    return model, out


def visualize_risk(out_df: pd.DataFrame):
    """
    Scatter plot: predicted risk_score vs last_3mo_spend, color by level.
    """
    plt.figure(figsize=(6, 4))
    colors = {"low": "#10b981", "medium": "#f59e0b", "high": "#ef4444"}
    for level, sub in out_df.groupby("risk_level"):
        plt.scatter(sub["last_3mo_spend"], sub["risk_score"], label=level, alpha=0.7, c=colors[level])
    plt.xlabel("Last 3 Months Spend")
    plt.ylabel("Risk Score (0-100)")
    plt.title("Overspending Risk")
    plt.legend()
    plt.tight_layout()
    plt.show()


def demo():
    """
    Synthetic demo to illustrate the pipeline:
    - Generate user spend with upward/downward trends and category concentration
    - Train linear regression on a synthetic target (future month spend)
    - Output risk scores and labels
    """
    np.random.seed(42)
    users = [f"user_{i}" for i in range(1, 31)]
    categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment"]

    rows = []
    for u in users:
        base = np.random.uniform(400, 1200)
        slope = np.random.uniform(-100, 150)  # monthly trend component
        dominant = np.random.choice(categories, p=[0.35, 0.2, 0.2, 0.15, 0.1])
        for month_idx, month in enumerate(pd.period_range("2023-01", periods=4, freq="M")):
            # generate ~20 expenses per month
            for _ in range(20):
                cat = dominant if np.random.rand() < 0.5 else np.random.choice(categories)
                amt = np.random.gamma(2.0, 25.0)
                day = np.random.randint(1, 28)
                ts = pd.Timestamp(f"{month.start_time.date()}") + pd.to_timedelta(day, unit="D")
                rows.append({"user_id": u, "amount": amt, "occurred_at": ts, "category": cat})
            # gently adjust base for next month
            base += slope / 20.0

    df = pd.DataFrame(rows)

    # Prepare features using last 3 months (M2, M3, M4 in this synthetic set)
    as_of = pd.Timestamp("2023-04-30")
    feat_df = prepare_features(df, as_of=as_of)

    # Synthetic target: future month spend (M4) + noise acts as proxy risk target
    month4 = df[df["occurred_at"].dt.to_period("M") == pd.Period("2023-04")]
    target = (
        month4.groupby("user_id")["amount"]
        .sum()
        .reindex(feat_df["user_id"])
        .fillna(0)
    )

    model, out = train_model(feat_df, target)

    print("\nSample outputs:")
    print(out[["user_id", "last_3mo_spend", "trend_slope", "category_dominance", "risk_score", "risk_level"]].head())

    visualize_risk(out)


if __name__ == "__main__":
    demo()
