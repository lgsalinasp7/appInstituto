#!/bin/bash

# Script para verificar y encontrar archivos sensibles antes de commit

echo "🔍 Buscando archivos sensibles..."

# Buscar archivos de claves SSH
find . -name "id_rsa" -o -name "id_rsa.pub" -o -name "id_ed25519" -o -name "id_ed25519.pub" -o -name "*.pem" -o -name "*.key" 2>/dev/null | grep -v node_modules | grep -v .git

# Buscar en el historial de Git
echo ""
echo "📜 Buscando en el historial de Git..."
git log --all --full-history --source -- "*id_rsa*" "*id_ed25519*" "*.pem" "*.key" 2>/dev/null

echo ""
echo "✅ Verificación completada"
echo ""
echo "Si encontraste archivos sensibles, NO los subas a Git."
echo "Usa el archivo SECURITY_FIX.md para eliminarlos del historial."
