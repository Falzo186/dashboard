#!/usr/bin/env python3
import os
import sys
import json
import pandas as pd
import psycopg2
from typing import List

# Training script enhanced: more features, preprocessing pipeline, hyperparameter tuning,
# evaluation metrics and histogram of predicted confidences.
# Requirements: pandas, psycopg2, scikit-learn, lightgbm, joblib, matplotlib

MODEL_OUT = os.path.join(os.path.dirname(__file__), 'client_model.pkl')
HIST_OUT = os.path.join(os.path.dirname(__file__), 'confidence_hist.png')


def get_db_conn():
    url = os.environ.get('DATABASE_URL')
    if not url:
        raise RuntimeError('DATABASE_URL not set')
    return psycopg2.connect(url)


def extract_dataset(limit_transactions: int = 20000):
    conn = get_db_conn()
    # Aggregate transaction-level features from transactions, transaction_detail and products
    q = f'''
    SELECT t.id as transaction_id,
           t.fecha_hora,
           t.total,
           COUNT(td.producto_id) as num_items,
           SUM(td.cantidad) as sum_qty,
           ARRAY_AGG(DISTINCT COALESCE(p.categories, 'sin_categoria')) as categories_arr,
           COUNT(DISTINCT COALESCE(p.categories,'sin_categoria')) as unique_categories
    FROM transactions t
    INNER JOIN transaction_detail td ON td.transaction_id = t.id
    INNER JOIN products p ON td.producto_id = p.id
    GROUP BY t.id, t.fecha_hora, t.total
    ORDER BY t.fecha_hora DESC
    LIMIT {limit_transactions}
    '''
    df = pd.read_sql(q, conn)
    conn.close()
    # normalize fecha_hora to datetime
    df['fecha_hora'] = pd.to_datetime(df['fecha_hora'])
    # derive hour and day_of_week
    df['hour'] = df['fecha_hora'].dt.hour
    df['day_of_week'] = df['fecha_hora'].dt.dayofweek
    # derive dominant category/type (most common in categories_arr)
    def dominant(cat_arr):
        if not cat_arr:
            return 'sin_categoria'
        # cat_arr is list; pick first non-null
        try:
            # flatten if needed
            if isinstance(cat_arr[0], list):
                flat = [c for sub in cat_arr for c in sub if c]
            else:
                flat = [c for c in cat_arr if c]
            if not flat:
                return 'sin_categoria'
            # pick most frequent by simple counting
            from collections import Counter
            return Counter(flat).most_common(1)[0][0]
        except Exception:
            return str(cat_arr[0]) if cat_arr else 'sin_categoria'

    df['dominant_category'] = df['categories_arr'].apply(dominant)
    return df


def build_examples(df: pd.DataFrame):
    # We don't have ground-truth labels; create synthetic labels with heuristics
    # but try to enlarge and balance the dataset via simple oversampling.
    examples = []
    for _, row in df.iterrows():
        total = float(row['total']) if row['total'] is not None else 0.0
        num_items = int(row['num_items']) if row['num_items'] is not None else 0
        sum_qty = int(row['sum_qty']) if row['sum_qty'] is not None else 0
        hour = int(row['hour'])
        day_of_week = int(row['day_of_week'])
        unique_categories = int(row['unique_categories']) if row['unique_categories'] is not None else 0
        dominant = row.get('dominant_category', 'sin_categoria')

        # heuristic labeling (demo). These rules can be improved with real labeled data.
        if 'juguete' in str(dominant).lower() or (num_items <= 2 and total < 5000):
            label = 'Niño'
        elif 'protein' in str(dominant).lower() or 'suplement' in str(dominant).lower() or total > 100000:
            label = 'Adulto'
        elif num_items > 20 or total > 200000:
            label = 'Empresa'
        else:
            label = 'Joven'

        examples.append({
            'transaction_id': int(row['transaction_id']),
            'total': total,
            'num_items': num_items,
            'sum_qty': sum_qty,
            'hour': hour,
            'day_of_week': day_of_week,
            'unique_categories': unique_categories,
            'dominant_category': dominant,
            'label': label
        })

    ex_df = pd.DataFrame(examples)
    return ex_df


def featurize(ex_df: pd.DataFrame):
    # Build feature matrix and label vector
    from sklearn.preprocessing import LabelEncoder
    y = ex_df['label']

    # features: total, num_items, sum_qty, hour, day_of_week, unique_categories, dominant_category
    X = ex_df[['total', 'num_items', 'sum_qty', 'hour', 'day_of_week', 'unique_categories', 'dominant_category']].copy()
    return X, y


def train_model(X, y):
    from sklearn.model_selection import train_test_split, RandomizedSearchCV
    from sklearn.pipeline import Pipeline
    from sklearn.compose import ColumnTransformer
    from sklearn.preprocessing import OneHotEncoder, StandardScaler, LabelEncoder
    from lightgbm import LGBMClassifier
    from joblib import dump
    from sklearn.metrics import accuracy_score, f1_score, confusion_matrix
    import numpy as np
    import matplotlib.pyplot as plt

    # Encode labels
    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    # Split BEFORE any oversampling to avoid data leakage
    X_train_raw, X_val, y_train_raw, y_val = train_test_split(X, y_enc, test_size=0.2, random_state=42, stratify=y_enc)

    # Oversample only the training set to balance classes
    from sklearn.utils import resample
    train_df = X_train_raw.copy()
    train_df['label'] = y_train_raw
    target_counts = train_df['label'].value_counts()
    if not target_counts.empty:
        max_count = int(target_counts.max())
        dfs = []
        for cls, cnt in target_counts.items():
            cls_df = train_df[train_df['label'] == cls]
            if cnt < max_count:
                up = resample(cls_df, replace=True, n_samples=max_count, random_state=42)
                dfs.append(up)
            else:
                dfs.append(cls_df)
        train_bal = pd.concat(dfs).sample(frac=1, random_state=42).reset_index(drop=True)
    else:
        train_bal = train_df

    y_train = train_bal['label'].values
    X_train = train_bal.drop(columns=['label'])

    numeric_features = ['total', 'num_items', 'sum_qty', 'hour', 'day_of_week', 'unique_categories']
    categorical_features = ['dominant_category']

    numeric_transformer = Pipeline(steps=[('scaler', StandardScaler())])
    categorical_transformer = Pipeline(steps=[('ohe', OneHotEncoder(handle_unknown='ignore'))])

    preprocessor = ColumnTransformer(transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ])

    base_model = LGBMClassifier(n_estimators=200, max_depth=8, random_state=42)

    # Create pipeline
    pipe = Pipeline(steps=[('pre', preprocessor), ('clf', base_model)])

    # Hyperparameter search (randomized)
    param_dist = {
        'clf__learning_rate': [0.01, 0.05, 0.1],
        'clf__num_leaves': [31, 50, 100],
        'clf__subsample': [0.6, 0.8, 1.0],
        'clf__colsample_bytree': [0.6, 0.8, 1.0]
    }

    search = RandomizedSearchCV(pipe, param_distributions=param_dist, n_iter=12, cv=3, scoring='f1_macro', n_jobs=-1, random_state=42, verbose=1)
    search.fit(X_train, y_train)

    best = search.best_estimator_
    print('Best params:', search.best_params_)

    # Evaluate on validation set (pipeline handles preprocessing)
    y_pred = best.predict(X_val)
    y_proba = best.predict_proba(X_val) if hasattr(best, 'predict_proba') else None

    acc = accuracy_score(y_val, y_pred)
    f1 = f1_score(y_val, y_pred, average='macro')
    cm = confusion_matrix(y_val, y_pred)

    # Map confusion matrix labels back to original label names
    labels = list(le.inverse_transform(sorted(set(y_val))))
    print(f'Validation accuracy: {acc:.4f}, f1_macro: {f1:.4f}')
    print('Confusion matrix:\n', cm)

    # Compute average confidence
    avg_conf = 0.0
    if y_proba is not None:
        max_probs = y_proba.max(axis=1)
        avg_conf = float(max_probs.mean())
        # histogram
        plt.figure(figsize=(6,4))
        plt.hist(max_probs, bins=20, color='#4F46E5', alpha=0.9)
        plt.xlabel('Predicted probability')
        plt.ylabel('Count')
        plt.title('Histogram of prediction confidences (validation set)')
        plt.grid(True, alpha=0.3)
        plt.savefig(HIST_OUT)
        print('Saved confidence histogram to', HIST_OUT)

    # Save the whole pipeline + label encoder to preserve preprocessing & feature names
    dump({'pipeline': best, 'label_encoder': le}, MODEL_OUT)
    print('Pipeline and label encoder saved to', MODEL_OUT)

    return {'pipeline': best, 'label_encoder': le, 'metrics': {'accuracy': acc, 'f1_macro': f1, 'avg_confidence': avg_conf}}


def main():
    print('Extracting dataset...')
    df = extract_dataset(limit_transactions=30000)
    print('Building examples...')
    ex_df = build_examples(df)
    print('Featurizing...')
    X, y = featurize(ex_df)
    print('Training model (this may take a few minutes)...')
    out = train_model(X, y)
    print('Done')
    print('Metrics:', out.get('metrics'))


if __name__ == '__main__':
    main()
