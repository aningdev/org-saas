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
 * Never throws: callers must not leak delivery/config failures to unauthenticated
 * clients (email enumeration). Never logs recipient, subject, or body (tokens).
 */
export async function sendTransactionalEmail(input: SendEmailInput): Promise<boolean> {
  if (!mailConfigured()) {
    console.warn("[auth-email] mail not configured; transactional email skipped");
    void input;
    return false;
  }

  try {
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
      console.error(`[auth-email] Resend failed status=${response.status}`);
      return false;
    }
    return true;
  } catch {
    console.error("[auth-email] Resend request failed");
    return false;
  }
}

export function shouldRequireEmailVerification(): boolean {
  return env.REQUIRE_EMAIL_VERIFICATION === true && mailConfigured();
}
