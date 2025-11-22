import { redirect } from "next/navigation";

export default function ClosetPage() {
  redirect("/protected/item");
}
