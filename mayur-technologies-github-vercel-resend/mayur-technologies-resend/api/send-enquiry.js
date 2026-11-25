import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    // Honeypot field: silently accept bots without sending email.
    if (clean(body.website, 200)) return res.status(200).json({ ok: true });

    const name = clean(body.name, 100);
    const mobile = clean(body.mobile, 25);
    const email = clean(body.email, 150);
    const laptopModel = clean(body.laptopModel, 120);
    const message = clean(body.message, 1000);
    const items = Array.isArray(body.items) ? body.items.slice(0, 30) : [];

    if (!name || !mobile || !items.length) {
      return res.status(400).json({ error: "Please provide your name, mobile number and at least one product." });
    }
    if (!/^[+()0-9 .-]{7,25}$/.test(mobile)) {
      return res.status(400).json({ error: "Please enter a valid mobile number." });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    if (!process.env.RESEND_API_KEY || !process.env.ENQUIRY_TO_EMAIL || !process.env.RESEND_FROM_EMAIL) {
      console.error("Missing one or more required environment variables.");
      return res.status(500).json({ error: "Enquiry email is not configured yet. Please contact the website owner." });
    }

    const itemLines = items.map((item, index) =>
      `${index + 1}. ${clean(item.name, 100)} (${clean(item.category, 80)})`
    ).join("\n");

    const text = [
      "New customer enquiry - Mayur Technologies",
      "",
      `Customer name: ${name}`,
      `Mobile: ${mobile}`,
      `Email: ${email || "Not provided"}`,
      `Laptop model: ${laptopModel || "Not provided"}`,
      "",
      "Requested products:",
      itemLines,
      "",
      `Message: ${message || "No additional message"}`
    ].join("\n");

    const html = `
      <h2>New customer enquiry - Mayur Technologies</h2>
      <p><b>Customer name:</b> ${escapeHtml(name)}</p>
      <p><b>Mobile:</b> ${escapeHtml(mobile)}</p>
      <p><b>Email:</b> ${escapeHtml(email || "Not provided")}</p>
      <p><b>Laptop model:</b> ${escapeHtml(laptopModel || "Not provided")}</p>
      <h3>Requested products</h3>
      <ol>${items.map(item => `<li>${escapeHtml(clean(item.name,100))} (${escapeHtml(clean(item.category,80))})</li>`).join("")}</ol>
      <p><b>Message:</b><br>${escapeHtml(message || "No additional message").replace(/\n/g,"<br>")}</p>`;

    const emailPayload = {
      from: process.env.RESEND_FROM_EMAIL,
      to: [process.env.ENQUIRY_TO_EMAIL],
      subject: `New website enquiry from ${name}`,
      text,
      html
    };
    if (email) emailPayload.replyTo = email;

    const { error } = await resend.emails.send(emailPayload);
    if (error) {
      console.error("Resend error:", error);
      return res.status(502).json({ error: "Email service could not send the enquiry. Please try again later." });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Enquiry handler error:", error);
    return res.status(400).json({ error: "Invalid enquiry request." });
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
