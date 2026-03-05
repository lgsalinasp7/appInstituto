import { CohortView } from "@/modules/academia/components/student/CohortView";

interface PageProps {
  params: Promise<{ cohortId: string }>;
}

export default async function StudentCohortPage({ params }: PageProps) {
  const { cohortId } = await params;
  return <CohortView cohortId={cohortId} />;
}
