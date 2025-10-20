// backend/src/config/prisma.ts
// ✅ SINGLETON: Una sola instancia de PrismaClient para toda la aplicación

import { PrismaClient } from '@prisma/client';

// ✅ Configuración de variables de entorno
const NODE_ENV = process.env.NODE_ENV || 'development';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('❌ DATABASE_URL no está definida en las variables de entorno');
}

// ✅ Configuración optimizada del pool de conexiones
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
    log: NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
    
    // ✅ CRITICAL: Configuración del connection pool
    // Ajusta según tu servidor PostgreSQL
    // Por defecto Prisma usa: connection_limit = num_physical_cpus * 2 + 1
    // En tu caso con 13 conexiones, aumenta el pool size
  });
};

// ✅ Patrón Singleton con type safety
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// ✅ En desarrollo reutiliza la conexión para evitar hot-reload issues
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// ✅ Graceful shutdown
process.on('beforeExit', async () => {
  console.log('🔌 Cerrando conexiones de Prisma...');
  await prisma.$disconnect();
});

// ✅ Exportar la única instancia
export { prisma };

// ✅ Función helper para verificar la conexión
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexión a PostgreSQL establecida');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error);
    return false;
  }
}