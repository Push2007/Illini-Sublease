import { LegalShell } from "@/components/legal-shell";
import { OPERATOR, SITE_NAME, SITE_NAME_ALT } from "@/lib/legal";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="June 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) are a binding agreement between you and
        <strong> {OPERATOR}</strong>, which operates the {SITE_NAME} website
        (&quot;{SITE_NAME_ALT}&quot;, &quot;{SITE_NAME}&quot;, &quot;we&quot;, &quot;us&quot;).
        By creating an account or using this site, you agree to these Terms. If you do not
        agree, do not use the site.
      </p>

      <h2>1. No affiliation with the University of Illinois</h2>
      <p>
        <strong>
          {SITE_NAME} is an independent service operated by {OPERATOR}. We are not
          affiliated with, endorsed by, sponsored by, or operated by the University of
          Illinois Urbana-Champaign, the Board of Trustees of the University of Illinois,
          or any official university department, office, or student organization.
        </strong>{" "}
        We require an @illinois.edu email only to verify that users are part of the campus
        community. References to &quot;UIUC,&quot; &quot;Illini,&quot; or the university
        describe our intended audience, not an official relationship. University of Illinois
        names and marks belong to their respective owners.
      </p>

      <h2>2. We are only a listing board</h2>
      <p>
        {SITE_NAME} is a platform operated by {OPERATOR} that lets University of Illinois
        students post and browse sublease listings. <strong>We do not own, manage,
        inspect, or control any apartment.</strong> We are not a landlord, broker,
        real-estate agent, or property manager. We are not a party to any rental or
        sublease agreement between users.
      </p>

      <h2>3. User content and your own risk</h2>
      <p>
        Listings, photos, and messages are created entirely by users.{" "}
        <strong>Users post and rely on content at their own risk.</strong> We do not
        inspect apartments, verify lease documents, confirm identities, or handle money.
        We make no warranty that any listing is accurate, available, legal, or safe.
      </p>

      <h2>4. No liability for scams, fraud, or disputes</h2>
      <p>
        Under <strong>Section 230 of the Communications Decency Act</strong> and applicable
        law, we are not responsible for content posted by users. <strong>We are not
        responsible for scams, fraud, misrepresentations, dirty or uninhabitable units,
        damages, injuries, or any losses</strong> arising from a sublease deal, a
        communication, or a transaction between users. Any dispute is solely between the
        users involved.
      </p>

      <h2>5. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by applicable law, {SITE_NAME}, {SITE_NAME_ALT}, and {OPERATOR},
        and our officers, directors, employees, and agents (collectively, &quot;we&quot;), provide
        the site and services <strong>&quot;as is&quot; and &quot;as available&quot;</strong> without
        warranties of any kind, whether express, implied, or statutory, including any implied
        warranties of merchantability, fitness for a particular purpose, title, or
        non-infringement. We do not warrant that the site will be uninterrupted, error-free,
        or free of harmful components.
      </p>
      <p>
        To the fullest extent permitted by applicable law, <strong>we will not be liable</strong>{" "}
        for any indirect, incidental, special, consequential, exemplary, or punitive damages,
        or for any loss of profits, revenue, data, goodwill, or other intangible losses,
        arising out of or related to your use of (or inability to use) the site, any listing,
        any user content, or any interaction or transaction between users — whether based on
        warranty, contract, tort (including negligence), strict liability, or any other legal
        theory, even if we have been advised of the possibility of such damages.
      </p>
      <p>
        To the fullest extent permitted by applicable law, our <strong>total aggregate
        liability</strong> for any claim arising out of or relating to the site or these
        Terms will not exceed the greater of (a) <strong>one hundred U.S. dollars
        ($100)</strong> or (b) the amount you paid us to use the site in the twelve (12)
        months before the event giving rise to the claim. Because the site is free to use,
        this cap will often be one hundred U.S. dollars ($100).
      </p>
      <p>
        Some jurisdictions do not allow the exclusion of certain warranties or the limitation
        or exclusion of liability for incidental or consequential damages. In those
        jurisdictions, our liability is limited to the maximum extent permitted by law.
      </p>

      <h2>6. Never pay through us</h2>
      <p>
        We <strong>never process payments</strong>. Do not send rent, deposits, or fees
        through this site. Any money you choose to exchange with another user (e.g. via
        Venmo, Zelle, or cash) is entirely at your own risk and outside our control.
      </p>

      <h2>7. Prohibited conduct</h2>
      <ul>
        <li>No discriminatory listings or preferences that violate Fair Housing law (see our <a href="/fair-housing">Fair Housing</a> page).</li>
        <li>No fraudulent, fake, or misleading listings.</li>
        <li>No posting of another person&apos;s photos, listing copy, or information without permission.</li>
        <li>No content that infringes copyrights, trademarks, or other intellectual property (see our <a href="/dmca">Copyright &amp; DMCA Policy</a>).</li>
        <li>No harassment, spam, or unlawful activity.</li>
      </ul>

      <h2>8. Copyright and DMCA takedowns</h2>
      <p>
        We respond to valid copyright infringement notices under the Digital Millennium
        Copyright Act (DMCA). {OPERATOR} has registered a designated DMCA agent with the
        U.S. Copyright Office. If you believe content on the site infringes your copyright,
        or if your content was removed and you wish to submit a counter-notification, follow
        the instructions on our <a href="/dmca">Copyright &amp; DMCA Policy</a> page.
      </p>
      <p>
        We may remove or disable access to reported material, notify the user who posted it,
        and terminate accounts of repeat infringers in appropriate circumstances.
      </p>

      <h2>9. Take-downs and account termination</h2>
      <p>
        We reserve the right to <strong>remove any listing or account at any time, for any
        reason, without warning</strong>, including listings that are reported, appear
        fraudulent, infringe intellectual property, or violate these Terms.
      </p>

      <h2>10. Eligibility</h2>
      <p>
        You must be a current University of Illinois affiliate with a valid @illinois.edu
        Google account to sign in. Do not share access to your Google account with others.
      </p>

      <h2>11. Changes</h2>
      <p>We may update these Terms. Continued use after changes means you accept them.</p>
    </LegalShell>
  );
}
