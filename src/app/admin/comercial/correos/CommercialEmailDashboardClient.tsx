'use client';

import { Mail, LayoutTemplate, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmailTemplatesClient from '@/app/admin/email-templates/EmailTemplatesClient';
import { EmailAnalyticsClient } from '@/app/admin/email-templates/analytics/EmailAnalyticsClient';
import MessagesTab from './MessagesTab';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[];
  category: string;
  isActive: boolean;
  campaignId: string | null;
  createdAt?: Date;
  _count?: {
    emailLogs: number;
  };
  campaign?: {
    id: string;
    name: string;
  } | null;
}

interface TemplateAnalytics {
  id: string;
  name: string;
  subject: string;
  category: string;
  phase: string | null;
  isLibraryTemplate: boolean;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalConverted: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface GlobalStats {
  totalTemplates: number;
  totalEmailsSent: number;
  avgOpenRate: number;
  avgClickRate: number;
  avgConversionRate: number;
}

interface CommercialEmailDashboardClientProps {
  templates: EmailTemplate[];
  analyticsData: TemplateAnalytics[];
  globalStats: GlobalStats;
}

export default function CommercialEmailDashboardClient({
  templates,
  analyticsData,
  globalStats,
}: CommercialEmailDashboardClientProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-[0_18px_60px_-35px_rgba(8,145,178,0.7)]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
          Comercial
        </p>
        <h1 className="mb-2 text-3xl font-bold text-slate-100 md:text-4xl">Correos</h1>
        <p className="text-slate-400">
          Gestiona mensajes enviados, plantillas y analytics en un solo módulo operativo.
        </p>
      </div>

      <Tabs defaultValue="mensajes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mensajes" className="gap-2">
            <Mail className="h-4 w-4" />
            Mensajes
          </TabsTrigger>
          <TabsTrigger value="plantillas" className="gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mensajes">
          <MessagesTab />
        </TabsContent>

        <TabsContent value="plantillas">
          <EmailTemplatesClient templates={templates} />
        </TabsContent>

        <TabsContent value="analytics">
          <EmailAnalyticsClient analyticsData={analyticsData} globalStats={globalStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
