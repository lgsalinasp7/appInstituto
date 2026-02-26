'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Mail, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface KaledLead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[];
  isActive: boolean;
}

interface SendEmailModalProps {
  open: boolean;
  onClose: () => void;
  lead: KaledLead | null;
  onSuccess?: () => void;
}

export default function SendEmailModal({
  open,
  onClose,
  lead,
  onSuccess,
}: SendEmailModalProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  useEffect(() => {
    if (selectedTemplateId && lead) {
      loadPreview();
    }
  }, [selectedTemplateId, lead]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/email-templates');
      if (!response.ok) throw new Error('Error al cargar plantillas');

      const { data } = await response.json();
      const activeTemplates = data.filter((t: EmailTemplate) => t.isActive);
      setTemplates(activeTemplates);
    } catch (error) {
      toast.error('Error al cargar plantillas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async () => {
    if (!selectedTemplateId || !lead) return;

    try {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (!template) return;

      // Replace variables with lead data
      let html = template.htmlContent;
      let subject = template.subject;

      const variables: Record<string, string> = {
        nombre: lead.name,
        email: lead.email,
        telefono: lead.phone || 'No proporcionado',
      };

      template.variables.forEach((variable) => {
        const regex = new RegExp(`{{${variable}}}`, 'g');
        const value = variables[variable] || `{{${variable}}}`;
        html = html.replace(regex, value);
        subject = subject.replace(regex, value);
      });

      setPreviewHtml(html);
      setPreviewSubject(subject);
    } catch (error) {
      toast.error('Error al generar vista previa');
      console.error(error);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedTemplateId || !lead) {
      toast.error('Selecciona una plantilla');
      return;
    }

    setSending(true);

    try {
      const response = await fetch(
        `/api/admin/kaled-leads/${lead.id}/send-email`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: selectedTemplateId,
          }),
        }
      );

      if (!response.ok) throw new Error('Error al enviar email');

      toast.success('Email enviado exitosamente');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Error al enviar email');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Email a {lead?.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">{lead?.email}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Selector */}
          <div>
            <Label htmlFor="template">Seleccionar Plantilla</Label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loading ? 'Cargando plantillas...' : 'Selecciona una plantilla'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {selectedTemplateId && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-4 border-b">
                <p className="text-sm font-medium">Asunto:</p>
                <p className="text-sm text-muted-foreground">
                  {previewSubject}
                </p>
              </div>
              <div className="p-6 bg-white text-black max-h-96 overflow-y-auto">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={sending}>
              Cancelar
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={!selectedTemplateId || sending}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              <Send className="mr-2 h-4 w-4" />
              {sending ? 'Enviando...' : 'Enviar Email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
