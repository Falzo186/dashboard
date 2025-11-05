#!/usr/bin/env python3
"""
modelo_cliente.py

Entrena un DecisionTreeClassifier (scikit-learn) usando columnas:
  - metodo_pago (categórica)
  - total (numérica)
  - num_items (numérica)

Este archivo sirve como ejemplo educativo de aprendizaje supervisado.

Comentarios en español explicativos incluidos en el código.
"""

import os
from typing import Dict
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report


MODEL_PATH = os.path.join(os.path.dirname(__file__), 'modelo_arbol_cliente.pkl')


class ModeloCliente:
    """
    Clase que construye y entrena un árbol de decisión para predecir tipo_cliente.

    Aprendizaje supervisado (breve):
    - En aprendizaje supervisado tenemos ejemplos (X, y). X son las características
      (p. ej. método de pago, total, número de items) y y es la etiqueta conocida
      (tipo_cliente).
    - El algoritmo (aquí DecisionTree) busca patrones en X que permitan predecir y.
    - El árbol divide el espacio de características en reglas (if/else) formando
      hojas que asignan una clase.
    - Aquí usamos esto con fines educativos: mostrar el flujo completo.
    """

    def __init__(self):
        self.cat_cols = ['metodo_pago']
        self.num_cols = ['total', 'num_items']
        self.pipe = None

    def _build_pipeline(self) -> Pipeline:
        preproc = ColumnTransformer([
            ('num', StandardScaler(), self.num_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), self.cat_cols)
        ])
        # Use a RandomForest for more stable, probabilistic outputs (predict_proba)
        clf = RandomForestClassifier(n_estimators=100, random_state=42)
        pipe = Pipeline([
            ('pre', preproc),
            ('clf', clf)
        ])
        return pipe

    def train(self, df: pd.DataFrame) -> Dict:
        """
        Entrena el modelo con división 80/20 y devuelve métricas.
        Guarda el pipeline en disco en `modelo_arbol_cliente.pkl`.
        """
        X = df[self.cat_cols + self.num_cols]
        y = df['tipo_cliente']

        # Split (intento de estratificar si hay suficientes clases)
        strat = y if len(y.unique()) > 1 and len(y) >= len(y.unique()) * 2 else None
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=strat)

        self.pipe = self._build_pipeline()
        self.pipe.fit(X_train, y_train)

        y_pred = self.pipe.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred)
        # Force the report to include our three target classes in fixed order
        labels = ['Niño', 'Joven', 'Adulto']
        report = classification_report(y_test, y_pred, labels=labels, zero_division=0)

        # Guardar modelo
        joblib.dump(self.pipe, MODEL_PATH)

        # Salida educativa
        print('=== Resultados del entrenamiento (Random Forest educativo) ===')
        print(f'Exactitud (accuracy): {acc:.4f}')
        print('Matriz de confusión:')
        print(cm)
        print('\nReporte por clase:')
        print(report)
        print(f'Modelo guardado en: {MODEL_PATH}')

        return {
            'accuracy': float(acc),
            'confusion_matrix': cm.tolist(),
            'classification_report': report,
            'model_path': MODEL_PATH
        }

    def load(self, path: str = MODEL_PATH):
        self.pipe = joblib.load(path)
        return self.pipe


if __name__ == '__main__':
    print('Este módulo define la clase ModeloCliente. Ejecuta main.py para el flujo completo.')
