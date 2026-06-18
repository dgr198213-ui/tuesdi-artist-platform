#!/bin/bash
# Script para configurar pre-commit hooks con husky y lint-staged
# Ejecutar: bash .husky-setup.sh

set -e

echo "🔧 Configurando pre-commit hooks..."

# Instalar husky
pnpm add -D husky lint-staged

# Inicializar husky
npx husky install

# Crear pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# Crear pre-push hook (opcional, para validación adicional)
npx husky add .husky/pre-push "pnpm run check"

echo "✅ Pre-commit hooks configurados exitosamente"
echo ""
echo "Hooks instalados:"
echo "  • pre-commit: ejecuta lint-staged (eslint, prettier)"
echo "  • pre-push: ejecuta type checking (tsc)"
echo ""
echo "Para deshabilitar temporalmente:"
echo "  git commit --no-verify"
