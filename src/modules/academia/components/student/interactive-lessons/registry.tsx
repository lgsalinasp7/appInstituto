"use client";

import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import type { InteractiveLessonBaseProps } from "./interactive-lesson-types";

type LazyInteractive = LazyExoticComponent<ComponentType<InteractiveLessonBaseProps>>;

const ViajeUrlAnimation = lazy(() =>
  import("./viaje-url/ViajeUrlAnimation").then((m) => ({ default: m.ViajeUrlAnimation }))
);

const HttpClienteServidorAnimation = lazy(() =>
  import("./http-cliente-servidor/HttpClienteServidorAnimation").then((m) => ({
    default: m.HttpClienteServidorAnimation,
  }))
);

const LenguajesIdeAnimation = lazy(() =>
  import("./lenguajes-ide/LenguajesIdeAnimation").then((m) => ({
    default: m.LenguajesIdeAnimation,
  }))
);

const GitControlVersionesAnimation = lazy(() =>
  import("./git-control-versiones/GitControlVersionesAnimation").then((m) => ({
    default: m.GitControlVersionesAnimation,
  }))
);

const GitRamasPrAnimation = lazy(() =>
  import("./git-ramas-pr/GitRamasPrAnimation").then((m) => ({
    default: m.GitRamasPrAnimation,
  }))
);

const GitConIaAnimation = lazy(() =>
  import("./git-con-ia/GitConIaAnimation").then((m) => ({
    default: m.GitConIaAnimation,
  }))
);

const REGISTRY = {
  viaje_url: ViajeUrlAnimation,
  http_cliente_servidor: HttpClienteServidorAnimation,
  lenguajes_ide: LenguajesIdeAnimation,
  git_control_versiones: GitControlVersionesAnimation,
  git_ramas_pr: GitRamasPrAnimation,
  git_con_ia: GitConIaAnimation,
} satisfies Record<string, LazyInteractive>;

export type InteractiveAnimationSlug = keyof typeof REGISTRY;

export function isRegisteredInteractiveSlug(slug: string): slug is InteractiveAnimationSlug {
  return Object.prototype.hasOwnProperty.call(REGISTRY, slug);
}

export function warnUnknownInteractiveSlug(slug: string): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[Academy] La animación interactiva con slug "${slug}" no tiene componente en el registry. Se usará el video o el fallback.`
    );
  }
}

type InteractiveLessonRendererProps = {
  slug: string;
} & InteractiveLessonBaseProps;

export function InteractiveLessonRenderer({ slug, ...props }: InteractiveLessonRendererProps) {
  if (!isRegisteredInteractiveSlug(slug)) {
    warnUnknownInteractiveSlug(slug);
    return null;
  }
  const Comp = REGISTRY[slug];
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-white/[0.08] bg-slate-950/50 text-[12px] text-slate-500">
          Cargando animación…
        </div>
      }
    >
      <Comp {...props} />
    </Suspense>
  );
}
