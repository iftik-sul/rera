import { notFound } from "next/navigation";
import { entryDetails, findEntry } from "@/data/director-general/register";
import { EntryDetailView } from "@/components/register/EntryDetailView";

/** One static page per sample entry (the site is pre-built, so the list is fixed). */
export function generateStaticParams() {
  return entryDetails.map((d) => ({ id: d.id }));
}

export default async function EntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = findEntry(id);
  if (!entry) notFound();
  return <EntryDetailView entry={entry} />;
}
