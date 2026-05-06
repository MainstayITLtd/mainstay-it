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

async function ateraRequest(path: string, options: RequestInit = {}) {
  const apiKey = process.env.ATERA_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ATERA_API_KEY");
  }

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

  const contacts = Array.isArray(res)
    ? res
    : res?.items || res?.Items || [];

  return contacts.find((c: any) =>
    (c.Email || "").toLowerCase() === email.toLowerCase()
  );
}

async function createOrFindContact(
  name: string,
  email: string,
  phone: string
) {
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
  } catch (err: any) {
    if (err.message.includes("409")) {
      const retry = await findContactByEmail(email);
      if (retry) return retry;
    }
    throw err;
  }
}

function getContactId(contact: any) {
  return (
    contact?.EndUserID ||
    contact?.ContactID ||
    contact?.ID ||
    contact?.id
  );
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

    if (!name || !company || !email || !summary || !details) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // ✅ Upload file
    let attachmentUrl = "";

    if (file && file.size > 0) {
      const blob = await put(
        `tickets/${Date.now()}-${file.name}`,
        file,
        { access: "public" }
      );

      attachmentUrl = blob.url;
    }

    // ✅ Create/find contact
    const contact = await createOrFindContact(name, email, phone);
    const endUserId = getContactId(contact);

    if (!endUserId) {
      throw new Error("No contact ID returned");
    }

    // ✅ FORCE attachment into title so it's always visible
    const ticketTitle = attachmentUrl
      ? `[${urgency}] ${company} - ${summary} | ${attachmentUrl}`
      : `[${urgency}] ${company} - ${summary}`;

    // ✅ Description
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

${attachmentUrl ? `Attachment:\n${attachmentUrl}` : ""}
`.trim();

    // ✅ Create ticket
    const ticket = await ateraRequest("/tickets", {
      method: "POST",
      body: JSON.stringify({
        TicketTitle: ticketTitle,
        TicketDescription: description,
        EndUserID: endUserId,
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
      { error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}