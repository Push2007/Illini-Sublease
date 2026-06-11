import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Safety & scams — IlliniSublease" };

export default function SafetyPage() {
  return (
    <LegalShell title="Safety & avoiding scams">
      <p>
        Sublease scams target students every semester. IlliniSublease never handles money
        and never verifies listings, so protecting yourself is up to you. Follow these
        rules:
      </p>

      <h2>Before you pay anyone</h2>
      <ul>
        <li><strong>Tour the unit in person</strong> (or via a live video call) before sending a cent.</li>
        <li><strong>Verify the lease</strong> and confirm the current tenant is actually allowed to sublease.</li>
        <li><strong>Never wire money</strong> or send deposits to someone you haven&apos;t met. Avoid gift cards, crypto, and wire transfers entirely.</li>
        <li>Be suspicious of prices that are far below market, or anyone pressuring you to pay immediately to &quot;hold&quot; the place.</li>
        <li>Reverse-image-search listing photos if something feels off.</li>
      </ul>

      <h2>Protect your account</h2>
      <ul>
        <li>Use a strong, unique password. We store it hashed with bcrypt and never see it.</li>
        <li>Only enter your password on the real site over HTTPS.</li>
      </ul>

      <h2>See something wrong?</h2>
      <p>
        Use the <strong>&quot;Report this listing&quot;</strong> button on any listing page.
        Reports go straight to our administrators, and we may remove a listing at any time.
      </p>
    </LegalShell>
  );
}
