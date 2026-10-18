import { notFound } from "next/navigation";
import { applications, findApplication } from "@/data/director-general/applications";
import { ApplicationReview } from "@/components/review/ApplicationReview";

/** One static page per sample application (the site is pre-built, so the list is fixed). */
export function generateStaticParams() {
  return applications.map((a) => ({ id: a.id }));
}

export default async function ApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = findApplication(id);
  if (!app) notFound();
  return <ApplicationReview app={app} />;
}
