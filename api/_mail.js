// Passcode email over EmailJS, shared by the contact form's verification
// (otp.js) and the blog admin sign-in (admin.js).

export function emailjsConfig() {
  return {
    serviceId: process.env.EMAILJS_SERVICE_ID || 'service_a0t4i5e',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || 'j_PeRhatSYVxAj1Gw',
    templateId: process.env.EMAILJS_OTP_TEMPLATE_ID,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
  }
}

// EmailJS's REST API, rather than the browser SDK the form itself uses: calling
// it from a server needs the private key (Account → API Keys) and "Allow
// EmailJS API for non-browser applications" switched on under Account →
// Security. The OTP template needs {{passcode}}, {{to_email}}, {{to_name}} and
// {{time}}, and must send To = {{to_email}} so the code reaches the visitor.
export async function sendPasscodeEmail(cfg, { email, name, code, minutes }) {
  const upstream = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: cfg.serviceId,
      template_id: cfg.templateId,
      user_id: cfg.publicKey,
      accessToken: cfg.privateKey,
      template_params: {
        passcode: code,
        to_email: email,
        to_name: name || 'there',
        time: `${minutes} minutes`,
      },
    }),
  })
  if (!upstream.ok) {
    throw new Error(`EmailJS responded ${upstream.status}: ${await upstream.text()}`)
  }
}
