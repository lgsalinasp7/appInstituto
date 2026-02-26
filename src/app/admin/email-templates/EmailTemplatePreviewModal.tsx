'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[];
}

interface EmailTemplatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
}

export default function EmailTemplatePreviewModal({
  open,
  onClose,
  template,
}: EmailTemplatePreviewModalProps) {
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && template) {
      loadPreview();
    }
  }, [open, template]);

  const loadPreview = async () => {
    if (!template) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/email-templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlContent: template.htmlContent,
          variables: template.variables,
        }),
      });

      if (!response.ok) throw new Error('Error al generar preview');

      const { data } = await response.json();
      setPreviewHtml(data.html);
    } catch (error) {
      toast.error('Error al cargar vista previa');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vista Previa: {template?.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Asunto: {template?.subject}
          </p>
        </DialogHeader>

        <div className="border rounded-lg p-6 bg-white text-black">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando vista previa...
            </div>
          ) : (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
