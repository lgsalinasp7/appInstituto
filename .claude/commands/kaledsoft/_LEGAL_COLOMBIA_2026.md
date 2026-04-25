---
description: "Tarifas legales, tributarias y laborales Colombia 2026 — referencia para Amaxoft-Legal"
---

# Colombia 2026 — Referencia Legal, Tributaria y Laboral

> **Fuente de verdad para Amaxoft-Legal.** Actualizar cada enero al publicarse decreto de salario minimo y nueva UVT.
> Ultima revision: 2026-04-18

## Salario Minimo y Auxilios

| Concepto | Valor mensual COP 2026 | Fuente |
|---|---|---|
| Salario Minimo Legal Vigente (SMMLV) | **$1.423.500** | Decreto Min Trabajo (verificar valor exacto) |
| Auxilio de Transporte | **$200.000** (aprox, verificar) | Aplica a salarios <= 2 SMMLV |
| Salario integral (>= 13 SMMLV) | **$18.505.500** | Incluye prestaciones |
| Hora ordinaria (jornada 48 h/sem, 192 h/mes) | $7.414 / hora SMMLV | Calculo derivado |

> **NOTA**: cifras 2026 deben confirmarse con decreto oficial. Si decreto no esta publicado, usar valores 2025 + IPC esperado.

## UVT (Unidad de Valor Tributario)

| Ano | UVT | Aplicacion |
|---|---|---|
| 2026 | **~$50.000** (verificar valor DIAN) | Base para topes tributarios |
| 2025 | $49.799 | Referencia |

Topes comunes en UVT:
- Obligacion declarar renta persona natural: ingresos > 1.400 UVT (~$70M)
- Responsable IVA: ingresos > 3.500 UVT (~$175M)
- Regimen Simple Tributario: ingresos < 100.000 UVT (~$5.000M)

## IVA y Retenciones

| Concepto | Tarifa |
|---|---|
| IVA general | **19%** |
| IVA reducido (algunos servicios/bienes) | 5% |
| IVA exento | 0% |
| IVA excluido | No aplica |

### Retencion en la Fuente (renta)

| Concepto | Tarifa | Base minima |
|---|---|---|
| Servicios generales declarante | 4% | 4 UVT |
| Servicios generales no declarante | 6% | 4 UVT |
| Honorarios y comisiones declarante | 11% | Sin base |
| Honorarios y comisiones no declarante | 10% | Sin base |
| Compras declarante | 2.5% | 27 UVT |
| Arrendamiento bienes muebles | 4% | Sin base |
| Arrendamiento bienes inmuebles | 3.5% | 27 UVT |

### ICA (Impuesto Industria y Comercio) — Bogota

| Actividad | Tarifa por mil |
|---|---|
| Servicios profesionales (incluye software) | 9.66 x 1000 |
| Comercio | 4.14 - 11.04 x 1000 |
| Industrial | 4.14 - 11.04 x 1000 |

> Otros municipios tienen tarifas distintas. Verificar segun ciudad del cliente.

### Retencion ICA (ReteICA Bogota)

- Servicios: 9.66 x 1000 sobre la base, retenido por el contratante.

## Costos Laborales (Empleado Vinculado)

### Factor Prestacional Colombia

```
Salario base:                          100.00%
+ Cesantias (8.33%)                    108.33%
+ Intereses cesantias (1%)             109.33%
+ Prima servicios (8.33%)              117.66%
+ Vacaciones (4.17%)                   121.83%
+ Salud empleador (8.5%)               130.33%
+ Pension empleador (12%)              142.33%
+ ARL clase I (0.522%)                 142.86%
+ Parafiscales (9% si >10 SMMLV)*      151.86%
+ Dotacion (estimado 1%)               152.86%
                                       =======
Factor total aprox:                   ~1.50 - 1.59
```

*Empresas pequenas (<10 SMMLV total nomina) estan exentas de SENA, ICBF y CCF para empleados que ganan menos de 10 SMMLV.

### Costo Real Hora-Hombre

```
Costo hora = (Salario + Aux Transporte) * Factor / 192 horas
```

Ejemplos (con factor 1.55):

| Cargo | Salario base | Costo hora real | Costo dia (8h) |
|---|---|---|---|
| Junior dev (2 SMMLV) | $2.847.000 | $22.978 | $183.825 |
| Mid dev (4 SMMLV) | $5.694.000 | $45.957 | $367.650 |
| Senior dev (8 SMMLV) | $11.388.000 | $91.913 | $735.300 |
| Lead/Architect (12 SMMLV) | $17.082.000 | $137.870 | $1.102.960 |

## Contratistas (Prestacion de Servicios)

Persona natural sin vinculo laboral:
- **No paga** prestaciones empleador
- **El contratista paga su propia** seguridad social: salud (12.5%) + pension (16%) sobre IBC = 40% del valor del contrato
- **Tarifa hora suele ser 1.5-2x** la de empleado equivalente
- **Retencion en fuente**: 10-11% (honorarios) si ingresos > limite

### Tarifas Mercado Software Colombia 2026 (referencia, ajustar segun caso)

| Perfil | Tarifa hora COP (referencia mercado) |
|---|---|
| Junior dev (0-2 anos) | $35.000 - $60.000 |
| Mid dev (2-5 anos) | $60.000 - $120.000 |
| Senior dev (5+ anos) | $120.000 - $200.000 |
| Tech Lead / Arquitecto | $180.000 - $300.000 |
| QA Manual | $40.000 - $80.000 |
| QA Automation | $80.000 - $150.000 |
| DevOps / Infra | $100.000 - $200.000 |
| PO / PM | $100.000 - $200.000 |

## Regimen Simple de Tributacion (RST)

Beneficios:
- Reemplaza renta + ICA + INC + algunos
- Tarifa unica entre 1.8% - 14.5% segun actividad
- Software/Servicios: tarifa entre 5.9% - 7.3% segun ingresos

Requisitos:
- Persona natural con ingresos < 100.000 UVT (~$5.000M)
- Persona juridica con ingresos < 100.000 UVT
- Inscribirse antes del 28 febrero del ano gravable

## Facturacion Electronica DIAN

Obligatorio desde 2020 para todos los responsables de IVA.

Requiere:
- RUT actualizado con responsabilidades correctas
- Software de facturacion (proveedor tecnologico autorizado: Siigo, Alegra, Facture, etc.)
- Numeracion autorizada (NSU + CUFE)
- Envio en tiempo real (XML + PDF firmado)

## Propiedad Intelectual Software (Ley 23/1982 + Decision Andina 351)

Reglas clave:
- Software protegido como **obra literaria** (no patente)
- **Derechos morales**: del autor, irrenunciables, perpetuos
- **Derechos patrimoniales**: pueden cederse total o parcialmente
- **Obra por encargo**: si se contrata desarrollo, los derechos patrimoniales se ceden al contratante SI el contrato lo establece expresamente. Si NO lo dice, los retiene el autor (developer).
- **Obra de empleado**: derechos patrimoniales del empleador automaticamente (Art. 20 Ley 23/1982)

**Clausula obligatoria en contrato desarrollo software**:
> "El CONTRATISTA cede al CONTRATANTE todos los derechos patrimoniales sobre el software desarrollado, incluyendo reproduccion, distribucion, modificacion, traduccion y comunicacion publica, por el tiempo maximo de proteccion legal y para todo el territorio mundial."

## Habeas Data (Ley 1581/2012 + Decreto 1377/2013)

Si el software trata datos personales:
- Politica de tratamiento de datos publica
- Aviso de privacidad al titular
- Autorizacion previa, expresa e informada
- Registro de bases de datos en SIC (si es responsable del tratamiento con > 100k titulares o datos sensibles)
- Encargado del tratamiento debe firmar contrato de transmision

## Plantillas Disponibles (a crear segun se necesiten)

- [ ] Contrato prestacion servicios (persona natural)
- [ ] Contrato desarrollo software a la medida
- [ ] Contrato licencia SaaS (cliente final)
- [ ] NDA bilateral
- [ ] Contrato laboral termino indefinido
- [ ] Contrato obra/labor
- [ ] Acuerdo de nivel de servicio (SLA)
- [ ] Politica de tratamiento de datos
- [ ] Aviso de privacidad

## Cliente Cartagena (referencia)

- Razon social: (pendiente de confirmar con usuario)
- NIT: (pendiente)
- Tipo contrato: (a definir — desarrollo a medida vs SaaS)
- Estado: en desarrollo activo, sin contrato formal aun

## TODO Mantenimiento

- [ ] Confirmar SMMLV 2026 con decreto oficial Min Trabajo
- [ ] Confirmar UVT 2026 con resolucion DIAN
- [ ] Confirmar auxilio transporte 2026
- [ ] Cargar plantillas de contratos cuando se generen
- [ ] Documentar primer contrato real (Cartagena u otro) como caso base

## Disclaimer

Este documento es una guia de referencia para automatizacion. **No reemplaza asesoria de abogado o contador certificado humano**. Antes de firmar contratos o presentar declaraciones, consultar profesional habilitado en Colombia.
