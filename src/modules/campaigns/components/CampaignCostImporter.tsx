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
    <Card>
      <CardHeader>
        <CardTitle>Importar Costos de Campaña</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Sube un archivo CSV con los costos diarios de tus campañas publicitarias.</p>
          <p className="mt-1">Formato: date, campaign, adset, ad, spend_cop, impressions, clicks</p>
        </div>

        <Button variant="outline" onClick={downloadTemplate} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Descargar Plantilla CSV
        </Button>

        <div className="space-y-2">
          <label className="text-sm font-medium">Seleccionar archivo CSV</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
        </div>

        <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          {loading ? 'Importando...' : 'Importar CSV'}
        </Button>

        {result && (
          <div
            className={`p-3 rounded ${
              result.success
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
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
