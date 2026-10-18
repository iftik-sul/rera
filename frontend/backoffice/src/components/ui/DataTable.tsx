import Link from "next/link";

/**
 * Simple table used across the back office.
 * Each column says how wide it is and how to draw its cell; rows are plain data.
 */
export type Column<T> = {
  header: string;
  /** Fixed width in px. Leave out for the column that should stretch. */
  width?: number;
  align?: "left" | "right";
  /** "link" = blue semibold (references); "strong" = dark text; default = grey text. */
  tone?: "link" | "strong" | "muted";
  cell: (row: T) => React.ReactNode;
};

const toneClass = {
  link: "font-semibold text-blue-600",
  strong: "leading-5 text-n900",
  muted: "text-n400",
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowHref,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** When given, the whole row is clickable and opens this page. */
  rowHref?: (row: T) => string;
}) {
  const style = (c: Column<T>) => (c.width ? { width: c.width } : undefined);
  const cls = (c: Column<T>) => `${c.width ? "shrink-0" : "min-w-0 flex-1"} ${c.align === "right" ? "text-right" : ""}`;

  return (
    <div className="flex w-full flex-col" role="table">
      <div role="row" className="flex items-center gap-4 border-b border-n40 py-2 text-[11px] leading-5 font-medium tracking-[0.5px] text-n400">
        {columns.map((c) => (
          <span role="columnheader" key={c.header} className={cls(c)} style={style(c)}>
            {c.header}
          </span>
        ))}
      </div>

      {rows.map((row) => {
        const cells = columns.map((c) => (
          <span role="cell" key={c.header} className={`${cls(c)} text-[13px] ${toneClass[c.tone ?? "muted"]}`} style={style(c)}>
            {c.cell(row)}
          </span>
        ));
        const rowCls = "flex items-center gap-4 border-b border-n40 py-3";
        return rowHref ? (
          <Link role="row" key={rowKey(row)} href={rowHref(row)} className={`${rowCls} hover:bg-n20`}>
            {cells}
          </Link>
        ) : (
          <div role="row" key={rowKey(row)} className={rowCls}>
            {cells}
          </div>
        );
      })}
    </div>
  );
}
