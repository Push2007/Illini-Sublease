import { LegalShell } from "@/components/legal-shell";
import { DMCA_AGENT_EMAIL, OPERATOR, SITE_NAME, SITE_NAME_ALT } from "@/lib/legal";

export const metadata = { title: "Copyright & DMCA" };

export default function DmcaPage() {
  return (
    <LegalShell title="Copyright & DMCA Policy" updated="June 2026">
      <p>
        {SITE_NAME} ({SITE_NAME_ALT}) is operated by <strong>{OPERATOR}</strong>. We respect
        intellectual property rights and respond to valid notices under the Digital Millennium
        Copyright Act (&quot;DMCA&quot;), 17 U.S.C. § 512.
      </p>

      <h2>Designated DMCA agent</h2>
      <p>
        {OPERATOR} has registered a designated agent with the U.S. Copyright Office. Send
        copyright notices and counter-notices to:
      </p>
      <ul>
        <li>
          <strong>Organization/Agent:</strong> {OPERATOR} (DMCA Agent)
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a href={`mailto:${DMCA_AGENT_EMAIL}?subject=DMCA%20Notice`}>{DMCA_AGENT_EMAIL}</a>
        </li>
      </ul>
      <p>
        Email is the fastest way to reach us. If you must send physical mail, use the mailing
        address on file for {OPERATOR} in the{" "}
        <a
          href="https://www.copyright.gov/dmca-directory/"
          target="_blank"
          rel="noopener noreferrer"
        >
          U.S. Copyright Office DMCA designated agent directory
        </a>
        , or contact us at the email above to request it.
      </p>

      <h2>Reporting copyright infringement</h2>
      <p>
        If you believe content on {SITE_NAME} (for example, a photo in a user&apos;s listing)
        infringes your copyright, send a written notice to our DMCA agent that includes{" "}
        <strong>all</strong> of the following (see 17 U.S.C. § 512(c)(3)):
      </p>
      <ol>
        <li>
          Your physical or electronic signature (typing your full legal name at the bottom of
          an email is acceptable).
        </li>
        <li>
          Identification of the copyrighted work you claim has been infringed (or a
          representative list if multiple works).
        </li>
        <li>
          Identification of the material you claim is infringing, with enough detail for us to
          locate it on the site (e.g. the listing URL on {SITE_NAME_ALT}).
        </li>
        <li>
          Your contact information: name, mailing address, telephone number, and email address.
        </li>
        <li>
          A statement that you have a good-faith belief that use of the material is not
          authorized by the copyright owner, its agent, or the law.
        </li>
        <li>
          A statement, under penalty of perjury, that the information in your notice is
          accurate and that you are the copyright owner or authorized to act on the owner&apos;s
          behalf.
        </li>
      </ol>
      <p>
        We may remove or disable access to the reported material and notify the user who posted
        it. Knowingly submitting a false infringement claim may expose you to liability.
      </p>

      <h2>Counter-notification</h2>
      <p>
        If your listing or content was removed because of a DMCA notice and you believe the
        removal was a mistake or misidentification, you may send a counter-notification to our
        DMCA agent that includes the elements required by 17 U.S.C. § 512(g)(3), including:
      </p>
      <ul>
        <li>Your physical or electronic signature.</li>
        <li>Identification of the material that was removed and where it appeared before removal.</li>
        <li>
          A statement under penalty of perjury that you have a good-faith belief the material
          was removed or disabled as a result of mistake or misidentification.
        </li>
        <li>
          Your name, address, and telephone number, and a statement that you consent to the
          jurisdiction of the federal district court for your address (or, if outside the U.S.,
          any district where {OPERATOR} may be found), and that you will accept service of
          process from the person who submitted the original DMCA notice.
        </li>
      </ul>
      <p>
        If we receive a valid counter-notification, we may restore the material after the
        statutory waiting period unless the copyright owner files a court action.
      </p>

      <h2>Repeat infringers</h2>
      <p>
        We may terminate accounts of users who are repeat infringers in appropriate
        circumstances, consistent with our{" "}
        <a href="/terms">Terms of Service</a>.
      </p>

      <h2>User responsibility</h2>
      <p>
        You may only upload photos and text you own or have permission to use. Do not post
        apartment photos, floor plans, or marketing images copied from property websites,
        landlords, or other listings without authorization.
      </p>

      <h2>Contact</h2>
      <p>
        Copyright and DMCA questions:{" "}
        <a href={`mailto:${DMCA_AGENT_EMAIL}`}>{DMCA_AGENT_EMAIL}</a>
      </p>
    </LegalShell>
  );
}
