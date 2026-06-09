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

function extractContacts(data: any) {
  if (Array.isArray(data)) return data;
  return data?.items || data?.Items || data?.value || data?.Value || [];
}

async function findContactByEmail(email: string) {
  const cleanEmail = email.toLowerCase();

  const paths = [
    `/contacts?email=${encodeURIComponent(email)}`,
    `/contacts?search=${encodeURIComponent(email)}`,
    `/contacts`,
  ];

  for (const path of paths) {
    try {
      const res = await ateraRequest(path);
      const contacts = extractContacts(res);

      const match = contacts.find((contact: any) => {
        return String(contact.Email || contact.email || "").toLowerCase() === cleanEmail;
      });

      if (match) return match;
    } catch {
      // Try next search method
    }
  }

  return null;
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
  } catch (error: any) {
    const message = String(error?.message || "");

    if (message.includes("409") || message.toLowerCase().includes("already exists")) {
      const retry = await findContactByEmail(email);

      if (retry) return retry;

      throw new Error(
        `Contact already exists in Atera, but the API could not find it by email: ${email}`
      );
    }

    throw error;
  }
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
      return Response.json({ error: "Missing fields" }, { status: 400 });
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
      throw new Error(`Contact found but no ID was returned for ${email}`);
    }

    const ticketTitle = attachmentUrl
      ? `[${urgency}] ${company} - ${summary} | Details: ${details} | Attachment: ${attachmentUrl}`
      : `[${urgency}] ${company} - ${summary} | Details: ${details}`;

    const description = `
New support request submitted from website

Name: ${name}
Company: ${company}
Email: ${email}
Phone: ${phone || "N/A"}
Urgency: ${urgency}

Summary:
${summary}

Details:
${details}

${attachmentUrl ? `Attachment: ${attachmentUrl}` : "Attachment: None"}
`.trim();

    const ticket = await ateraRequest("/tickets", {
      method: "POST",
      body: JSON.stringify({
        TicketTitle: ticketTitle,
        TicketDescription: description,
        EndUserID: endUserId,
        EndUserEmail: email,
        CustomerID: PENTACO_CUSTOMER_ID,
        TicketPriority: getPriority(urgency),
        TicketStatus: "Open",
      }),
    });

    return Response.json({
      success: true,
      ticket,
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