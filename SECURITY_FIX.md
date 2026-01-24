# 🔒 SOLUCIÓN: Eliminar Clave SSH Expuesta del Historial de Git

## ⚠️ ACCIÓN INMEDIATA REQUERIDA

GitGuardian detectó una clave privada OpenSSH expuesta en tu repositorio. **Debes eliminarla del historial de Git inmediatamente.**

## Pasos para Resolver el Problema

### 1. **ROTAR LA CLAVE SSH (CRÍTICO - HAZLO PRIMERO)**

La clave expuesta está comprometida. Debes generar una nueva:

```bash
# Generar nueva clave SSH
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"

# O si prefieres RSA
ssh-keygen -t rsa -b 4096 -C "tu-email@ejemplo.com"
```

**Luego:**
- Agrega la nueva clave pública a GitHub: https://github.com/settings/keys
- Elimina la clave antigua de GitHub
- Actualiza cualquier servidor que use la clave antigua

### 2. **Eliminar la Clave del Historial de Git**

#### Opción A: Usando git filter-branch (Recomendado)

```bash
# Reemplaza 'nombre-del-archivo' con el nombre real del archivo de la clave
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch nombre-del-archivo" \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push (CUIDADO: esto reescribe el historial)
git push origin --force --all
git push origin --force --tags
```

#### Opción B: Usando BFG Repo-Cleaner (Más fácil)

```bash
# Descargar BFG: https://rtyley.github.io/bfg-repo-cleaner/

# Eliminar el archivo específico
java -jar bfg.jar --delete-files nombre-del-archivo

# O eliminar por contenido
java -jar bfg.jar --delete-files id_rsa

# Limpiar referencias
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Forzar push
git push origin --force --all
```

### 3. **Verificar que se Eliminó**

```bash
# Buscar en el historial
git log --all --full-history -- nombre-del-archivo

# Si no aparece nada, está eliminado
```

### 4. **Notificar a GitGuardian**

1. Ve a tu dashboard de GitGuardian
2. Marca el incidente como "Resuelto"
3. Confirma que la clave fue rotada

## Prevención Futura

✅ El archivo `.gitignore` ya está actualizado para ignorar:
- `*.key`, `*.pem`
- `id_rsa*`, `id_ed25519*`, `id_ecdsa*`
- `.ssh/` y otros archivos sensibles

## ⚠️ ADVERTENCIAS

- **NUNCA** subas claves privadas a Git
- **SIEMPRE** usa variables de entorno para secretos
- **ROTA** cualquier clave que haya sido expuesta
- El `--force` push reescribe el historial - coordina con tu equipo

## Recursos Adicionales

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [GitGuardian Best Practices](https://www.gitguardian.com/)
