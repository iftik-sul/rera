import Link from "next/link";

/** White rounded card with a title row and an optional "See All"-style link. */
export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section className="flex w-full flex-col gap-4 rounded-xl border border-n30 bg-white px-6 py-5">
      <div className="flex items-center justify-between py-3">
        <h2 className="text-base leading-6 font-medium text-n900">{title}</h2>
        {action && (
          <Link href={action.href} className="text-[13px] leading-5 font-medium text-blue-600 hover:underline">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
