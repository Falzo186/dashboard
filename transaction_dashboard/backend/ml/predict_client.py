#!/usr/bin/env python3
import sys
import json
import os
from typing import Any

# Improved prediction script that uses saved preprocessor and model to create reliable
# features, returns probabilities and confidence. Requires joblib, pandas, psycopg2.

import psycopg2
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'client_model.pkl')


def get_db_conn():
    url = os.environ.get('DATABASE_URL')
    if not url:
        raise RuntimeError('DATABASE_URL not set')
    return psycopg2.connect(url)


def fetch_transaction_agg(transaction_id: int):
    conn = get_db_conn()
    q = '''
    SELECT t.id as transaction_id, t.fecha_hora, t.total,
           COUNT(td.producto_id) as num_items,
           SUM(td.cantidad) as sum_qty,
           ARRAY_AGG(DISTINCT COALESCE(p.categories,'sin_categoria')) as categories_arr,
           COUNT(DISTINCT COALESCE(p.categories,'sin_categoria')) as unique_categories
    FROM transactions t
    INNER JOIN transaction_detail td ON td.transaction_id = t.id
    INNER JOIN products p ON td.producto_id = p.id
    WHERE t.id = %s
    GROUP BY t.id, t.fecha_hora, t.total
    '''
    df = pd.read_sql(q, conn, params=(transaction_id,))
    conn.close()
    if df.empty:
        return None
    df['fecha_hora'] = pd.to_datetime(df['fecha_hora'])
    df['hour'] = df['fecha_hora'].dt.hour
    df['day_of_week'] = df['fecha_hora'].dt.dayofweek
    # dominant category
    def dominant(cat_arr):
        if not cat_arr:
            return 'sin_categoria'
        try:
            if isinstance(cat_arr[0], list):
                flat = [c for sub in cat_arr for c in sub if c]
            else:
                flat = [c for c in cat_arr if c]
            from collections import Counter
            return Counter(flat).most_common(1)[0][0] if flat else 'sin_categoria'
        except Exception:
            return str(cat_arr[0]) if cat_arr else 'sin_categoria'
    df['dominant_category'] = df['categories_arr'].apply(dominant)
    return df.iloc[0]


def build_feature_row(row) -> dict:
    return {
        'total': float(row['total']) if row['total'] is not None else 0.0,
        'num_items': int(row['num_items']) if row['num_items'] is not None else 0,
        'sum_qty': int(row['sum_qty']) if row['sum_qty'] is not None else 0,
        'hour': int(row['hour']),
        'day_of_week': int(row['day_of_week']),
        'unique_categories': int(row['unique_categories']) if row['unique_categories'] is not None else 0,
        'dominant_category': row.get('dominant_category','sin_categoria')
    }


def predict(transaction_id: int):
    row = fetch_transaction_agg(transaction_id)
    if row is None:
        return {'predicted_type': 'Desconocido', 'confidence': 0.0, 'probabilities': {}, 'explanation': 'No hay detalles de la transacción.'}

    features = build_feature_row(row)

    try:
        import joblib
        obj = joblib.load(MODEL_PATH)
        if not isinstance(obj, dict):
            return {'predicted_type': 'Desconocido', 'confidence': 0.0, 'probabilities': {}, 'explanation': 'Modelo con formato inesperado.'}

        pipeline = obj.get('pipeline')
        le = obj.get('label_encoder')

        # Build DataFrame and use pipeline directly (it applies preprocessing)
        X_df = pd.DataFrame([features])

        probs = None
        if hasattr(pipeline, 'predict_proba'):
            probs = pipeline.predict_proba(X_df)[0]

        pred_raw = pipeline.predict(X_df)[0]
        # decode
        if le is not None:
            try:
                pred_label = le.inverse_transform([int(pred_raw)])[0]
            except Exception:
                # sometimes pipeline returns decoded labels already
                try:
                    pred_label = str(pred_raw)
                except Exception:
                    pred_label = 'Desconocido'
        else:
            pred_label = str(pred_raw)

        prob_map = {}
        if probs is not None:
            # map classes to labels
            if le is not None:
                labels = list(le.inverse_transform(list(range(len(probs)))))
                prob_map = {labels[i]: float(probs[i]) for i in range(len(probs))}
            elif hasattr(pipeline, 'classes_'):
                labels = list(pipeline.classes_)
                prob_map = {labels[i]: float(probs[i]) for i in range(len(probs))}
            else:
                prob_map = {str(i): float(probs[i]) for i in range(len(probs))}

        confidence = 0.0
        if prob_map:
            confidence = float(prob_map.get(pred_label, max(prob_map.values()))) * 100.0

        explanation = ''
        try:
            # try to get feature importances from inner estimator
            if hasattr(pipeline, 'named_steps') and 'clf' in pipeline.named_steps and hasattr(pipeline.named_steps['clf'], 'feature_importances_'):
                fi = pipeline.named_steps['clf'].feature_importances_
                top_idx = list(fi.argsort()[::-1][:3])
                explanation = 'Top feature indices: ' + ','.join([str(i) for i in top_idx])
        except Exception:
            explanation = ''

        return {'predicted_type': str(pred_label), 'confidence': confidence, 'probabilities': prob_map, 'explanation': explanation}
    except Exception as e:
        return {'predicted_type': 'Desconocido', 'confidence': 0.0, 'probabilities': {}, 'explanation': f'No model disponible ({str(e)})'}


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'transactionId required'}))
        sys.exit(1)
    tid = int(sys.argv[1])
    out = predict(tid)
    print(json.dumps(out))
