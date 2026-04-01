"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SESSION_TYPES = ["TEORIA", "PRACTICA", "LIVE", "ENTREGABLE"] as const;
const DAYS = ["LUNES", "MIERCOLES", "VIERNES"] as const;
const CRAL_PHASES = ["CONSTRUIR", "ROMPER", "AUDITAR", "LANZAR"] as const;

type QuizOptionEditor = { label: string; text: string; isCorrect: boolean; feedback: string };
type QuizEditor = { question: string; order: number; options: QuizOptionEditor[] };
type CralEditor = { phase: string; title: string; description: string; taskCode: string; order: number };
type CheckEditor = { text: string; order: number };
type DeliverableEditor = {
  weekNumber: number;
  title: string;
  description: string;
  isFinal: boolean;
  checkItems: CheckEditor[];
};

type AnimationRow = { id: string; slug: string; title: string; description: string | null };

function emptyQuiz(): QuizEditor {
  return {
    question: "",
    order: 0,
    options: [
      { label: "A", text: "", isCorrect: true, feedback: "" },
      { label: "B", text: "", isCorrect: false, feedback: "" },
    ],
  };
}

function emptyCral(order: number): CralEditor {
  return {
    phase: "CONSTRUIR",
    title: "",
    description: "",
    taskCode: "",
    order,
  };
}

function emptyDeliverable(): DeliverableEditor {
  return {
    weekNumber: 1,
    title: "",
    description: "",
    isFinal: false,
    checkItems: [{ text: "", order: 0 }],
  };
}

export function AdminLessonEditorDialog({
  open,
  onOpenChange,
  lessonId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(false);
  const [animations, setAnimations] = useState<AnimationRow[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [duration, setDuration] = useState(30);
  const [order, setOrder] = useState(0);

  const [sessionType, setSessionType] = useState<string>("TEORIA");
  const [weekNumber, setWeekNumber] = useState(1);
  const [dayOfWeek, setDayOfWeek] = useState<string>("LUNES");
  const [isPrecohort, setIsPrecohort] = useState(false);
  const [phaseTarget, setPhaseTarget] = useState<string>("");
  const [metaVideoUrl, setMetaVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [analogyText, setAnalogyText] = useState("");
  const [kaledIntro, setKaledIntro] = useState("");
  const [conceptsJson, setConceptsJson] = useState("[]");
  const [interactiveAnimationId, setInteractiveAnimationId] = useState("");

  const [quizzes, setQuizzes] = useState<QuizEditor[]>([]);
  const [cral, setCral] = useState<CralEditor[]>([]);
  const [deliverables, setDeliverables] = useState<DeliverableEditor[]>([]);

  const resetLocal = useCallback(() => {
    setLoading(false);
    setTitle("");
    setDescription("");
    setContent("<p></p>");
    setLessonVideoUrl("");
    setDuration(30);
    setOrder(0);
    setSessionType("TEORIA");
    setWeekNumber(1);
    setDayOfWeek("LUNES");
    setIsPrecohort(false);
    setPhaseTarget("");
    setMetaVideoUrl("");
    setVideoTitle("");
    setAnalogyText("");
    setKaledIntro("");
    setConceptsJson("[]");
    setInteractiveAnimationId("");
    setQuizzes([]);
    setCral([]);
    setDeliverables([]);
    setPreviewHtml(false);
  }, []);

  const loadLesson = useCallback(async () => {
    if (!lessonId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/academy/admin/lessons/${lessonId}`);
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "No se pudo cargar la lección");
        return;
      }
      const l = json.data.lesson;
      setTitle(l.title ?? "");
      setDescription(l.description ?? "");
      setContent(l.content ?? "<p></p>");
      setLessonVideoUrl(l.videoUrl ?? "");
      setDuration(l.duration ?? 30);
      setOrder(l.order ?? 0);

      const m = l.meta;
      if (m) {
        setSessionType(m.sessionType ?? "TEORIA");
        setWeekNumber(m.weekNumber ?? 1);
        setDayOfWeek(m.dayOfWeek ?? "LUNES");
        setIsPrecohort(Boolean(m.isPrecohort));
        setPhaseTarget(m.phaseTarget ?? "");
        setMetaVideoUrl(m.videoUrl ?? "");
        setVideoTitle(m.videoTitle ?? "");
        setAnalogyText(m.analogyText ?? "");
        setKaledIntro(m.kaledIntro ?? "");
        const c = m.concepts;
        setConceptsJson(
          c == null ? "[]" : typeof c === "string" ? c : JSON.stringify(c, null, 2)
        );
        setInteractiveAnimationId(m.interactiveAnimationId ?? "");
      } else {
        setSessionType("TEORIA");
        setWeekNumber(1);
        setDayOfWeek("LUNES");
        setIsPrecohort(false);
        setPhaseTarget("");
        setMetaVideoUrl("");
        setVideoTitle("");
        setAnalogyText("");
        setKaledIntro("");
        setConceptsJson("[]");
        setInteractiveAnimationId("");
      }

      setQuizzes(
        (l.quizzes ?? []).map(
          (q: {
            question: string;
            order: number;
            options: { label: string; text: string; isCorrect: boolean; feedback: string | null }[];
          }) => ({
            question: q.question,
            order: q.order,
            options: (q.options ?? []).map((o) => ({
              label: o.label,
              text: o.text,
              isCorrect: o.isCorrect,
              feedback: o.feedback ?? "",
            })),
          })
        )
      );

      setCral(
        (l.cralChallenges ?? []).map(
          (c: {
            phase: string;
            title: string;
            description: string;
            taskCode: string | null;
            order: number;
          }) => ({
            phase: c.phase,
            title: c.title,
            description: c.description,
            taskCode: c.taskCode ?? "",
            order: c.order,
          })
        )
      );

      setDeliverables(
        (l.deliverables ?? []).map(
          (d: {
            weekNumber: number;
            title: string;
            description: string;
            isFinal: boolean;
            checkItems: { text: string; order: number }[];
          }) => ({
            weekNumber: d.weekNumber,
            title: d.title,
            description: d.description,
            isFinal: d.isFinal,
            checkItems: (d.checkItems ?? []).map((it) => ({
              text: it.text,
              order: it.order,
            })),
          })
        )
      );
    } catch {
      toast.error("Error al cargar la lección");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useLayoutEffect(() => {
    if (open && lessonId) setLoading(true);
  }, [open, lessonId]);

  useEffect(() => {
    if (!open || !lessonId) return;
    void loadLesson();
  }, [open, lessonId, loadLesson]);

  useEffect(() => {
    if (!open) resetLocal();
  }, [open, resetLocal]);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      const res = await fetch("/api/academy/admin/interactive-animations");
      const json = await res.json();
      if (json.success) setAnimations(json.data as AnimationRow[]);
    })();
  }, [open]);

  const parseConcepts = (): { ok: true; value: unknown } | { ok: false } => {
    const t = conceptsJson.trim();
    if (!t) return { ok: true, value: null };
    try {
      const parsed = JSON.parse(t) as unknown;
      if (!Array.isArray(parsed)) {
        toast.error("Conceptos: el JSON debe ser un array de { key, title, body }");
        return { ok: false };
      }
      for (const item of parsed) {
        if (
          !item ||
          typeof item !== "object" ||
          !("key" in item) ||
          !("title" in item) ||
          !("body" in item)
        ) {
          toast.error("Cada concepto necesita key, title y body");
          return { ok: false };
        }
      }
      return { ok: true, value: parsed };
    } catch {
      toast.error("JSON de conceptos inválido");
      return { ok: false };
    }
  };

  const saveLessonAndMeta = async () => {
    const concepts = parseConcepts();
    if (!concepts.ok) return;
    setSaving(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/academy/lessons/${lessonId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: description || "",
            content: content || "<p></p>",
            videoUrl: lessonVideoUrl || "",
            duration,
            order,
          }),
        }),
        fetch(`/api/academy/admin/lessons/${lessonId}/meta`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionType,
            weekNumber,
            dayOfWeek,
            isPrecohort,
            phaseTarget: phaseTarget || null,
            videoUrl: metaVideoUrl || null,
            videoTitle: videoTitle || null,
            analogyText: analogyText || null,
            kaledIntro: kaledIntro || null,
            concepts: concepts.value === undefined ? undefined : concepts.value,
            interactiveAnimationId: interactiveAnimationId || null,
          }),
        }),
      ]);
      const j1 = await r1.json();
      const j2 = await r2.json();
      if (!j1.success) {
        toast.error(j1.error || "Error al guardar la lección");
        return;
      }
      if (!j2.success) {
        toast.error(j2.error || "Error al guardar la meta");
        return;
      }
      toast.success("Lección y meta guardadas");
      onSaved();
    } catch {
      toast.error("Error de red al guardar");
    } finally {
      setSaving(false);
    }
  };

  const payloadQuizzes = () =>
    quizzes.map((q, i) => ({
      question: q.question,
      order: q.order ?? i,
      options: q.options.map((o) => ({
        label: o.label,
        text: o.text,
        isCorrect: o.isCorrect,
        feedback: o.feedback || null,
      })),
    }));

  const saveQuizzes = async () => {
    if (
      !confirm(
        "Reemplazar quizzes borra las respuestas guardadas de los estudiantes para esta lección. ¿Continuar?"
      )
    ) {
      return;
    }
    for (const q of quizzes) {
      if (!q.question.trim()) {
        toast.error("Cada quiz debe tener pregunta");
        return;
      }
      if (q.options.length < 1) {
        toast.error("Cada quiz necesita al menos una opción");
        return;
      }
      if (!q.options.some((o) => o.isCorrect)) {
        toast.error("Marca al menos una opción correcta por pregunta");
        return;
      }
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/academy/admin/lessons/${lessonId}/quizzes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizzes: payloadQuizzes() }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Error al guardar quizzes");
        return;
      }
      toast.success("Quizzes actualizados");
      onSaved();
      void loadLesson();
    } catch {
      toast.error("Error de red");
    } finally {
      setSaving(false);
    }
  };

  const saveCral = async () => {
    if (
      !confirm(
        "Reemplazar retos CRAL borra el progreso de completado de los estudiantes en esta lección. ¿Continuar?"
      )
    ) {
      return;
    }
    for (const c of cral) {
      if (!c.title.trim() || !c.description.trim()) {
        toast.error("Cada reto necesita título y descripción");
        return;
      }
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/academy/admin/lessons/${lessonId}/cral-challenges`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenges: cral.map((c, i) => ({
            phase: c.phase,
            title: c.title,
            description: c.description,
            taskCode: c.taskCode || null,
            order: c.order ?? i,
          })),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Error al guardar CRAL");
        return;
      }
      toast.success("Retos CRAL actualizados");
      onSaved();
      void loadLesson();
    } catch {
      toast.error("Error de red");
    } finally {
      setSaving(false);
    }
  };

  const saveDeliverables = async () => {
    if (
      !confirm(
        "Reemplazar entregables borra envíos y rúbricas asociadas a la versión anterior. ¿Continuar?"
      )
    ) {
      return;
    }
    for (const d of deliverables) {
      if (!d.title.trim() || !d.description.trim()) {
        toast.error("Cada entregable necesita título y descripción");
        return;
      }
      for (const it of d.checkItems) {
        if (!it.text.trim()) {
          toast.error("Los ítems de rúbrica no pueden estar vacíos");
          return;
        }
      }
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/academy/admin/lessons/${lessonId}/deliverables`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverables: deliverables.map((d) => ({
            weekNumber: d.weekNumber,
            title: d.title,
            description: d.description,
            isFinal: d.isFinal,
            checkItems: d.checkItems.map((it, idx) => ({
              text: it.text,
              order: it.order ?? idx,
            })),
          })),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Error al guardar entregables");
        return;
      }
      toast.success("Entregables actualizados");
      onSaved();
      void loadLesson();
    } catch {
      toast.error("Error de red");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "academy-card-dark border-white/10 bg-slate-900 text-white",
          "max-w-5xl w-[calc(100vw-2rem)] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden"
        )}
      >
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0 border-b border-white/[0.06]">
          <DialogTitle className="text-white text-lg">Editar lección</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-800/80 p-1 mb-4">
                  <TabsTrigger value="general" className="text-xs sm:text-sm">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="meta" className="text-xs sm:text-sm">
                    Meta / calendario
                  </TabsTrigger>
                  <TabsTrigger value="quizzes" className="text-xs sm:text-sm">
                    Quizzes
                  </TabsTrigger>
                  <TabsTrigger value="cral" className="text-xs sm:text-sm">
                    CRAL
                  </TabsTrigger>
                  <TabsTrigger value="deliverables" className="text-xs sm:text-sm">
                    Entregables
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-0">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label className="text-slate-300">Título</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 bg-slate-800 border-white/10 text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-slate-300">Descripción corta</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="mt-1 bg-slate-800 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Duración (min)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
                        className="mt-1 bg-slate-800 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Orden en el módulo</Label>
                      <Input
                        type="number"
                        min={0}
                        value={order}
                        onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                        className="mt-1 bg-slate-800 border-white/10 text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-slate-300">Video URL (lección)</Label>
                      <Input
                        value={lessonVideoUrl}
                        onChange={(e) => setLessonVideoUrl(e.target.value)}
                        placeholder="https://..."
                        className="mt-1 bg-slate-800 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={previewHtml ? "ghost" : "secondary"}
                      className={cn(!previewHtml && "bg-cyan-600/20 text-cyan-200")}
                      onClick={() => setPreviewHtml(false)}
                    >
                      HTML
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={previewHtml ? "secondary" : "ghost"}
                      className={cn(previewHtml && "bg-cyan-600/20 text-cyan-200")}
                      onClick={() => setPreviewHtml(true)}
                    >
                      Vista previa
                    </Button>
                  </div>
                  {!previewHtml ? (
                    <div>
                      <Label className="text-slate-300">Contenido (HTML)</Label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="mt-1 bg-slate-950 border-white/10 text-white font-mono text-sm min-h-[320px]"
                        spellCheck={false}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label className="text-slate-300">Vista previa (sandbox)</Label>
                      <iframe
                        title="preview"
                        sandbox=""
                        srcDoc={content}
                        className="mt-1 w-full min-h-[320px] rounded-lg border border-white/10 bg-white"
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="meta" className="space-y-4 mt-0">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Tipo de sesión</Label>
                      <select
                        value={sessionType}
                        onChange={(e) => setSessionType(e.target.value)}
                        className="mt-1 w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white"
                      >
                        {SESSION_TYPES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-slate-300">Día de la semana</Label>
                      <select
                        value={dayOfWeek}
                        onChange={(e) => setDayOfWeek(e.target.value)}
                        className="mt-1 w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white"
                      >
                        {DAYS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-slate-300">Semana (número)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={weekNumber}
                        onChange={(e) => setWeekNumber(parseInt(e.target.value, 10) || 1)}
                        className="mt-1 bg-slate-800 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Fase CRAL (opcional)</Label>
                      <select
                        value={phaseTarget}
                        onChange={(e) => setPhaseTarget(e.target.value)}
                        className="mt-1 w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white"
                      >
                        <option value="">— Ninguna —</option>
                        {CRAL_PHASES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input
                        id="precohort"
                        type="checkbox"
                        checked={isPrecohort}
                        onChange={(e) => setIsPrecohort(e.target.checked)}
                        className="rounded border-white/20"
                      />
                      <Label htmlFor="precohort" className="text-slate-300 cursor-pointer">
                        Lección pre-cohorte (visible con gating)
                      </Label>
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-slate-300">Video URL (meta / reproductor)</Label>
                      <Input
                        value={metaVideoUrl}
                        onChange={(e) => setMetaVideoUrl(e.target.value)}
                        className="mt-1 bg-slate-800 border-white/10 text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-slate-300">Título del video</Label>
                      <Input
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="mt-1 bg-slate-800 border-white/10 text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-slate-300">Animación interactiva</Label>
                      <select
                        value={interactiveAnimationId}
                        onChange={(e) => setInteractiveAnimationId(e.target.value)}
                        className="mt-1 w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white"
                      >
                        <option value="">— Ninguna —</option>
                        {animations.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.title} ({a.slug})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-slate-300">Texto analogía</Label>
                      <Textarea
                        value={analogyText}
                        onChange={(e) => setAnalogyText(e.target.value)}
                        rows={3}
                        className="mt-1 bg-slate-800 border-white/10 text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-slate-300">Intro Kaled</Label>
                      <Textarea
                        value={kaledIntro}
                        onChange={(e) => setKaledIntro(e.target.value)}
                        rows={3}
                        className="mt-1 bg-slate-800 border-white/10 text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-slate-300">Conceptos (JSON array: key, title, body)</Label>
                      <Textarea
                        value={conceptsJson}
                        onChange={(e) => setConceptsJson(e.target.value)}
                        className="mt-1 bg-slate-950 border-white/10 text-white font-mono text-sm min-h-[160px]"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quizzes" className="space-y-4 mt-0">
                  <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                    Guardar aquí reemplaza todos los quizzes y elimina las respuestas previas de estudiantes.
                  </p>
                  {quizzes.map((q, qi) => (
                    <div
                      key={qi}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-sm font-medium text-slate-200">Pregunta {qi + 1}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-red-400 shrink-0"
                          onClick={() => setQuizzes(quizzes.filter((_, i) => i !== qi))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={q.question}
                        onChange={(e) => {
                          const next = [...quizzes];
                          next[qi] = { ...next[qi], question: e.target.value };
                          setQuizzes(next);
                        }}
                        rows={2}
                        className="bg-slate-800 border-white/10 text-white"
                      />
                      <div>
                        <Label className="text-slate-400 text-xs">Orden</Label>
                        <Input
                          type="number"
                          min={0}
                          value={q.order}
                          onChange={(e) => {
                            const next = [...quizzes];
                            next[qi] = { ...next[qi], order: parseInt(e.target.value, 10) || 0 };
                            setQuizzes(next);
                          }}
                          className="mt-1 w-24 bg-slate-800 border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        {q.options.map((o, oi) => (
                          <div
                            key={oi}
                            className="flex flex-col sm:flex-row gap-2 items-start border border-white/[0.06] rounded-lg p-2"
                          >
                            <Input
                              value={o.label}
                              onChange={(e) => {
                                const next = [...quizzes];
                                const opts = [...next[qi].options];
                                opts[oi] = { ...opts[oi], label: e.target.value };
                                next[qi] = { ...next[qi], options: opts };
                                setQuizzes(next);
                              }}
                              className="w-14 bg-slate-800 border-white/10 text-white"
                              placeholder="A"
                            />
                            <Textarea
                              value={o.text}
                              onChange={(e) => {
                                const next = [...quizzes];
                                const opts = [...next[qi].options];
                                opts[oi] = { ...opts[oi], text: e.target.value };
                                next[qi] = { ...next[qi], options: opts };
                                setQuizzes(next);
                              }}
                              rows={2}
                              className="flex-1 bg-slate-800 border-white/10 text-white"
                            />
                            <label className="flex items-center gap-1 text-xs text-slate-300 whitespace-nowrap">
                              <input
                                type="radio"
                                name={`correct-${qi}`}
                                checked={o.isCorrect}
                                onChange={() => {
                                  const next = [...quizzes];
                                  const opts = next[qi].options.map((opt, j) => ({
                                    ...opt,
                                    isCorrect: j === oi,
                                  }));
                                  next[qi] = { ...next[qi], options: opts };
                                  setQuizzes(next);
                                }}
                              />
                              Correcta
                            </label>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="text-slate-500"
                              onClick={() => {
                                const next = [...quizzes];
                                next[qi] = {
                                  ...next[qi],
                                  options: next[qi].options.filter((_, j) => j !== oi),
                                };
                                setQuizzes(next);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-white/10 text-slate-300"
                          onClick={() => {
                            const next = [...quizzes];
                            const label = String.fromCharCode(65 + next[qi].options.length);
                            next[qi] = {
                              ...next[qi],
                              options: [
                                ...next[qi].options,
                                { label, text: "", isCorrect: false, feedback: "" },
                              ],
                            };
                            setQuizzes(next);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" /> Opción
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="border-cyan-500/40 text-cyan-300"
                    onClick={() => setQuizzes([...quizzes, emptyQuiz()])}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Añadir quiz
                  </Button>
                  <Button
                    type="button"
                    className="bg-amber-600/80 hover:bg-amber-500 text-white ml-2"
                    disabled={saving}
                    onClick={() => void saveQuizzes()}
                  >
                    Aplicar quizzes
                  </Button>
                </TabsContent>

                <TabsContent value="cral" className="space-y-4 mt-0">
                  <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                    Guardar aquí reemplaza retos y borra completados previos de estudiantes.
                  </p>
                  {cral.map((c, ci) => (
                    <div
                      key={ci}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3"
                    >
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-200">Reto {ci + 1}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-red-400"
                          onClick={() => setCral(cral.filter((_, i) => i !== ci))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <select
                        value={c.phase}
                        onChange={(e) => {
                          const next = [...cral];
                          next[ci] = { ...next[ci], phase: e.target.value };
                          setCral(next);
                        }}
                        className="w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white"
                      >
                        {CRAL_PHASES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={c.title}
                        onChange={(e) => {
                          const next = [...cral];
                          next[ci] = { ...next[ci], title: e.target.value };
                          setCral(next);
                        }}
                        placeholder="Título"
                        className="bg-slate-800 border-white/10 text-white"
                      />
                      <Textarea
                        value={c.description}
                        onChange={(e) => {
                          const next = [...cral];
                          next[ci] = { ...next[ci], description: e.target.value };
                          setCral(next);
                        }}
                        rows={3}
                        className="bg-slate-800 border-white/10 text-white"
                      />
                      <Textarea
                        value={c.taskCode}
                        onChange={(e) => {
                          const next = [...cral];
                          next[ci] = { ...next[ci], taskCode: e.target.value };
                          setCral(next);
                        }}
                        rows={2}
                        placeholder="Código de tarea (opcional)"
                        className="bg-slate-800 border-white/10 text-white font-mono text-xs"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={c.order}
                        onChange={(e) => {
                          const next = [...cral];
                          next[ci] = { ...next[ci], order: parseInt(e.target.value, 10) || 0 };
                          setCral(next);
                        }}
                        className="w-24 bg-slate-800 border-white/10 text-white"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="border-cyan-500/40 text-cyan-300"
                    onClick={() => setCral([...cral, emptyCral(cral.length)])}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Añadir reto
                  </Button>
                  <Button
                    type="button"
                    className="bg-amber-600/80 hover:bg-amber-500 text-white ml-2"
                    disabled={saving}
                    onClick={() => void saveCral()}
                  >
                    Aplicar CRAL
                  </Button>
                </TabsContent>

                <TabsContent value="deliverables" className="space-y-4 mt-0">
                  <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                    Guardar aquí reemplaza entregables y envíos asociados.
                  </p>
                  {deliverables.map((d, di) => (
                    <div
                      key={di}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3"
                    >
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-200">Entregable {di + 1}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-red-400"
                          onClick={() => setDeliverables(deliverables.filter((_, i) => i !== di))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <Input
                          type="number"
                          min={1}
                          value={d.weekNumber}
                          onChange={(e) => {
                            const next = [...deliverables];
                            next[di] = {
                              ...next[di],
                              weekNumber: parseInt(e.target.value, 10) || 1,
                            };
                            setDeliverables(next);
                          }}
                          className="bg-slate-800 border-white/10 text-white"
                        />
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                          <input
                            type="checkbox"
                            checked={d.isFinal}
                            onChange={(e) => {
                              const next = [...deliverables];
                              next[di] = { ...next[di], isFinal: e.target.checked };
                              setDeliverables(next);
                            }}
                          />
                          Entregable final
                        </label>
                      </div>
                      <Input
                        value={d.title}
                        onChange={(e) => {
                          const next = [...deliverables];
                          next[di] = { ...next[di], title: e.target.value };
                          setDeliverables(next);
                        }}
                        placeholder="Título"
                        className="bg-slate-800 border-white/10 text-white"
                      />
                      <Textarea
                        value={d.description}
                        onChange={(e) => {
                          const next = [...deliverables];
                          next[di] = { ...next[di], description: e.target.value };
                          setDeliverables(next);
                        }}
                        rows={3}
                        className="bg-slate-800 border-white/10 text-white"
                      />
                      <div className="space-y-2">
                        <Label className="text-slate-400 text-xs">Ítems de rúbrica</Label>
                        {d.checkItems.map((it, ii) => (
                          <div key={ii} className="flex gap-2">
                            <Input
                              value={it.text}
                              onChange={(e) => {
                                const next = [...deliverables];
                                const items = [...next[di].checkItems];
                                items[ii] = { ...items[ii], text: e.target.value };
                                next[di] = { ...next[di], checkItems: items };
                                setDeliverables(next);
                              }}
                              className="flex-1 bg-slate-800 border-white/10 text-white"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                const next = [...deliverables];
                                next[di] = {
                                  ...next[di],
                                  checkItems: next[di].checkItems.filter((_, j) => j !== ii),
                                };
                                setDeliverables(next);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-white/10"
                          onClick={() => {
                            const next = [...deliverables];
                            next[di] = {
                              ...next[di],
                              checkItems: [
                                ...next[di].checkItems,
                                { text: "", order: next[di].checkItems.length },
                              ],
                            };
                            setDeliverables(next);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" /> Ítem
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="border-cyan-500/40 text-cyan-300"
                    onClick={() => setDeliverables([...deliverables, emptyDeliverable()])}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Añadir entregable
                  </Button>
                  <Button
                    type="button"
                    className="bg-amber-600/80 hover:bg-amber-500 text-white ml-2"
                    disabled={saving}
                    onClick={() => void saveDeliverables()}
                  >
                    Aplicar entregables
                  </Button>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-white/[0.06] shrink-0 gap-2 flex-col sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              <Button
                type="button"
                className="bg-cyan-600 hover:bg-cyan-500"
                disabled={saving}
                onClick={() => void saveLessonAndMeta()}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar lección y meta"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
