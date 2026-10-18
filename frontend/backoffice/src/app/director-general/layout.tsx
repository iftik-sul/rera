import { directorGeneral } from "@/config/roles";
import { RoleProvider } from "@/components/shell/RoleContext";
import { Sidebar } from "@/components/shell/Sidebar";

/** Every Director-General page sits inside this frame: sidebar on the left, page on the right. */
export default function DirectorGeneralLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider role={directorGeneral}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        {children}
      </div>
    </RoleProvider>
  );
}
