import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY?.trim();
const from = process.env.EMAIL_FROM?.trim() || "UIUC Sublease <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

type SendArgs = { to: string; subject: string; html: string; text?: string };

async function send({ to, subject, html, text }: SendArgs) {
  if (!resend) {
    // Dev fallback: no Resend key configured — log so flows still work locally.
    console.log("\n========== EMAIL (dev console) ==========");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text ?? html.replace(/<[^>]+>/g, ""));
    console.log("=========================================\n");
    return { delivered: false as const };
  }
  await resend.emails.send({ from, to, subject, html, text });
  return { delivered: true as const };
}

export async function sendVerificationCode(to: string, code: string) {
  return send({
    to,
    subject: "Your UIUC Sublease verification code",
    text: `Your verification code is ${code}. It expires in 15 minutes.`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#13294B">UIUC Sublease</h2>
        <p>Welcome! Use this code to verify your <strong>@illinois.edu</strong> email:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#E84A27">${code}</p>
        <p style="color:#666">This code expires in 15 minutes. If you didn't request it, ignore this email.</p>
      </div>`,
  });
}

export async function sendReportNotification(
  listingId: string,
  listingTitle: string,
  reason: string,
  reporterEmail?: string
) {
  const admin = process.env.ADMIN_EMAIL?.trim();
  if (!admin) {
    console.log(`[REPORT] Listing ${listingId} ("${listingTitle}") reported: ${reason} (by ${reporterEmail ?? "unknown"})`);
    return { delivered: false as const };
  }
  return send({
    to: admin,
    subject: `[Report] Listing flagged: ${listingTitle}`,
    text: `Listing ${listingId} ("${listingTitle}") was reported.\nReason: ${reason}\nReporter: ${reporterEmail ?? "unknown"}`,
    html: `
      <div style="font-family:system-ui,sans-serif">
        <h3>Listing reported</h3>
        <p><strong>Listing:</strong> ${listingTitle} (${listingId})</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Reporter:</strong> ${reporterEmail ?? "unknown"}</p>
        <p><a href="/listings/${listingId}">View listing</a></p>
      </div>`,
  });
}
