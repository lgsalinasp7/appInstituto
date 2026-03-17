🚀 Paso a paso: Cron Jobs con GitHub Actions → Vercel
Arquitectura del flujo
GitHub Actions (timer) → HTTP GET → tu API Route en Vercel → lógica de negocio

PASO 1 — Protege tu endpoint en Vercel
Antes de crear el workflow, protege tu API route para que solo GitHub (o tú) pueda dispararla.
En tu proyecto Next.js, crea o edita el endpoint:

// app/api/cron/facturacion/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Verificar el token secreto
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Tu lógica aquí
  console.log('Cron ejecutado:', new Date().toISOString());
  
  // Ejemplo: actualizar facturas pendientes
  // await actualizarFacturasPendientes();

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}
```

---

### PASO 2 — Agrega el secreto en Vercel

En tu dashboard de Vercel → tu proyecto → **Settings → Environment Variables**:
```
CRON_SECRET = un_string_aleatorio_muy_seguro_aqui

openssl rand -base64 32
```

---

### PASO 3 — Agrega el secreto en GitHub

Ve a tu repo en GitHub → **Settings → Secrets and variables → Actions → New repository secret**:
```
Name:  CRON_SECRET
Value: el_mismo_valor_que_pusiste_en_vercel
```

---

### PASO 4 — Crea el archivo del workflow de ejemplo

En tu proyecto, crea el archivo:
```
.github/workflows/cron-facturacion.yml

name: Cron - Facturación Diaria

on:
  schedule:
    - cron: '0 13 * * *'  # 8:00 AM Colombia (UTC-5) = 13:00 UTC
  workflow_dispatch:       # Permite ejecutarlo manualmente también

jobs:
  trigger-cron:
    runs-on: ubuntu-latest
    steps:
      - name: Llamar endpoint de facturación en Vercel
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://tu-app.vercel.app/api/cron/facturacion)
          
          echo "HTTP Status: $response"
          
          if [ "$response" != "200" ]; then
            echo "❌ El cron falló con status $response"
            exit 1
          fi
          
          echo "✅ Cron ejecutado correctamente"
```

---

### PASO 5 — Múltiples crons (uno por archivo o varios en uno)

**Opción A — Un archivo por cron** (más limpio, recomendado):
```
.github/workflows/cron-facturacion.yml
.github/workflows/cron-inventario.yml  
.github/workflows/cron-reportes.yml
.github/workflows/cron-recordatorios.yml

name: Crons AMAXOFT

on:
  schedule:
    - cron: '0 13 * * *'    # Facturación - 8am Colombia
    - cron: '0 14 * * 1'    # Reporte semanal - lunes 9am Colombia
    - cron: '*/30 * * * *'  # Sync inventario - cada 30 min

jobs:
  facturacion:
    if: github.event.schedule == '0 13 * * *'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger facturación
        run: |
          curl -f -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
          https://tu-app.vercel.app/api/cron/facturacion

  inventario:
    if: github.event.schedule == '*/30 * * * *'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger sync inventario
        run: |
          curl -f -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
          https://tu-app.vercel.app/api/cron/inventario


git add .github/workflows/
git commit -m "feat: add GitHub Actions cron jobs"
git push origin main