"use client";

import { useEffect, useState } from "react";
import { Page } from "@/components/shell/Page";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableCard, type Column, type FilterDef } from "@/components/ui/Table";
import { DATE_ORDER, TYPE_ORDER, dateBucket, notifications, type Notification } from "@/data/director-general/notifications";

/** Read/unread is the only change this screen makes. DEMO: remembered for this browser tab only. */
const KEY = "reran.notifications.read";
const loadRead = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};
const saveRead = (ids: string[]) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage blocked — the page still works, it just won't remember */
  }
};

export default function Notifications() {
  const [read, setRead] = useState<string[]>([]);
  useEffect(() => setRead(loadRead()), []);

  const isUnread = (x: Notification) => x.unread && !read.includes(x.id);
  const rows = notifications.map((x) => ({ ...x, state: isUnread(x) ? "Unread" : "Read" }));
  const unreadCount = rows.filter((r) => r.state === "Unread").length;
  const markRead = (ids: string[]) => {
    const next = [...new Set([...read, ...ids])];
    setRead(next);
    saveRead(next);
  };

  type Row = (typeof rows)[number];
  // Widths are % of the row (design standard §A5a.0 rule 5).
  const columns: Column<Row>[] = [
    { header: "Type", width: 17, tone: "link", cell: (r) => r.type },
    { header: "Message", width: 42, cell: (r) => <span className={r.state === "Unread" ? "type-body-strong" : ""}>{r.message}</span> },
    { header: "Related item", width: 15, tone: "muted", cell: (r) => r.related },
    { header: "Received", width: 14, tone: "muted", cell: (r) => r.received },
    { header: "State", width: 12, cell: (r) => <Badge tone={r.state === "Unread" ? "info" : "neutral"}>{r.state}</Badge> },
  ];
  const filters: FilterDef<Row>[] = [
    { label: "Type", key: "type", value: (r) => r.type, order: TYPE_ORDER },
    { label: "State", key: "state", value: (r) => r.state, order: ["Unread", "Read"] },
    { label: "Date range", key: "date", value: (r) => dateBucket(r), order: DATE_ORDER },
  ];

  return (
    <Page title="Notifications" subtitle="Events that need you — each one opens the screen that deals with it.">
      <TableCard
        title="All notifications"
        action={
          <Button disabled={unreadCount === 0} onClick={() => markRead(rows.map((r) => r.id))}>
            Mark all as read
          </Button>
        }
        filters={filters}
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        rowAction={(r) => ({ href: r.link, onClick: () => markRead([r.id]) })}
        searchText={(r) => `${r.type} ${r.message} ${r.related}`}
        paginate={{ one: "notification", many: "notifications" }}
        empty="No notifications yet."
      />
    </Page>
  );
}
