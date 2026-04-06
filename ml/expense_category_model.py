"""
Expense Category Prediction (Logistic Regression)

Features:
- Amount (numeric)
- Time of day (hour; optionally binned)
- Text description (TF-IDF)

Model:
- Logistic Regression (multiclass, linear, explainable)
  (You can switch to MultinomialNB if desired; see comments below.)

Deliverables:
- Training script (train/test split, accuracy)
- Inference helper (predict single record or batch)

Usage:
  python expense_category_model.py  # runs a small demo with synthetic data

Expected input DataFrame columns:
- description (text)
- amount (numeric)
- occurred_at (datetime)
- category (label)
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import FunctionTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.naive_bayes import MultinomialNB


def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extract hour-of-day as a numeric feature."""
    df = df.copy()
    df["occurred_at"] = pd.to_datetime(df["occurred_at"])
    df["hour"] = df["occurred_at"].dt.hour
    return df


def build_pipeline(model_type: str = "logreg") -> Pipeline:
    """
    Build a preprocessing + classifier pipeline.
    model_type: "logreg" (default) or "nb" (MultinomialNB)
    """
    text_feat = "description"
    num_feats = ["amount", "hour"]

    text_vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),  # unigrams + bigrams for simple phrase capture
        stop_words="english",
    )

    # ColumnTransformer to apply TF-IDF on text and pass through numeric features
    preprocessor = ColumnTransformer(
        transformers=[
            ("text", text_vectorizer, text_feat),
            ("num", "passthrough", num_feats),
        ],
        remainder="drop",
    )

    if model_type == "nb":
        # NB expects non-negative; TF-IDF + positive numeric works fine
        clf = MultinomialNB()
    else:
        clf = LogisticRegression(
            max_iter=200,
            n_jobs=-1,
            multi_class="auto",
        )

    model = Pipeline(
        steps=[
            ("pre", preprocessor),
            ("clf", clf),
        ]
    )
    return model


def train_and_eval(df: pd.DataFrame, model_type: str = "logreg"):
    """
    Train/test split, fit model, print accuracy and report.
    """
    df = add_time_features(df)
    X = df[["description", "amount", "hour"]]
    y = df["category"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = build_pipeline(model_type=model_type)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Accuracy: {acc:.3f}")
    print("\nClassification report:\n", classification_report(y_test, preds))

    return model


def predict_single(model: Pipeline, description: str, amount: float, occurred_at) -> str:
    """
    Run inference for a single expense.
    """
    df = pd.DataFrame(
        [{"description": description, "amount": amount, "occurred_at": occurred_at}]
    )
    df = add_time_features(df)
    return model.predict(df[["description", "amount", "hour"]])[0]


def demo():
    """
    Small synthetic demo to illustrate training & inference.
    """
    np.random.seed(42)
    categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment"]
    desc_templates = {
        "Food": ["lunch", "dinner", "cafe", "restaurant", "burger"],
        "Transport": ["uber", "taxi", "bus", "train", "fuel"],
        "Shopping": ["clothes", "store", "mall", "online order", "shoes"],
        "Bills": ["electricity", "water", "internet", "rent", "utility"],
        "Entertainment": ["movie", "concert", "game", "subscription", "netflix"],
    }

    rows = []
    for _ in range(800):
        cat = np.random.choice(categories, p=[0.25, 0.15, 0.25, 0.2, 0.15])
        desc = np.random.choice(desc_templates[cat])
        amt = np.random.gamma(2.0, 15.0)
        hour = np.random.randint(7, 23) if cat in ["Food", "Entertainment"] else np.random.randint(6, 22)
        ts = pd.Timestamp("2023-01-01") + pd.to_timedelta(np.random.randint(0, 60), unit="D")
        ts = ts + pd.to_timedelta(hour, unit="H")
        rows.append({"description": desc, "amount": amt, "occurred_at": ts, "category": cat})

    df = pd.DataFrame(rows)

    print("Training Logistic Regression model...")
    model = train_and_eval(df, model_type="logreg")

    # Inference example
    example_pred = predict_single(model, "dinner with friends", 32.5, pd.Timestamp("2023-03-15 19:30"))
    print("\nExample prediction:", example_pred)


if __name__ == "__main__":
    demo()
