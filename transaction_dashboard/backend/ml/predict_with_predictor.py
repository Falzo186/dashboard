#!/usr/bin/env python3
import sys
import json
import os
from typing import Any

ROOT = os.path.dirname(__file__)
MODEL_PATH = os.path.join(ROOT, 'modelo_arbol_cliente.pkl')

def ensure_model():
    # If model missing, try to train by calling main.py
    if not os.path.exists(MODEL_PATH):
        main_script = os.path.join(ROOT, 'main.py')
        if os.path.exists(main_script):
            print('Model not found, training via main.py...', file=sys.stderr)
            # run main.py (it will generate modelo_arbol_cliente.pkl)
            import subprocess
            subprocess.check_call([sys.executable, main_script])
        else:
            raise FileNotFoundError('Modelo no encontrado y main.py no existe')


def predict_from_args(args) -> dict:
    # expect: metodo_pago total num_items
    from predictor_cliente import PredictorCliente
    metodo_pago = args[0]
    total = float(args[1]) if len(args) > 1 else 0.0
    num_items = int(float(args[2])) if len(args) > 2 else 0

    # Build a DataFrame-like structure expected by PredictorCliente
    import pandas as pd
    df = pd.DataFrame([{
        'metodo_pago': metodo_pago,
        'total': total,
        'num_items': num_items
    }])

    # Ensure model exists
    ensure_model()

    # load predictor (it will load modelo_arbol_cliente.pkl by default)
    pred = PredictorCliente()
    out = pred.predict(df)

    # out may contain: 'predictions', 'probabilities' and/or 'confidences'
    pred_label = out.get('predictions', ['Desconocido'])[0]
    probs = out.get('probabilities')
    confidences = out.get('confidences')

    confidence = 0.0
    # Prefer confidences returned directly by the predictor
    if confidences and len(confidences) > 0:
        try:
            confidence = float(confidences[0])
        except Exception:
            confidence = 0.0
    else:
        # Fallback: compute from probabilities (could be list or dict)
        if probs is not None and len(probs) > 0:
            row = probs[0]
            try:
                import numpy as _np
                if isinstance(row, dict):
                    vals = _np.array(list(row.values()), dtype=float)
                else:
                    vals = _np.array(row, dtype=float)
                if not _np.isnan(vals).all():
                    confidence = float(_np.nanmax(vals)) * 100.0
                else:
                    confidence = 0.0
            except Exception:
                # Last resort: try builtin max
                try:
                    confidence = float(max([float(x) for x in (row if isinstance(row, list) else list(row.values()))])) * 100.0
                except Exception:
                    confidence = 0.0

    # Normalize Empresa -> Adulto
    if pred_label == 'Empresa':
        pred_label = 'Adulto'

    # Convert probabilities to a consistent dict of class->prob (0..100)
    probs_out = None
    if probs is not None and len(probs) > 0:
        row = probs[0]
        if isinstance(row, dict):
            probs_out = {k: float(v) * 100.0 for k, v in row.items()}
        else:
            # If classes available via PredictorCliente we can't access here; return raw list scaled
            try:
                probs_out = [float(x) * 100.0 for x in row]
            except Exception:
                probs_out = None

    return {
        'predicted_type': pred_label,
        'confidence': round(float(confidence), 2),
        'probabilities': probs_out or {},
        'explanation': 'PredictorCliente (forest model)'
    }


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'args required: metodo_pago total num_items'}))
        sys.exit(1)
    try:
        result = predict_from_args(sys.argv[1:])
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(2)
