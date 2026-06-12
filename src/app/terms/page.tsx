import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Terms of Service — IlliniSublease" };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="June 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) are a binding agreement between you and
        <strong> PushTangle LLC</strong>, which operates the IlliniSublease website
        (&quot;IlliniSublease&quot;, &quot;we&quot;, &quot;us&quot;). By creating an account
        or using this site, you agree to these Terms. If you do not agree, do not use the site.
      </p>

      <h2>1. We are only a listing board</h2>
      <p>
        IlliniSublease is a platform operated by PushTangle LLC that lets University of
        Illinois students post and browse sublease listings. <strong>We do not own, manage,
        inspect, or control any apartment.</strong> We are not a landlord, broker,
        real-estate agent, or property manager. We are not a party to any rental or
        sublease agreement between users.
      </p>

      <h2>2. User content and your own risk</h2>
      <p>
        Listings, photos, and messages are created entirely by users.{" "}
        <strong>Users post and rely on content at their own risk.</strong> We do not
        inspect apartments, verify lease documents, confirm identities, or handle money.
        We make no warranty that any listing is accurate, available, legal, or safe.
      </p>

      <h2>3. No liability for scams, fraud, or disputes</h2>
      <p>
        Under <strong>Section 230 of the Communications Decency Act</strong> and applicable
        law, we are not responsible for content posted by users. <strong>We are not
        responsible for scams, fraud, misrepresentations, dirty or uninhabitable units,
        damages, injuries, or any losses</strong> arising from a sublease deal, a
        communication, or a transaction between users. Any dispute is solely between the
        users involved.
      </p>

      <h2>4. Never pay through us</h2>
      <p>
        We <strong>never process payments</strong>. Do not send rent, deposits, or fees
        through this site. Any money you choose to exchange with another user (e.g. via
        Venmo, Zelle, or cash) is entirely at your own risk and outside our control.
      </p>

      <h2>5. Prohibited conduct</h2>
      <ul>
        <li>No discriminatory listings or preferences that violate Fair Housing law (see our <a href="/fair-housing">Fair Housing</a> page).</li>
        <li>No fraudulent, fake, or misleading listings.</li>
        <li>No posting of another person&apos;s photos or information without permission.</li>
        <li>No harassment, spam, or unlawful activity.</li>
      </ul>

      <h2>6. Take-downs and account termination</h2>
      <p>
        We reserve the right to <strong>remove any listing or account at any time, for any
        reason, without warning</strong>, including listings that are reported, appear
        fraudulent, or violate these Terms.
      </p>

      <h2>7. Eligibility</h2>
      <p>
        You must be a current University of Illinois affiliate with a valid @illinois.edu
        email to register. You are responsible for keeping your login credentials secure.
      </p>

      <h2>8. Changes</h2>
      <p>We may update these Terms. Continued use after changes means you accept them.</p>
    </LegalShell>
  );
}
