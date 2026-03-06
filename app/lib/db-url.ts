export function getDatabaseUrl() {
  const url =
    process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.NEON_DATABASE_URL;

  if (!url) {
    throw new Error(
      "No se encontró URL de base de datos. Configura DATABASE_URL (o POSTGRES_URL/NEON_DATABASE_URL) y reinicia el servidor.",
    );
  }

  return url;
}
