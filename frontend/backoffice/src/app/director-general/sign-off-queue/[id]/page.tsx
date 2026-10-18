import { notFound } from "next/navigation";
import { findSignoff, signoffDetails } from "@/data/director-general/signoff";
import { SignoffDetailView } from "@/components/signoff/SignoffDetailView";

/** One static page per sample sign-off matter (the site is pre-built, so the list is fixed). */
export function generateStaticParams() {
  return signoffDetails.map((d) => ({ id: d.id }));
}

export default async function SignoffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matter = findSignoff(id);
  if (!matter) notFound();
  return <SignoffDetailView matter={matter} />;
}
