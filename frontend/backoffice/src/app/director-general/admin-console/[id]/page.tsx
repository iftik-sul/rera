import { notFound } from "next/navigation";
import { findStaff, staff } from "@/data/director-general/staff";
import { AccountEditor } from "@/components/admin/AccountEditor";

/** One static page per sample staff account (the site is pre-built, so the list is fixed). */
export function generateStaticParams() {
  return staff.map((m) => ({ id: m.id }));
}

export default async function AccountEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = findStaff(id);
  if (!member) notFound();
  return <AccountEditor member={member} />;
}
