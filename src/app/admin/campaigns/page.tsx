import { prisma } from '@/lib/prisma';
import CampaignsClient from './CampaignsClient';

export const metadata = {
  title: 'Campañas | KaledSoft',
  description: 'Gestión de campañas de marketing',
};

async function getCampaigns() {
  const campaigns = await prisma.kaledCampaign.findMany({
    include: {
      _count: {
        select: {
          leads: true,
          templates: true,
          sequences: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return campaigns;
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return <CampaignsClient initialCampaigns={campaigns} />;
}
