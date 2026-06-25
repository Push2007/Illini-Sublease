import { redirect } from "next/navigation";

/** Sign-up is Google-only — same flow as log in. */
export default function SignupPage() {
  redirect("/login");
}
