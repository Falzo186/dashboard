#!/usr/bin/env python3
"""
Train cliente classification v2
- Re-label 'Empresa' -> 'Adulto'
- Keep only 3 classes: Niño, Joven, Adulto
- Train LightGBM pipeline, evaluate metrics and confusion matrix
- If accuracy >= 0.70 save model as modelo_cliente_v2.pkl
- Export predictions CSV and confidence distribution PNG

Usage:
  Ensure Python packages installed: pandas psycopg2-binary scikit-learn lightgbm joblib matplotlib
  Set DATABASE_URL env var (example PowerShell):
    $env:DATABASE_URL = 'postgresql://postgres:186187@localhost:5432/tienda?schema=public'
  Then run:
    python train_cliente_model_v2.py
"""

import os
import sys
import math
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report
import lightgbm as lgb
import psycopg2
from psycopg2.extras import RealDictCursor

OUT_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(OUT_DIR, 'modelo_cliente_v2.pkl')
PRED_CSV = os.path.join(OUT_DIR, 'predictions_cliente_v2.csv')
CONF_PNG = os.path.join(OUT_DIR, 'confidence_distribution_v2.png')

DB_DSN = os.environ.get('DATABASE_URL')
if not DB_DSN:
    print('DATABASE_URL environment variable is required')
    sys.exit(2)


def get_conn():
    return psycopg2.connect(DB_DSN)


def fetch_aggregated(limit: int = 50000):
    q = f"""
    SELECT t.id as ticket_id,
           t.fecha_hora,
           t.total::float,
           COALESCE(SUM(td.cantidad),0) as sum_qty,
           COUNT(td.producto_id) as num_items,
           STRING_AGG(DISTINCT COALESCE(p.categories,'sin_categoria'), ',') as categories,
           COUNT(DISTINCT COALESCE(p.categories,'sin_categoria')) as unique_categories,
        '' as label
    FROM transactions t
    LEFT JOIN transaction_detail td ON td.transaction_id = t.id
    LEFT JOIN products p ON p.id = td.producto_id
    GROUP BY t.id, t.fecha_hora, t.total
    ORDER BY t.fecha_hora DESC
    LIMIT {limit}
    """
    conn = get_conn()
    df = pd.read_sql(q, conn)
    conn.close()
    # normalize
    df['fecha_hora'] = pd.to_datetime(df['fecha_hora'], errors='coerce')
    df['hour'] = df['fecha_hora'].dt.hour.fillna(0).astype(int)
    df['day_of_week'] = df['fecha_hora'].dt.dayofweek.fillna(0).astype(int)
    # avg price per item: avoid division by zero
    df['avg_price'] = df.apply(lambda r: (r['total'] / r['sum_qty']) if r['sum_qty'] and r['sum_qty'] > 0 else (r['total'] / r['num_items'] if r['num_items'] and r['num_items']>0 else 0.0), axis=1)
    # dominant category: first token of categories
    df['main_category'] = df['categories'].fillna('sin_categoria').apply(lambda s: str(s).split(',')[0] if s else 'sin_categoria')
    return df


def relabel_dataframe(df: pd.DataFrame):
    # Create heuristic labels (fallback) then map Empresa -> Adulto
    def heuristic_label(row):
        dominant = (row.get('main_category') or '').lower()
        total = float(row.get('total') or 0.0)
        num_items = int(row.get('num_items') or 0)
        # heuristics
        if 'juguete' in dominant or (num_items <= 2 and total < 5000):
            return 'Niño'
        if 'protein' in dominant or 'suplement' in dominant or total > 100000:
            return 'Adulto'
        if num_items > 20 or total > 200000:
            return 'Empresa'
        return 'Joven'

    df['label'] = df.apply(heuristic_label, axis=1)
    # Map Empresa -> Adulto to collapse classes
    df['label'] = df['label'].replace({'Empresa': 'Adulto'})
    # Keep only the three target classes
    df = df[df['label'].isin(['Niño', 'Joven', 'Adulto'])].copy()
    return df


def build_features(df: pd.DataFrame):
    X = df[['total', 'num_items', 'sum_qty', 'avg_price', 'hour', 'day_of_week', 'unique_categories', 'main_category']].copy()
    y = df['label'].copy()
    ids = df['ticket_id'].copy()
    return X, y, ids


def train_and_evaluate(X, y, ids):
    # encode labels
    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    # split
    X_train, X_test, y_train, y_test, id_train, id_test = train_test_split(X, y_enc, ids, test_size=0.2, random_state=42, stratify=y_enc)

    # Oversample training only to balance
    from sklearn.utils import resample
    train_df = X_train.copy()
    train_df['label'] = y_train
    counts = train_df['label'].value_counts()
    if not counts.empty:
        max_c = int(counts.max())
        parts = []
        for cls, cnt in counts.items():
            cls_df = train_df[train_df['label'] == cls]
            if cnt < max_c:
                up = resample(cls_df, replace=True, n_samples=max_c, random_state=42)
                parts.append(up)
            else:
                parts.append(cls_df)
        train_bal = pd.concat(parts).sample(frac=1, random_state=42).reset_index(drop=True)
    else:
        train_bal = train_df

    y_train_bal = train_bal['label'].values
    X_train_bal = train_bal.drop(columns=['label'])

    numeric = ['total','num_items','sum_qty','avg_price','hour','day_of_week','unique_categories']
    categorical = ['main_category']

    preproc = ColumnTransformer([
        ('num', StandardScaler(), numeric),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical)
    ])

    clf = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, random_state=42)
    pipe = Pipeline([('pre', preproc), ('clf', clf)])

    # fit
    pipe.fit(X_train_bal, y_train_bal)

    # predict
    y_pred = pipe.predict(X_test)
    y_proba = pipe.predict_proba(X_test) if hasattr(pipe, 'predict_proba') else None

    acc = accuracy_score(y_test, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted', zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    print('Accuracy:', acc)
    print('Precision (weighted):', prec)
    print('Recall (weighted):', rec)
    print('F1 (weighted):', f1)
    print('Confusion matrix:\n', cm)
    print('Classification report:\n', classification_report(y_test, y_pred, zero_division=0, target_names=le.classes_))

    # average confidence
    avg_conf = None
    if y_proba is not None:
        maxp = y_proba.max(axis=1)
        avg_conf = float(maxp.mean()) * 100.0
        # save histogram
        plt.figure(figsize=(6,4))
        plt.hist(maxp * 100.0, bins=20, color='#3B82F6')
        plt.xlabel('Confianza (%)')
        plt.ylabel('Cantidad')
        plt.title('Distribución de confianza (conjunto de validación)')
        plt.tight_layout()
        plt.savefig(CONF_PNG)
        print('Saved confidence plot to', CONF_PNG)

    # save model if accuracy >= 0.70
    saved = False
    if acc >= 0.70:
        joblib.dump({'pipeline': pipe, 'label_encoder': le}, MODEL_PATH)
        print('Saved model to', MODEL_PATH)
        saved = True
    else:
        print('Accuracy below 0.70; model not saved automatically.')

    # export predictions CSV (for test set)
    class_labels = list(le.inverse_transform(np.arange(len(le.classes_)))) if hasattr(le, 'classes_') else [str(i) for i in range(y_proba.shape[1])] if y_proba is not None else []
    pred_rows = []
    for i, tid in enumerate(id_test.values):
        pred_label = le.inverse_transform([int(y_pred[i])])[0]
        conf = float(np.max(y_proba[i])) * 100.0 if y_proba is not None else 0.0
        pred_rows.append({'ticket_id': int(tid), 'tipo_cliente_predicho': pred_label, 'confianza': round(conf,2)})
    pd.DataFrame(pred_rows).to_csv(PRED_CSV, index=False)
    print('Saved predictions CSV to', PRED_CSV)

    metrics = {'accuracy': acc, 'precision': prec, 'recall': rec, 'f1': f1, 'avg_confidence_pct': avg_conf, 'saved': saved}
    return metrics


def main():
    print('Fetching aggregated data...')
    df = fetch_aggregated(limit=50000)
    print('Rows fetched:', len(df))
    df = relabel_dataframe(df)
    print('Rows after relabel/filter:', len(df))
    if len(df) < 50:
        print('Warning: too few rows to train reliably')
    X, y, ids = build_features(df)
    stats = train_and_evaluate(X, y, ids)
    print('Training finished. Metrics:')
    print(stats)

if __name__ == '__main__':
    main()
