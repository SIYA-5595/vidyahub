import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Administrator',
  department_admin: 'Department Administrator',
  admin: 'Administrator',
  student: 'Student',
};

export async function sendInviteEmail(
  email: string,
  inviteLink: string,
  role: string = 'admin'
) {
  const displayRole = ROLE_LABELS[role] || role;
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"VidyaHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `You're invited to join VidyaHub as ${displayRole}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VidyaHub Invitation</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;padding:20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#0891b2,#0e7490);padding:14px 24px;border-radius:16px;margin-bottom:12px;">
        <span style="color:white;font-size:22px;font-weight:900;letter-spacing:-1px;">VidyaHub</span>
      </div>
      <p style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0;">
        Enterprise Learning Platform
      </p>
    </div>

    <!-- Card -->
    <div style="background:white;border-radius:28px;padding:44px;box-shadow:0 20px 60px rgba(0,0,0,0.07);border:1px solid #f1f5f9;">
      <h1 style="color:#0f172a;font-size:26px;font-weight:900;margin:0 0 6px;font-style:italic;text-transform:uppercase;letter-spacing:-1px;">
        You&apos;re Invited!
      </h1>
      <p style="color:#64748b;font-size:11px;font-weight:700;margin:0 0 28px;letter-spacing:2px;text-transform:uppercase;">
        ${displayRole} Access
      </p>

      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 12px;">
        You have been invited to join <strong>VidyaHub</strong> as a <strong>${displayRole}</strong>.
        Click the button below to set up your account.
      </p>
      <p style="color:#94a3b8;font-size:13px;margin:0 0 36px;">
        This link is valid for <strong>48 hours</strong> and is for one-time use only.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:36px;">
        <a href="${inviteLink}"
           style="display:inline-block;background:#0f172a;color:white;padding:16px 44px;border-radius:14px;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
          Accept Invitation →
        </a>
      </div>

      <!-- Fallback link -->
      <div style="border-top:1px solid #f1f5f9;padding-top:28px;">
        <p style="color:#94a3b8;font-size:11px;margin:0 0 8px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
          Or copy this link into your browser:
        </p>
        <p style="background:#f8fafc;border-radius:10px;padding:12px 14px;color:#0891b2;font-size:11px;word-break:break-all;margin:0;">
          ${inviteLink}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:28px;">
      <p style="color:#cbd5e1;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0;">
        If you did not request this, you can safely ignore this email.
      </p>
      <p style="color:#e2e8f0;font-size:10px;margin:8px 0 0;">
        &copy; ${new Date().getFullYear()} VidyaHub. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}
