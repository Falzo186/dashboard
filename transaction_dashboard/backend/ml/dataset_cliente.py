#!/usr/bin/env python3
"""
dataset_cliente.py

Clase que conecta a PostgreSQL y devuelve un DataFrame listo para entrenamiento.

La tabla esperada es `aprendizaje_clientes` con columnas:
  - ticket_id
  - metodo_pago
  - total
  - num_items
  - tipo_cliente

Usa variables de entorno si no se pasan parámetros explícitos.
"""

import os
from typing import Optional
import pandas as pd
import psycopg2
from urllib.parse import urlparse, parse_qs


class DatasetCliente:
    """
    Carga la tabla `aprendizaje_clientes` desde Postgres y devuelve
    un DataFrame limpio y tipado para entrenamiento.
    """

    def __init__(self,
                 host: Optional[str] = None,
                 port: Optional[str] = None,
                 user: Optional[str] = None,
                 password: Optional[str] = None,
                 database: Optional[str] = None):
        # Preferir variables de entorno ya definidas en el entorno del proyecto
        # If DATABASE_URL present, parse it (handles postgres://user:pass@host:port/dbname?query)
        dburl = os.environ.get('DATABASE_URL')
        if dburl:
            try:
                parsed = urlparse(dburl)
                # parsed.path may include leading '/dbname'
                dbname = parsed.path[1:] if parsed.path and parsed.path.startswith('/') else parsed.path
                self.host = parsed.hostname or host or os.environ.get('PGHOST', 'localhost')
                self.port = str(parsed.port) if parsed.port else (port or os.environ.get('PGPORT', '5432'))
                self.user = parsed.username or user or os.environ.get('PGUSER', 'postgres')
                self.password = parsed.password or password or os.environ.get('PGPASSWORD', '')
                self.database = dbname or database or os.environ.get('PGDATABASE', 'postgres')
            except Exception:
                # fallback to individual env vars
                self.host = host or os.environ.get('PGHOST', 'localhost')
                self.port = port or os.environ.get('PGPORT', '5432')
                self.user = user or os.environ.get('PGUSER', 'postgres')
                self.password = password or os.environ.get('PGPASSWORD', '')
                self.database = database or os.environ.get('PGDATABASE', 'postgres')
        else:
            self.host = host or os.environ.get('PGHOST', 'localhost')
            self.port = port or os.environ.get('PGPORT', '5432')
            self.user = user or os.environ.get('PGUSER', 'postgres')
            self.password = password or os.environ.get('PGPASSWORD', '')
            self.database = database or os.environ.get('PGDATABASE', 'postgres')

    def _get_connection(self):
        return psycopg2.connect(host=self.host, port=self.port, user=self.user,
                                password=self.password, dbname=self.database)

    def load(self) -> pd.DataFrame:
        """
        Lee la tabla `aprendizaje_clientes` y devuelve un DataFrame con
        columnas correctas y limpieza mínima.
        """
        sql = """
        SELECT ticket_id, metodo_pago, total::double precision as total,
               num_items::integer as num_items, tipo_cliente
        FROM aprendizaje_clientes
        """
        conn = self._get_connection()
        try:
            df = pd.read_sql_query(sql, conn)
        finally:
            conn.close()

        # Limpieza mínima: quitar filas con campos clave nulos
        df = df.dropna(subset=['ticket_id', 'metodo_pago', 'total', 'num_items', 'tipo_cliente'])

        # Tipado y formatos
        df['ticket_id'] = df['ticket_id'].astype(str)
        df['metodo_pago'] = df['metodo_pago'].astype(str)
        df['total'] = pd.to_numeric(df['total'], errors='coerce').fillna(0.0)
        df['num_items'] = pd.to_numeric(df['num_items'], errors='coerce').fillna(0).astype(int)
        df['tipo_cliente'] = df['tipo_cliente'].astype(str)

        return df


if __name__ == '__main__':
    # Pequeña prueba local (no falla si la BD o tabla no existen)
    try:
        ds = DatasetCliente()
        df = ds.load()
        print(f"Filas cargadas: {len(df)}")
        print(df.head(3).to_string())
    except Exception as e:
        print("Error cargando dataset (verifica conexión/tabla):", e)
