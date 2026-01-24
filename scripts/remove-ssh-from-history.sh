#!/bin/bash

# Script para eliminar archivos SSH del historial de Git
# Ejecutar desde el directorio raíz del repositorio

echo "⚠️  ADVERTENCIA: Este script reescribirá el historial de Git"
echo "Asegúrate de haber rotado tus claves SSH antes de continuar"
echo ""
read -p "¿Continuar? (s/N): " confirm

if [[ ! $confirm =~ ^[Ss]$ ]]; then
    echo "Operación cancelada"
    exit 1
fi

echo ""
echo "🗑️  Eliminando archivos SSH del historial..."

# Eliminar archivos específicos
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch id_github_lgsalinasp id_github_lgsalinasp.pub" \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "🧹 Limpiando referencias..."

# Limpiar referencias
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ Archivos eliminados del historial local"
echo ""
echo "⚠️  IMPORTANTE: Ahora debes hacer force push:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "⚠️  ADVERTENCIA: Coordina con tu equipo antes del force push"
