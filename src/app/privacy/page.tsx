import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Privacy Policy — IlliniSublease" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="June 2026">
      <p>
        This Privacy Policy explains what information IlliniSublease, operated by
        <strong> PushTangle LLC</strong> (&quot;we&quot;, &quot;us&quot;), collects, how we
        use and store it, and who can see it. By using this site you agree to this policy.
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

      <h2>Google sign-in and Google user data</h2>
      <p>
        If you choose &quot;Continue with Google,&quot; we use Google&apos;s OAuth service
        to sign you in. We request only basic, non-sensitive scopes
        (<strong>your name, email address, and profile picture</strong>). We do{" "}
        <strong>not</strong> request access to Gmail, Google Drive, Contacts, or any other
        Google service.
      </p>
      <ul>
        <li><strong>What we receive:</strong> your name, @illinois.edu email address, and profile photo URL.</li>
        <li><strong>How we use it:</strong> only to create and authenticate your account and show your name on your listings. We never use it for advertising.</li>
        <li><strong>How we share it:</strong> we do not sell or transfer Google user data to third parties, and we don&apos;t use it for any purpose other than providing this app.</li>
        <li><strong>Limited Use:</strong> our use of information received from Google APIs adheres to the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including its Limited Use requirements.</li>
        <li><strong>Revoking access:</strong> you can revoke this app&apos;s access anytime at{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">your Google Account permissions</a>.</li>
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

      <h2>Deleting your account</h2>
      <p>
        You can permanently delete your account at any time from your{" "}
        <strong>My listings</strong> dashboard (&quot;Delete account&quot;). This immediately
        and irreversibly removes your account, all of your listings and photos, and any data
        we received from Google (name, email, profile photo) from our database. Reports you
        filed against other listings are anonymized rather than deleted.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Edit or delete individual listings anytime from <strong>My listings</strong>.</li>
        <li>Delete your entire account and associated data yourself from <strong>My listings → Delete account</strong>.</li>
        <li>Revoke Google access at your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google Account permissions</a> page.</li>
      </ul>

      <h2>Contact</h2>
      <p>Questions about this policy? Email the site administrator listed in the app footer or your course staff.</p>
    </LegalShell>
  );
}
