import { redirect } from "next/navigation";

/** The Work Queue opens on its Transaction tab. */
export default function WorkQueueHome() {
  redirect("/director-general/work-queue/transaction/");
}
