import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Privacy Policy — IlliniSublease" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="June 2026">
      <p>
        This Privacy Policy explains what information IlliniSublease (&quot;we&quot;,
        &quot;us&quot;) collects, how we use and store it, and who can see it. By using
        this site you agree to this policy.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account info:</strong> your name and @illinois.edu email address (and, for password accounts, a securely hashed password — we never store your raw password).</li>
        <li><strong>Listing info:</strong> the apartment details, address, photos, price, and the contact email and phone number you choose to provide.</li>
        <li><strong>Reports:</strong> if you report a listing, we store your account id and the reason.</li>
      </ul>

      <h2>How we store it safely</h2>
      <ul>
        <li>Passwords are hashed with <strong>bcrypt</strong>; they are never stored or transmitted in plain text.</li>
        <li>Data is stored in a managed PostgreSQL database protected by access credentials kept in server-side environment variables.</li>
        <li>All traffic is encrypted over HTTPS/SSL.</li>
      </ul>

      <h2>Who can see your information</h2>
      <ul>
        <li><strong>Contact info is shared publicly with logged-in users.</strong> When you post a sublease and check the &quot;Consent to Share&quot; box, your contact email and phone number become visible to any signed-in UIUC user who clicks &quot;Reveal contact info&quot; on your listing. This is required so buyers can reach you.</li>
        <li>Your contact details are <strong>hidden from the public internet</strong> (anyone not logged in).</li>
        <li>We do not sell your data to third parties.</li>
      </ul>

      <h2>Automatic data deletion</h2>
      <p>
        Subleases are temporary. When you mark a listing as <strong>rented</strong>, or once
        the listing&apos;s availability end date passes, your contact information is
        automatically hidden and is no longer revealed to other users. You may delete a
        listing at any time from your dashboard, which removes its data from our database.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Edit or delete your listings anytime from <strong>My listings</strong>.</li>
        <li>To delete your account and associated data, contact us and we will remove it.</li>
      </ul>

      <h2>Contact</h2>
      <p>Questions about this policy? Email the site administrator listed in the app footer or your course staff.</p>
    </LegalShell>
  );
}
