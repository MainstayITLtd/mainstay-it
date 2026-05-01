import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const body = await req.json();
    const { name, company, email, phone, urgency, summary, details } = body;

    if (!name || !company || !email || !urgency || !summary || !details) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const subject = `[${urgency}] ${company} - ${summary}`;

    const html = `
      <h2>New Support Ticket</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <p><strong>Urgency:</strong> ${urgency}</p>
      <p><strong>Summary:</strong> ${summary}</p>
      <hr/>
      <p><strong>Details:</strong></p>
      <p>${String(details).replace(/\n/g, "<br/>")}</p>
    `;

    const { error } = await resend.emails.send({
      from: "Mainstay IT <support@mainstayit.co.uk>",
      to: ["support@mainstayit.co.uk"],
      replyTo: email,
      subject,
      html,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to send" }, { status: 500 });
  }
}