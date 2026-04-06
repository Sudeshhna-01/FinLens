"""
Spending Behavior Clustering (K-Means)

Features (per user):
- Average daily spend
- Category distribution (proportions)
- Spending variance (std dev of daily totals)
- Weekend vs weekday spend ratio

Outputs:
- Cluster labels per user
- Cluster-level summaries
- Optional visualizations (2D scatter via PCA)

Usage:
- Provide a DataFrame with columns: user_id, amount, occurred_at (datetime), category.
- Run `python spending_clusters.py` for a demo with synthetic data.
"""

import json
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt


def build_feature_matrix(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Build per-user feature matrix.

    Features:
    - avg_daily_spend: mean of daily totals
    - spend_std: std dev of daily totals
    - weekend_ratio: weekend spend / weekday spend (fallback to 0 if no weekday spend)
    - category_<cat>: proportion of spend in each category

    Returns:
    - feature_df: rows=user_id, cols=features (numeric)
    - meta_df: auxiliary info (user_id, days_observed)
    """
    df = df.copy()
    df["occurred_at"] = pd.to_datetime(df["occurred_at"])
    df["date"] = df["occurred_at"].dt.date
    df["is_weekend"] = df["occurred_at"].dt.dayofweek >= 5  # 5=Sat,6=Sun

    # Daily totals per user
    daily = (
        df.groupby(["user_id", "date"])["amount"]
        .sum()
        .reset_index(name="day_total")
    )

    # Core stats
    stats = (
        daily.groupby("user_id")["day_total"]
        .agg(avg_daily_spend="mean", spend_std="std")
        .fillna(0)
    )

    # Weekend vs weekday
    weekend_weekday = (
        df.groupby(["user_id", "is_weekend"])["amount"]
        .sum()
        .unstack(fill_value=0)
        .rename(columns={False: "weekday_spend", True: "weekend_spend"})
    )
    weekend_weekday["weekend_ratio"] = weekend_weekday.apply(
        lambda r: r["weekend_spend"] / r["weekday_spend"] if r["weekday_spend"] > 0 else 0,
        axis=1,
    )

    # Category distribution (proportions)
    cat_totals = df.groupby(["user_id", "category"])["amount"].sum().reset_index()
    cat_pivot = cat_totals.pivot(index="user_id", columns="category", values="amount").fillna(0)
    cat_props = cat_pivot.div(cat_pivot.sum(axis=1), axis=0).fillna(0)
    cat_props.columns = [f"cat_{c}" for c in cat_props.columns]

    # Combine
    feature_df = stats.join(weekend_weekday[["weekend_ratio"]], how="left").fillna(0)
    feature_df = feature_df.join(cat_props, how="left").fillna(0)

    # Meta info
    meta_df = (
        daily.groupby("user_id")
        .agg(days_observed=("date", "nunique"))
        .reset_index()
    )

    return feature_df.reset_index(), meta_df


def run_kmeans(feature_df: pd.DataFrame, n_clusters: int = 3, random_state: int = 42):
    """
    Standardize features, run K-Means, return labels and model.
    """
    features = feature_df.drop(columns=["user_id"])
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features)

    model = KMeans(n_clusters=n_clusters, n_init=10, random_state=random_state)
    labels = model.fit_predict(X_scaled)

    return labels, model, scaler


def summarize_clusters(feature_df: pd.DataFrame, labels: np.ndarray) -> pd.DataFrame:
    """
    Summarize clusters by mean of each feature.
    """
    df = feature_df.copy()
    df["cluster"] = labels
    summary = df.groupby("cluster").mean(numeric_only=True)
    return summary


def project_pca(feature_df: pd.DataFrame, labels: np.ndarray) -> pd.DataFrame:
    """
    Reduce to 2D for visualization.
    """
    X = feature_df.drop(columns=["user_id"]).values
    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(X)
    return pd.DataFrame(
        {"pc1": coords[:, 0], "pc2": coords[:, 1], "cluster": labels, "user_id": feature_df["user_id"]}
    )


def plot_clusters(pca_df: pd.DataFrame):
    """
    Simple 2D scatter plot of clusters using PCA components.
    """
    plt.figure(figsize=(6, 5))
    for c in sorted(pca_df["cluster"].unique()):
        sub = pca_df[pca_df["cluster"] == c]
        plt.scatter(sub["pc1"], sub["pc2"], label=f"Cluster {c}", alpha=0.7)
    plt.title("Spending Clusters (PCA)")
    plt.xlabel("PC1")
    plt.ylabel("PC2")
    plt.legend()
    plt.tight_layout()
    plt.show()


def demo():
    """
    Run a demo with synthetic data to illustrate outputs.
    """
    np.random.seed(42)
    users = [f"user_{i}" for i in range(1, 11)]
    categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment"]

    rows = []
    for u in users:
        for day in pd.date_range("2023-01-01", periods=60, freq="D"):
            # random number of expenses per day
            for _ in range(np.random.poisson(1.5)):
                cat = np.random.choice(categories, p=[0.3, 0.15, 0.25, 0.2, 0.1])
                amt = np.random.gamma(2.0, 20.0)  # skewed positive
                rows.append({"user_id": u, "amount": amt, "occurred_at": day, "category": cat})

    df = pd.DataFrame(rows)

    # Build features and run clustering
    feature_df, meta_df = build_feature_matrix(df)
    labels, model, scaler = run_kmeans(feature_df, n_clusters=3)
    summary = summarize_clusters(feature_df, labels)
    pca_df = project_pca(feature_df, labels)

    # Display results
    labeled = feature_df.assign(cluster=labels)
    print("Sample labeled users:")
    print(labeled[["user_id", "cluster", "avg_daily_spend", "spend_std", "weekend_ratio"]].head())

    print("\nCluster summaries (means):")
    print(summary[["avg_daily_spend", "spend_std", "weekend_ratio"]])

    # Optionally show plot
    plot_clusters(pca_df)

    # Sample insights
    insights = []
    for c, row in summary.iterrows():
        insights.append(
            {
                "cluster": int(c),
                "profile": {
                    "avg_daily_spend": round(row["avg_daily_spend"], 2),
                    "spend_variance": round(row["spend_std"], 2),
                    "weekend_ratio": round(row["weekend_ratio"], 2),
                    "top_categories": [
                        col.replace("cat_", "")
                        for col in row.filter(like="cat_").sort_values(ascending=False).head(3).index
                    ],
                },
            }
        )
    print("\nSample insights (JSON):")
    print(json.dumps(insights, indent=2))


if __name__ == "__main__":
    demo()
