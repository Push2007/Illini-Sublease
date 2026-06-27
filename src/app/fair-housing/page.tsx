import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Fair Housing" };

export default function FairHousingPage() {
  return (
    <LegalShell title="Fair Housing policy">
      <p>
        IlliniSublease complies with the federal <strong>Fair Housing Act</strong> and the
        <strong> Illinois Human Rights Act</strong>. All listings must follow these laws.
      </p>

      <h2>Discrimination is strictly forbidden</h2>
      <p>
        You may not express, in any listing or message, a preference, limitation, or
        discrimination based on a protected class, including:
      </p>
      <ul>
        <li>Race or color</li>
        <li>Religion</li>
        <li>National origin or ancestry</li>
        <li>Sex, gender identity, or sexual orientation</li>
        <li>Familial status (e.g. having children)</li>
        <li>Disability</li>
      </ul>
      <p>
        For example, phrases like &quot;Christians only,&quot; &quot;no international
        students,&quot; or &quot;adults only&quot; are illegal and will be blocked.
      </p>

      <h2>How we enforce this</h2>
      <ul>
        <li>We automatically screen listing titles and descriptions for discriminatory language and block posts that fail the check.</li>
        <li>We display a Fair Housing warning on the posting form.</li>
        <li>We may remove any listing that violates this policy at any time.</li>
      </ul>

      <h2>A note on roommates</h2>
      <p>
        Federal law includes a limited exemption for shared living spaces, so a roommate
        gender preference (e.g. &quot;female roommates&quot;) is allowed when you will
        share the unit. This does not extend to any other protected class.
      </p>
    </LegalShell>
  );
}
