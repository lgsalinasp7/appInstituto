# Replacement Tables

Tablas de mapeo para convertir exportaciones Visily a páginas Next.js. Ajustar según la librería UI del proyecto (shadcn, MUI, Tailwind puro, etc.).

## Icon Replacement (@iconify/react -> lucide-react)

| Visily/Iconify                 | lucide-react             |
| ------------------------------ | ------------------------ |
| material-symbols:home          | Home                     |
| material-symbols:dashboard     | LayoutDashboard          |
| material-symbols:calendar       | Calendar, CalendarPlus   |
| material-symbols:person         | User, Users              |
| material-symbols:settings       | Settings                 |
| material-symbols:search         | Search                   |
| material-symbols:add           | Plus                     |
| material-symbols:close         | X                        |
| material-symbols:check         | Check, CheckCircle2      |
| material-symbols:edit           | Pencil                   |
| material-symbols:delete        | Trash2                   |
| material-symbols:filter         | Filter                   |
| material-symbols:print         | Printer                  |
| material-symbols:more-horiz     | MoreHorizontal           |
| material-symbols:arrow-back     | ArrowLeft                |
| material-symbols:arrow-forward  | ArrowRight               |
| material-symbols:chevron-right | ChevronRight             |
| material-symbols:info           | Info                     |
| material-symbols:warning        | AlertTriangle            |
| material-symbols:phone          | Phone                    |
| material-symbols:mail           | Mail                     |
| material-symbols:credit-card    | CreditCard               |
| material-symbols:file           | FileText                 |
| material-symbols:restaurant     | UtensilsCrossed, ChefHat |
| material-symbols:music-note      | Music                    |
| SVG circles/custom shapes       | Map by semantic meaning  |

Cuando no hay coincidencia exacta, elegir el icono lucide-react más cercano por significado semántico.

## Font Replacement

| Visily                 | Next.js / Tailwind |
| ---------------------- | ------------------ |
| `font-['Epilogue']`    | `font-sans`        |
| `font-['Inter']`       | `font-sans`        |
| `font-['Roboto']`      | `font-sans`        |
| Cualquier font-family  | `font-sans` o la fuente del proyecto |

## Component Replacement (shadcn por defecto)

| Patrón Visily                         | Equivalente genérico                                      |
| ------------------------------------- | --------------------------------------------------------- |
| `<input className="bg-gray-100...">`   | Input inline con `bg-[#f3f4f6]` o componente Input del proyecto |
| `<input>` con borde                   | `<Input>` de `@/components/ui/input` (shadcn)              |
| `<select>`                            | `<Select>` de `@/components/ui/select` o SelectField inline |
| Toggle custom `<button>`               | `<Switch>` de `@/components/ui/switch`                    |
| Pills/badges de estado                | Componente Badge del proyecto o inline                    |
| Gráficos (bar, line, pie)             | Recharts o componente de charts del proyecto             |
| Modal/dialog overlays                 | `<Dialog>` de `@/components/ui/dialog`                    |
| Cards con sombra                      | `<Card>` de `@/components/ui/card` o div con clases       |

**Regla**: Si el proyecto no tiene shadcn, usar divs con Tailwind. Adaptar imports según `uiLibrary` en config.

## Color Palette (default)

### Primary Blues

| Token          | Hex       | Uso                                   |
| -------------- | --------- | ------------------------------------- |
| primary        | `#4b7bec` | Botones, links, badges activos        |
| primary-hover  | `#3a6ad4` | Hover de botones                      |
| blue-bg-light  | `#f1f5fe` | Fondo activo, toggle                  |

### Grays

| Token            | Hex       | Uso                                         |
| ---------------- | --------- | ------------------------------------------- |
| text-primary     | `#171a1f` | Títulos, texto principal                    |
| text-label       | `#424955` | Labels de formularios                        |
| text-muted       | `#6e7787` | Descripciones                                |
| text-placeholder | `#9095a0` | Placeholders                                 |
| border-light     | `#dee1e6` | Bordes                                      |
| input-bg         | `#f3f4f6` | Fondos de inputs, cards                    |
| page-bg          | `#fafafb` | Fondo de página                             |

### Accent

| Token          | Hex       | Uso                    |
| -------------- | --------- | ---------------------- |
| warning-text   | `#f09a06` | Texto de alerta        |
| warning-bg     | `#fff9ee` | Fondo de warning       |
| error          | `#de3b40` | Estados de error       |

## Common Visily Layout Patterns

### Form with Section Title (3+9 grid)

```tsx
<div className="bg-white rounded-[4px] border border-[#f3f4f6] p-8">
  <div className="grid grid-cols-12 gap-10">
    <div className="col-span-12 lg:col-span-3">
      <h3 className="text-lg font-bold text-[#171a1f] mb-1">Section Title</h3>
      <p className="text-sm text-[#9095a0]">Description text</p>
    </div>
    <div className="col-span-12 lg:col-span-9 space-y-6">{/* Form fields */}</div>
  </div>
</div>
```

### Inline InputField Component

```tsx
function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon: Icon,
  className,
}: {
  label: string;
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-semibold text-[#424955]">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#f3f4f6] border-none rounded-[4px] px-3 py-2 text-sm text-[#171a1f] focus:ring-2 focus:ring-[#4b7bec] outline-none placeholder:text-[#bcc1ca]"
        />
        {Icon && <Icon className="absolute right-3 top-2.5 text-[#9095a0]" size={16} />}
      </div>
    </div>
  );
}
```

### Header with Back Button + Title + Badge

```tsx
<div className="flex items-center gap-4 mb-8">
  <Link href={backUrl}>
    <button
      type="button"
      className="w-11 h-11 rounded-full bg-[#f3f4f6] flex items-center justify-center hover:bg-[#dee1e6] transition-colors"
    >
      <ArrowLeft size={18} className="text-[#565e6c]" />
    </button>
  </Link>
  <h1 className="text-[32px] font-extrabold text-[#171a1f]">Page Title</h1>
  <div className="bg-[#4b7bec] text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
    <FileText size={16} />
    #586789963
  </div>
</div>
```

### Footer Actions (Cancelar + Guardar)

```tsx
<div className="mt-8 flex justify-end gap-4">
  <button
    type="button"
    className="px-6 py-2 bg-[#f3f4f6] text-[#565e6c] rounded-[4px] font-bold text-sm hover:bg-[#dee1e6] transition-colors"
  >
    Cancelar
  </button>
  <button
    type="button"
    className="px-8 py-2 bg-[#4b7bec] text-white rounded-[4px] font-bold text-sm shadow-md hover:bg-[#3a6ad4] transition-colors"
  >
    Guardar
  </button>
</div>
```

### Tab Bar (Sub-view Switcher)

```tsx
const [activeTab, setActiveTab] = useState<"tab1" | "tab2" | "tab3">("tab1");

<div className="flex border-b border-[#dee1e6] mb-6">
  {[
    { key: "tab1", label: "Tab 1" },
    { key: "tab2", label: "Tab 2" },
    { key: "tab3", label: "Tab 3" },
  ].map((tab) => (
    <button
      key={tab.key}
      type="button"
      onClick={() => setActiveTab(tab.key)}
      className={cn(
        "px-6 py-3 text-sm font-bold transition-colors relative",
        activeTab === tab.key
          ? "text-[#4b7bec] border-b-[3px] border-[#4b7bec] -mb-[1px]"
          : "text-[#9095a0] hover:text-[#6e7787]"
      )}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### Split Layout (List + Detail Card)

```tsx
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-12 lg:col-span-7">
    <div className="relative mb-4">
      <Search className="absolute left-3 top-2.5 text-[#9095a0]" size={16} />
      <input
        placeholder="Buscar..."
        className="w-full bg-[#f3f4f6] rounded-[4px] pl-10 pr-4 py-2 text-sm"
      />
    </div>
    {/* Table or list */}
  </div>
  <div className="col-span-12 lg:col-span-5">
    <div className="bg-white border border-[#f3f4f6] rounded-[4px] overflow-hidden">
      <div className="h-[220px] bg-[#f3f4f6]">
        <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-[#171a1f]">{item.name}</h3>
        <p className="text-sm text-[#9095a0] mt-1">{item.description}</p>
      </div>
    </div>
  </div>
</div>
```

### Image Upload Drop Zone

```tsx
const [isDragging, setIsDragging] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);

<div
  onClick={() => fileInputRef.current?.click()}
  onDrop={handleDrop}
  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
  onDragLeave={() => setIsDragging(false)}
  className={cn(
    "border-2 border-dashed rounded-[4px] p-8 text-center cursor-pointer transition-colors",
    isDragging ? "border-[#4b7bec] bg-[#f1f5fe]" : "border-[#dee1e6] bg-[#fafafb]"
  )}
>
  {imageUrl ? (
    <div className="relative">
      <img src={imageUrl} className="max-h-48 mx-auto rounded-[4px] object-cover" alt="" />
      <button onClick={(e) => { e.stopPropagation(); removeImage(); }}
        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
        <X size={14} />
      </button>
    </div>
  ) : (
    <>
      <Upload size={32} className="mx-auto text-[#bcc1ca] mb-2" />
      <p className="text-sm text-[#9095a0]">Arrastra una imagen o haz clic para subir</p>
    </>
  )}
  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={...} />
</div>
```

Adaptar el endpoint de upload según la API del proyecto (ej. `POST /api/upload`, `POST /api/tenant/[slug]/upload`).

### Category Pills (Toggleable Tags)

```tsx
<div className="flex flex-wrap gap-2">
  {categories.map((cat) => (
    <button
      key={cat}
      type="button"
      onClick={() => toggleCategory(cat)}
      className={cn(
        "px-3 py-1 rounded-full text-xs font-bold transition-colors",
        selected.includes(cat)
          ? "bg-[#4b7bec] text-white"
          : "bg-[#f3f4f6] text-[#565e6c] hover:bg-[#dee1e6]"
      )}
    >
      {cat}
    </button>
  ))}
</div>
```

### Skeleton Loading

```tsx
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="w-10 h-10 bg-[#dee1e6] rounded-[4px]" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-[#dee1e6] rounded w-3/4" />
        <div className="h-2 bg-[#f3f4f6] rounded w-1/2" />
      </div>
    </div>
  );
}
```

### Stepper with Icons

```tsx
<div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
  {steps.map((step, idx) => (
    <React.Fragment key={step.number}>
      <button
        type="button"
        onClick={() => goToStep(step.number)}
        className={cn(
          "flex items-center gap-2 font-semibold shrink-0 transition-colors",
          currentStep >= step.number ? "text-[#4b7bec]" : "text-[#6e7787]"
        )}
      >
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center",
            currentStep > step.number || currentStep === step.number
              ? "bg-[#4b7bec] text-white"
              : "bg-[#dee1e6] text-[#6e7787]"
          )}
        >
          {currentStep > step.number ? <Check size={14} /> : step.icon}
        </div>
        <span className="text-sm hidden md:inline">{step.title}</span>
      </button>
      {idx < steps.length - 1 && <ChevronRight size={16} className="text-[#bcc1ca] shrink-0" />}
    </React.Fragment>
  ))}
</div>
```

### Overlay / Modal Pattern

Cuando el diseño muestra un modal/overlay al hacer clic:

1. Estado: `useState(false)` para abierto, `useState<TypeEnum>(default)` para tipo
2. Filtrar datos con `useMemo` según tipo seleccionado
3. Handler de clic: set type + open
4. Renderizar `<Dialog>` al final del JSX de la página
5. Usar header con color que coincida con el elemento que dispara el modal
