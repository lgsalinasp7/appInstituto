'use client';

/**
 * EmailTemplateForm Component
 * Full-page form for creating and editing email templates
 * Extracted from EmailTemplateFormModal to support full-page layout
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[];
  category: string;
  isActive: boolean;
  campaignId: string | null;
}

interface EmailTemplateFormProps {
  template?: EmailTemplate | null;
}

export default function EmailTemplateForm({ template }: EmailTemplateFormProps) {
  const router = useRouter();
  const isEdit = !!template;
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    variables: [] as string[],
    category: 'GENERAL',
    isActive: true,
  });

  const [newVariable, setNewVariable] = useState('');

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        variables: template.variables,
        category: template.category,
        isActive: template.isActive,
      });
      // Auto-generate preview for existing templates
      generatePreview(template.htmlContent, template.variables);
    }
  }, [template]);

  const handleAddVariable = () => {
    if (
      newVariable &&
      !formData.variables.includes(newVariable.toLowerCase())
    ) {
      setFormData({
        ...formData,
        variables: [...formData.variables, newVariable.toLowerCase()],
      });
      setNewVariable('');
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((v) => v !== variable),
    });
  };

  const generatePreview = async (htmlContent?: string, variables?: string[]) => {
    const content = htmlContent || formData.htmlContent;
    const vars = variables || formData.variables;

    if (!content) {
      setPreviewHtml('');
      setShowPreview(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/email-templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlContent: content,
          variables: vars,
        }),
      });

      if (!response.ok) throw new Error('Error al generar preview');

      const { data } = await response.json();
      setPreviewHtml(data.html);
      setShowPreview(true);
    } catch (error) {
      toast.error('Error al generar vista previa');
      console.error(error);
    }
  };

  const handlePreview = () => {
    if (!formData.htmlContent) {
      toast.error('Agrega contenido HTML primero');
      return;
    }
    generatePreview();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.subject || !formData.htmlContent) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      const url = isEdit
        ? `/api/admin/email-templates/${template.id}`
        : '/api/admin/email-templates';

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar plantilla');

      const { data } = await response.json();
      toast.success(
        `Plantilla ${isEdit ? 'actualizada' : 'creada'} exitosamente`
      );
      router.push('/admin/email-templates');
    } catch (error) {
      toast.error('Error al guardar plantilla');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">
            Nombre de la Plantilla *
          </label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Ej: Bienvenida Masterclass"
            required
            className="bg-slate-900/40 border-slate-800 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">
            Asunto del Email *
          </label>
          <Input
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            placeholder="Ej: ¡Bienvenido a la Masterclass!"
            required
            className="bg-slate-900/40 border-slate-800 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">
          Categoría
        </label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger className="bg-slate-900/40 border-slate-800 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AUTOMATIC">Automático</SelectItem>
            <SelectItem value="SEMI_AUTOMATIC">Semi-automático</SelectItem>
            <SelectItem value="MANUAL">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Variables */}
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">
          Variables Disponibles
        </label>
        <div className="flex gap-2 mb-3">
          <Input
            value={newVariable}
            onChange={(e) => setNewVariable(e.target.value)}
            placeholder="Ej: nombre, email, telefono"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddVariable();
              }
            }}
            className="bg-slate-900/40 border-slate-800 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
          />
          <Button
            type="button"
            onClick={handleAddVariable}
            className="bg-white/5 hover:bg-white/10 text-white rounded-xl px-6 transition-all"
          >
            Agregar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.variables.map((variable) => (
            <span
              key={variable}
              className="text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-xl border bg-cyan-400/10 text-cyan-400 border-cyan-400/20 cursor-pointer hover:bg-cyan-400/20 transition-all inline-flex items-center gap-1"
              onClick={() => handleRemoveVariable(variable)}
            >
              {`{{${variable}}}`}
              <X className="h-3 w-3" />
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          Usa las variables en el HTML como {`{{nombre}}, {{email}}`}, etc. Click en la variable para eliminar.
        </p>
      </div>

      {/* Split View: Editor | Preview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Editor HTML</h3>
            <Button
              type="button"
              onClick={handlePreview}
              size="sm"
              className="bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
            >
              <Eye className="mr-2 h-4 w-4" />
              Actualizar Preview
            </Button>
          </div>
          <Textarea
            value={formData.htmlContent}
            onChange={(e) =>
              setFormData({ ...formData, htmlContent: e.target.value })
            }
            placeholder="<h1>Hola {{nombre}}</h1><p>Bienvenido...</p>"
            rows={20}
            className="font-mono text-sm bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 resize-none"
            required
          />
        </div>

        {/* Preview */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Vista Previa</h3>
          {showPreview ? (
            <div
              className="prose prose-sm max-w-none prose-invert overflow-auto max-h-[500px] bg-white/5 rounded-lg p-4"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <div className="flex items-center justify-center h-[500px] text-slate-500">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Haz clic en &quot;Actualizar Preview&quot; para ver el resultado</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          className="bg-white/5 hover:bg-white/10 text-white rounded-xl px-6 h-12 transition-all font-medium"
          onClick={() => router.back()}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 transition-all font-bold shadow-lg rounded-xl px-8 h-12 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading
            ? 'Guardando...'
            : isEdit
              ? 'Actualizar Plantilla'
              : 'Guardar Plantilla'}
        </button>
      </div>
    </form>
  );
}
