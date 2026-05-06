import { put } from "@vercel/blob";

const ATERA_BASE_URL = "https://app.atera.com/api/v3";
const PENTACO_CUSTOMER_ID = 2;

function clean(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || "Unknown",
    lastName: parts.slice(1).join(" ") || "Contact",
  };
}

function getPriority(urgency: string) {
  const value = urgency.toLowerCase();
  if (value.includes("critical") || value.includes("high")) return "High";
  if (value.includes("medium")) return "Medium";
  return "Low";
}

function getContactId(contact: any) {
  return contact?.EndUserID || contact?.ContactID || contact?.ID || contact?.id;
}

function getTicketId(ticket: any) {
  return ticket?.TicketID || ticket?.TicketId || ticket?.ID || ticket?.id;
}

async function ateraRequest(path: string, options: RequestInit = {}) {
  const apiKey = process.env.ATERA_API_KEY;

  if (!apiKey) throw new Error("Missing ATERA_API_KEY");

  const res = await fetch(`${ATERA_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Atera API error ${res.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function findContactByEmail(email: string) {
  const res = await ateraRequest("/contacts");
  const contacts = Array.isArray(res) ? res : res?.items || res?.Items || [];

  return contacts.find(
    (contact: any) =>
      String(contact.Email || contact.email || "").toLowerCase() === email.toLowerCase()
  );
}

async function createOrFindContact(name: string, email: string, phone: string) {
  const existing = await findContactByEmail(email);
  if (existing) return existing;

  const { firstName, lastName } = splitName(name);

  try {
    return await ateraRequest("/contacts", {
      method: "POST",
      body: JSON.stringify({
        CustomerID: PENTACO_CUSTOMER_ID,
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone || "",
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message.includes("409") || message.toLowerCase().includes("already exists")) {
      const retry = await findContactByEmail(email);
      if (retry) return retry;
    }

    throw error;
  }
}

async function addTicketUpdate(ticketId: string | number, message: string) {
  await ateraRequest(`/tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify({
      comment: message,
      is_internal: false,
    }),
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = clean(formData.get("name"));
    const company = clean(formData.get("company"));
    const email = clean(formData.get("email"));
    const phone = clean(formData.get("phone"));
    const urgency = clean(formData.get("urgency"));
    const summary = clean(formData.get("summary"));
    const details = clean(formData.get("details"));
    const file = formData.get("file") as File | null;

    if (!name || !company || !email || !urgency || !summary || !details) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    let attachmentUrl = "";

    if (file && file.size > 0) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");

      const blob = await put(`tickets/${Date.now()}-${safeName}`, file, {
        access: "public",
      });

      attachmentUrl = blob.url;
    }

    const contact = await createOrFindContact(name, email, phone);
    const endUserId = getContactId(contact);

    if (!endUserId) {
      throw new Error(`Could not determine contact ID: ${JSON.stringify(contact)}`);
    }

    const ticketTitle = `[${urgency}] ${company} - ${summary}`;

    const ticketDescription = `
New support request submitted from the Mainstay IT website.

Name: ${name}
Company: ${company}
Email: ${email}
Phone: ${phone || "Not provided"}
Urgency: ${urgency}

Issue / Summary:
${summary}

Details:
${details}
`.trim();

    const ticket = await ateraRequest("/tickets", {
      method: "POST",
      body: JSON.stringify({
        TicketTitle: ticketTitle,
        TicketDescription: ticketDescription,
        EndUserID: endUserId,
        CustomerID: PENTACO_CUSTOMER_ID,
        TicketPriority: getPriority(urgency),
        TicketStatus: "Open",
      }),
    });

    const ticketId = getTicketId(ticket);

    if (ticketId && attachmentUrl) {
      await addTicketUpdate(
        ticketId,
        `Attachment uploaded from the Mainstay IT website:\n\n${attachmentUrl}`
      );
    }

    return Response.json({
      success: true,
      ticket,
      ticketId,
      attachmentUrl,
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to create ticket",
      },
      { status: 500 }
    );
  }
}