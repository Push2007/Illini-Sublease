import { redirect } from "next/navigation";

/** Email verification is no longer used (Google-only auth). */
export default function VerifyPage() {
  redirect("/login");
}
