import { directorGeneral } from "@/config/roles";
import { RoleProvider } from "@/components/shell/RoleContext";
import { RequireRole } from "@/components/shell/RequireRole";
import { Sidebar } from "@/components/shell/Sidebar";
import { ToastHost } from "@/components/shell/Toast";

/**
 * Every Director-General page sits inside this frame: sidebar on the left, page on the right.
 * Only someone signed in as the Director-General gets past RequireRole.
 */
export default function DirectorGeneralLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role={directorGeneral}>
      <RoleProvider role={directorGeneral}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          {children}
        </div>
        <ToastHost />
      </RoleProvider>
    </RequireRole>
  );
}
