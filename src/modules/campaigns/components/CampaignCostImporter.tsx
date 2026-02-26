'use client';
import { useState } from 'react';
import { Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { tenantFetch } from '@/lib/tenant-fetch';

export function CampaignCostImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await tenantFetch('/api/admin/campaigns/costs/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResult(data);

      if (data.success) {
        setFile(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Error al importar archivo',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = `date,campaign,adset,ad,spend_cop,impressions,clicks
2026-02-24,Campana_Masterclass_Feb,Intereses_Educacion,Video_A,185000,12450,392
2026-02-24,Campana_Masterclass_Feb,Intereses_Educacion,Video_B,142000,9830,301
2026-02-23,Campana_Descuento_Matricula,Lookalike_Estudiantes,Carousel_1,98500,8200,245`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_costos_campana.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="glass-card rounded-[2rem] border-slate-800/50 bg-slate-900/40">
      <CardHeader className="border-b border-slate-800/50 pb-4">
        <CardTitle className="font-display text-xl font-bold tracking-tight text-white">
          Importar Costos de Campaña
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-slate-400">
          <p>Sube un archivo CSV con los costos diarios de tus campañas publicitarias.</p>
          <p className="mt-1">Formato: date, campaign, adset, ad, spend_cop, impressions, clicks</p>
        </div>

        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="w-full border-slate-800/60 bg-slate-950/40 text-slate-300 hover:border-cyan-500/30 hover:bg-slate-900/70 hover:text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Descargar Plantilla CSV
        </Button>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Seleccionar archivo CSV
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 p-2 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-200 hover:file:bg-slate-700"
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-600 hover:to-blue-600"
        >
          <Upload className="h-4 w-4 mr-2" />
          {loading ? 'Importando...' : 'Importar CSV'}
        </Button>

        {result && (
          <div
            className={`rounded-xl border p-3 ${
              result.success
                ? 'border-green-500/30 bg-green-500/10 text-green-300'
                : 'border-red-500/30 bg-red-500/10 text-red-300'
            }`}
          >
            {result.success ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span>{result.data.imported} registros importados exitosamente</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg">✗</span>
                <span>Error: {result.error}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
