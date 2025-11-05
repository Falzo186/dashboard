#!/usr/bin/env python3
"""
main.py

Script educativo que demuestra el flujo completo:
 - Crea o carga un dataset de ejemplo (usa dataset_cliente.DatasetCliente)
 - Entrena un modelo de árbol (ModeloCliente)
 - Usa PredictorCliente para predecir sobre nuevas filas de ejemplo

Instrucciones:
  python main.py

"""
import os
import pandas as pd

from dataset_cliente import DatasetCliente
from modelo_cliente import ModeloCliente
from predictor_cliente import PredictorCliente
import pandas as pd
import numpy as np


def ejemplo_flux():
    # 1) Intentar cargar dataset desde la tabla aprendizaje_clientes
    ds = DatasetCliente()
    try:
        df = ds.load()
        print(f'Dataset cargado desde DB: {len(df)} filas')
    except Exception as e:
        print('No se pudo cargar dataset desde BD:', e)
        df = pd.DataFrame()

    # Si no hay suficientes filas, generar dataset sintético para fines educativos
    if df.empty or len(df) < 50:
        n = 500
        print(f'Generando dataset sintético de {n} filas para entrenamiento...')
        rng = np.random.default_rng(42)
        métodos = ['efectivo', 'tarjeta', 'transferencia']
        tipos = ['Niño', 'Joven', 'Adulto']
        df = pd.DataFrame({
            'ticket_id': [f'syn-{i}' for i in range(n)],
            'metodo_pago': rng.choice(métodos, size=n),
            'total': (rng.normal(50000, 40000, size=n).clip(min=100)).astype(float),
            'num_items': rng.integers(1, 10, size=n).astype(int),
            'tipo_cliente': rng.choice(tipos, size=n, p=[0.15, 0.45, 0.40])
        })

    # Asegurarse de que existen las columnas requeridas
    required = ['metodo_pago', 'total', 'num_items', 'tipo_cliente']
    if not all(c in df.columns for c in required):
        print('Dataset no contiene las columnas requeridas. Revisa dataset_cliente.py')
        return

    # 2) Entrenar modelo educativo (RandomForest en este ejemplo)
    mc = ModeloCliente()
    metrics = mc.train(df)
    # metrics already contains accuracy and classification report; print a concise summary
    print('\nMétricas de entrenamiento (resumen):')
    print(f"Exactitud (accuracy): {metrics.get('accuracy'):.4f}")
    print('Clases: Niño, Joven, Adulto')

    # 3) Predecir con el modelo guardado (si existe)
    try:
        predictor = PredictorCliente()
        sample_rows = df.sample(5, random_state=42)
        sample = sample_rows.drop(columns=['tipo_cliente'])
        out = predictor.predict(sample)

        # Construir tabla de resultados legible
        preds = out.get('predictions', [])
        confs = out.get('confidences', [])
        print('\nPredicciones sobre 5 ejemplos:')
        print('{:<12} {:<12} {:>12}'.format('ticket_id', 'tipo_cliente', 'confianza (%)'))
        for i, row in sample_rows.reset_index(drop=True).iterrows():
            tid = row.get('ticket_id', f'idx-{i}')
            tipo = preds[i] if i < len(preds) else 'N/A'
            conf = confs[i] if i < len(confs) else 0.0
            print('{:<12} {:<12} {:>12.2f}'.format(str(tid), str(tipo), float(conf)))
    except Exception as e:
        print('No se pudo ejecutar predict (modelo inexistente o incompatible):', e)


if __name__ == '__main__':
    ejemplo_flux()
