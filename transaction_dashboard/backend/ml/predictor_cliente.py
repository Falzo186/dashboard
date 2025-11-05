#!/usr/bin/env python3
"""
predictor_cliente.py

Ejemplo educativo: carga un pipeline guardado (modelo_arbol_cliente.pkl) y
expone una función `predict` que toma un DataFrame con las columnas necesarias
y devuelve predicciones y probabilidades (si el clasificador las soporta).

Explicación corta:
 - Para modelos scikit-learn que no implementan `predict_proba`, devolvemos
   None en probabilities. Esto es normal para árboles de decisión simples.
"""

import os
from typing import Dict, Any
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'modelo_arbol_cliente.pkl')


class PredictorCliente:
    def __init__(self, model_path: str = MODEL_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f'Modelo no encontrado en {model_path}. Entrena primero con modelo_cliente.py o main.py')
        self.pipe = joblib.load(model_path)

    def predict(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Devuelve predicciones y (si está disponible) probabilidades.

        Entrada: df con columnas ['metodo_pago', 'total', 'num_items']
        Salida: dict {'predictions': [...], 'probabilities': [...]/None}
        """
        X = df.copy()
        preds = self.pipe.predict(X)

        # Intentar obtener probabilidades de clase
        probs = None
        classes = None
        try:
            # Pipeline delegará predict_proba al estimador final si existe
            if hasattr(self.pipe, 'predict_proba'):
                probs = self.pipe.predict_proba(X)
            else:
                # intentar acceder al estimador final
                final = getattr(self.pipe, 'named_steps', None)
                if final and 'clf' in final and hasattr(final['clf'], 'predict_proba'):
                    probs = final['clf'].predict_proba(self.pipe.named_steps['pre'].transform(X))
        except Exception:
            probs = None

        # obtener nombres de clases si es posible
        try:
            final = getattr(self.pipe, 'named_steps', None)
            if final and 'clf' in final and hasattr(final['clf'], 'classes_'):
                classes = list(final['clf'].classes_)
        except Exception:
            classes = None

        confidences = []
        probs_list = None
        if probs is not None:
            probs = np.asarray(probs)
            probs_list = []
            for i in range(probs.shape[0]):
                p = probs[i]
                # si hay NaNs, usar nanmax para obtener la mayor probabilidad disponible
                if not np.isnan(p).all():
                    conf = float(np.nanmax(p)) * 100.0
                else:
                    conf = 0.0
                confidences.append(conf)
                if classes is not None:
                    probs_list.append({str(c): float(p[idx]) for idx, c in enumerate(classes)})
                else:
                    probs_list.append([float(x) for x in p])
        else:
            # No hay probabilidades: confianza desconocida -> 0
            confidences = [0.0 for _ in range(len(preds))]

        return {
            'predictions': preds.tolist() if hasattr(preds, 'tolist') else list(preds),
            'probabilities': probs_list,
            'confidences': confidences
        }


if __name__ == '__main__':
    print('Ejemplo: usa PredictorCliente desde main.py proporcionando un DataFrame de ejemplo.')
