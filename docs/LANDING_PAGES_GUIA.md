# Guía de Landing Pages - Calet Academy

## 📋 Resumen

Sistema de 3 landing pages dinámicas para captar leads del Bootcamp Full Stack Developer con IA.

---

## 🎯 URLs de las Landing Pages

### 1. Super Programador (Poder con IA)
- **URL:** `/lp/super-programmer`
- **Enfoque:** Desarrolladores que quieren 10x su productividad con IA
- **Headline:** "Cómo programar 10x más rápido usando IA"
- **Mensaje WhatsApp:** "Hola! Vi la masterclass 'Cómo programar 10x más rápido usando IA' y quiero más información sobre el bootcamp."

### 2. Aprendizaje Acelerado (Anti-Universidad)
- **URL:** `/lp/accelerated-learning`
- **Enfoque:** Estudiantes frustrados con educación tradicional
- **Headline:** "Aprende a programar al ritmo del mercado tech, no del salón de clase"
- **Mensaje WhatsApp:** "Hola! Me interesa el bootcamp 'Al ritmo del mercado tech' y quiero saber cómo funciona."

### 3. Libertad Profesional (Trabajo Remoto)
- **URL:** `/lp/professional-freedom`
- **Enfoque:** Personas que buscan trabajo remoto y libertad
- **Headline:** "Tu camino hacia el trabajo remoto en tech"
- **Mensaje WhatsApp:** "Hola! Quiero información sobre el bootcamp para trabajo remoto en tech."

---

## 🏗️ Arquitectura

### Archivos Principales

```
src/
├── data/
│   └── landing-configs.ts          # Configuración de contenido (3 variaciones)
├── components/landing/
│   ├── HeroSection.tsx             # Hero con gradiente y CTA
│   ├── BenefitsSection.tsx         # 4 beneficios del bootcamp
│   ├── TechStackSection.tsx        # Stack tecnológico
│   ├── TestimonialsSection.tsx     # Testimonios de estudiantes
│   ├── MasterclassSection.tsx      # Info de masterclass gratuita
│   ├── WhatsAppCTA.tsx             # CTA de WhatsApp
│   ├── LandingFooter.tsx           # Footer
│   └── MetaPixel.tsx               # Tracking Meta Ads
└── app/lp/
    ├── layout.tsx                  # Layout sin auth
    └── [slug]/
        ├── page.tsx                # Server Component
        └── LandingPageClient.tsx   # Client Component (orquestador)
```

---

## ⚙️ Variables de Entorno

```bash
# Número de WhatsApp (formato internacional sin +)
WHATSAPP_PHONE_NUMBER="573046532363"

# Meta Pixel ID (opcional, para tracking de Meta Ads)
META_PIXEL_ID=""
```

---

## 🎨 Sistema de Diseño

Las landings mantienen la identidad visual de KaledSoft:

### Colores
- **Primary:** `#1e3a5f` (azul marino)
- **Accent:** `#3b82f6` (azul brillante para CTAs)
- **Success:** `#10b981` (verde para WhatsApp)

### Gradientes Únicos por Landing
- **Super Programador:** `from-blue-900 via-indigo-900 to-purple-900`
- **Aprendizaje Acelerado:** `from-cyan-900 via-blue-900 to-indigo-900`
- **Libertad Profesional:** `from-emerald-900 via-teal-900 to-cyan-900`

### Tipografías
- **Display (Títulos):** Sora
- **Sans (Cuerpo):** Geist Sans

---

## 📊 Tracking con Meta Pixel

### Eventos que se trackean automáticamente:

1. **PageView** - Al cargar la landing
2. **Lead** - Al hacer clic en cualquier CTA (Hero o Masterclass)
3. **CompleteRegistration** - (Pendiente: cuando se implemente formulario)

### Funciones helper disponibles:

```typescript
import { trackLead, trackEvent } from '@/components/landing/MetaPixel';

// Trackear Lead
trackLead();

// Trackear evento personalizado
trackEvent('CustomEvent', { param: 'value' });
```

---

## 🔗 Flujo de Conversión

```
Usuario visita landing (PageView)
    ↓
Clic en CTA "Quiero aprender con IA" (Lead)
    ↓
Abre WhatsApp con mensaje predefinido
    ↓
Agente Closer identifica origen por mensaje
    ↓
Conversación de cierre en WhatsApp
```

---

## 🛠️ Cómo Modificar el Contenido

### Editar textos de una landing:

Archivo: `src/data/landing-configs.ts`

```typescript
export const landingConfigs = {
  'super-programmer': {
    hero: {
      headline: 'Tu nuevo título aquí',
      subheadline: 'Tu subtítulo aquí',
      // ...
    },
    benefits: [
      {
        icon: 'Sparkles',
        title: 'Nuevo beneficio',
        description: 'Descripción del beneficio',
      },
      // ...
    ],
    // ...
  },
};
```

### Agregar nueva landing:

1. Agrega nueva configuración en `landing-configs.ts`
2. La ruta se genera automáticamente: `/lp/{tu-nuevo-slug}`

---

## 🎯 Meta Ads: Cómo Usar las Landings

### Campaña 1: Audiencia Técnica (Súper Programador)
- **URL:** `https://calet.academy/lp/super-programmer?utm_source=meta&utm_medium=cpc&utm_campaign=ai-developers`
- **Audiencia:** Programadores, estudiantes de CS, tech-curious
- **Creativos:** Enfocados en IA, productividad, herramientas modernas

### Campaña 2: Audiencia Frustrada (Aprendizaje Acelerado)
- **URL:** `https://calet.academy/lp/accelerated-learning?utm_source=meta&utm_medium=cpc&utm_campaign=career-change`
- **Audiencia:** Estudiantes universitarios, recién graduados
- **Creativos:** Contraste universidad vs bootcamp, velocidad de aprendizaje

### Campaña 3: Audiencia Aspiracional (Libertad Profesional)
- **URL:** `https://calet.academy/lp/professional-freedom?utm_source=meta&utm_medium=cpc&utm_campaign=remote-work`
- **Audiencia:** Profesionales buscando cambio, nómadas digitales
- **Creativos:** Trabajo remoto, libertad geográfica, dólares

---

## 📈 Métricas Clave a Monitorear

### En Meta Ads Manager:
- **CTR (Click-Through Rate)** por landing
- **CPC (Cost Per Click)** por variación
- **Conversión a Lead** (clic en CTA de WhatsApp)
- **CPL (Cost Per Lead)**

### En WhatsApp:
- **Tasa de respuesta** por mensaje predefinido
- **Identificar qué landing genera leads más calificados**

---

## 🚀 Testing A/B

Para saber qué landing convierte mejor:

1. **Semana 1:** Mismo presupuesto para las 3
2. **Analizar:** CTR, CPL, calidad de leads en WhatsApp
3. **Optimizar:** Aumentar presupuesto en la ganadora
4. **Iterar:** Ajustar textos de las que no funcionan

---

## 💡 Tips de Optimización

### Si Super Programador convierte mejor:
- Público objetivo: tech-savvy, buscan eficiencia
- Duplicar creativos enfocados en IA y productividad

### Si Aprendizaje Acelerado convierte mejor:
- Público objetivo: frustrados con educación tradicional
- Enfatizar velocidad y resultados tangibles

### Si Libertad Profesional convierte mejor:
- Público objetivo: buscan cambio de vida
- Enfatizar trabajo remoto y libertad geográfica

---

## 🔧 Troubleshooting

### Las landing no cargan:
```bash
# Reinicia el servidor de desarrollo
npm run dev
```

### WhatsApp no abre:
- Verifica que `WHATSAPP_PHONE_NUMBER` esté en formato internacional sin +
- Ejemplo correcto: `573046532363`

### Meta Pixel no trackea:
- Verifica que `META_PIXEL_ID` esté configurado en `.env`
- Revisa en Meta Events Manager si los eventos llegan

---

## 📝 Próximos Pasos Sugeridos

1. ✅ Configurar Meta Pixel ID cuando tengas tu cuenta de Meta Ads
2. ✅ Crear 3 campañas en Meta Ads (una por landing)
3. ✅ Configurar el Agente Closer en WhatsApp para reconocer los 3 mensajes
4. ✅ A/B testing durante 1 semana para identificar la landing ganadora
5. ✅ Iterar contenido según resultados

---

**Documentación creada:** 2026-02-21
**Última actualización:** 2026-02-21
