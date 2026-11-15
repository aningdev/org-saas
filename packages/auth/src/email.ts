import { env } from "@org-saas/env/server";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

function mailConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

/**
 * Sends transactional mail via Resend when configured.
 * Without credentials: logs in non-production, throws in production so auth flows fail closed.
 */
export async function sendTransactionalEmail(input: SendEmailInput): Promise<void> {
  if (!mailConfigured()) {
    const message = `[auth-email] mail not configured; would send to=${input.to} subject=${input.subject}`;
    if (env.NODE_ENV === "production" || env.NODE_ENV === "prod") {
      throw new Error(
        "Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM before requiring email flows.",
      );
    }
    console.info(message);
    console.info(input.text);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend email failed (${response.status}): ${body.slice(0, 200)}`);
  }
}

export function shouldRequireEmailVerification(): boolean {
  return env.REQUIRE_EMAIL_VERIFICATION === true && mailConfigured();
}
