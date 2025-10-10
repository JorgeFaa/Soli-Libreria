#!/usr/bin/env bash
set -euo pipefail

command -v psql >/dev/null 2>&1 || { echo "Error: psql no está instalado o no está en PATH"; exit 1; }

JDBC="${DB_URL:-}"
if [[ -z "${JDBC}" ]]; then echo "Error: DB_URL no está definido"; exit 1; fi
if [[ -z "${DB_USER:-}" ]]; then echo "Error: DB_USER no está definido"; exit 1; fi
if [[ -z "${DB_PASSWORD:-}" ]]; then echo "Error: DB_PASSWORD no está definido"; exit 1; fi

HOST=$(printf "%s" "$JDBC" | sed -E 's|jdbc:postgresql://([^:/]+)(:([0-9]+))?/([^?]+).*|\1|')
PORT=$(printf "%s" "$JDBC" | sed -nE 's|jdbc:postgresql://[^:/]+:([0-9]+)/.*|\1|p')
DBNAME=$(printf "%s" "$JDBC" | sed -E 's|jdbc:postgresql://[^/]+/([^?]+).*|\1|')
PORT=${PORT:-5432}

export PGPASSWORD="${DB_PASSWORD}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

apply_file() {
  local in_file="$1"
  if [[ ! -f "$in_file" ]]; then
    echo "Omitido (no existe): $in_file"
    return 0
  fi
  local tmp
  tmp=$(mktemp)
  # Reemplaza separadores ^; por ; y salto de línea
  sed -E "s/\\^;[[:space:]]*/;\\n/g" "$in_file" > "$tmp"
  echo "Aplicando ${in_file#$ROOT_DIR/} en ${DBNAME} (${HOST}:${PORT})..."
  psql -v ON_ERROR_STOP=1 -h "$HOST" -p "$PORT" -U "$DB_USER" -d "$DBNAME" -f "$tmp" >/dev/null
  rm -f "$tmp"
}

# Construye la lista de archivos en orden lógico
declare -a ORDERED
ORDERED+=( "$ROOT_DIR/src/main/resources/schema.sql" )
ORDERED+=( "$ROOT_DIR/src/main/resources/procedures.sql" )
ORDERED+=( "$ROOT_DIR/src/main/resources/functions.sql" )
ORDERED+=( "$ROOT_DIR/src/main/resources/triggers.sql" )
ORDERED+=( "$ROOT_DIR/src/main/resources/views.sql" )

# Añade cualquier otro .sql en src/main/resources que no esté ya incluido
mapfile -t OTHERS < <(find "$ROOT_DIR/src/main/resources" -type f -name "*.sql" | sort)
for f in "${OTHERS[@]}"; do
  skip=0
  for g in "${ORDERED[@]}"; do
    if [[ "$f" == "$g" ]]; then skip=1; break; fi
  done
  if [[ $skip -eq 0 ]]; then
    ORDERED+=( "$f" )
  fi
done

# Aplica cada archivo existente
applied=0
for f in "${ORDERED[@]}"; do
  if [[ -f "$f" ]]; then
    apply_file "$f"
    applied=$((applied+1))
  fi
done

if [[ $applied -eq 0 ]]; then
  echo "No se encontraron archivos .sql para aplicar en $ROOT_DIR/src/main/resources"
  exit 1
fi

# Verificación básica de conexión
psql -v ON_ERROR_STOP=1 -h "$HOST" -p "$PORT" -U "$DB_USER" -d "$DBNAME" -c "SELECT current_database() AS db, current_user AS \"user\"" -A -t >/dev/null

echo "Listo. Archivos aplicados: $applied"
