const ATERA_BASE_URL = "https://app.atera.com/api/v3";
const PENTACO_CUSTOMER_ID = 2;

function clean(value: unknown) {
  return String(value || "").trim();
}

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
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

function matchCustomer(company: string, email: string) {
  const companyKey = normalise(company);
  const emailDomain = email.split("@")[1]?.toLowerCase() || "";

  if (
    companyKey.includes("pentaco") ||
    companyKey.includes("pentacoconstruction") ||
    emailDomain === "pentaco.co.uk"
  ) {
    return {
      customerId: PENTACO_CUSTOMER_ID,
      customerName: "Pentaco Construction Ltd",
    };
  }

  return null;
}

function getContactId(contact: any) {
  return (
    contact?.EndUserID ||
    contact?.ContactID ||
    contact?.CustomerContactID ||
    contact?.ID ||
    contact?.id
  );
}

async function ateraRequest(path: string, options: RequestInit = {}) {
  const apiKey = process.env.ATERA_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ATERA_API_KEY in Vercel");
  }

  const response = await fetch(`${ATERA_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`Atera API error ${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function findContactByEmail(email: string) {
  const contactsResponse = await ateraRequest("/contacts");

  const contacts = Array.isArray(contactsResponse)
    ? contactsResponse
    : contactsResponse?.items ||
      contactsResponse?.Items ||
      contactsResponse?.value ||
      contactsResponse?.Value ||
      [];

  return contacts.find((contact: any) => {
    return String(contact.Email || contact.email || "").toLowerCase() === email.toLowerCase();
  });
}

async function createOrFindContact({
  name,
  email,
  phone,
  customerId,
}: {
  name: string;
  email: string;
  phone: string;
  customerId: number;
}) {
  const existingContact = await findContactByEmail(email);

  if (existingContact) {
    return existingContact;
  }

  const { firstName, lastName } = splitName(name);

  try {
    return await ateraRequest("/contacts", {
      method: "POST",
      body: JSON.stringify({
        CustomerID: customerId,
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone || "",
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message.includes("409") || message.toLowerCase().includes("already exists")) {
      const contactAfterConflict = await findContactByEmail(email);

      if (contactAfterConflict) {
        return contactAfterConflict;
      }
    }

    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = clean(body.name);
    const company = clean(body.company);
    const email = clean(body.email);
    const phone = clean(body.phone);
    const urgency = clean(body.urgency);
    const summary = clean(body.summary);
    const details = clean(body.details);

    if (!name || !company || !email || !urgency || !summary || !details) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const matchedCustomer = matchCustomer(company, email);

    if (!matchedCustomer) {
      return Response.json(
        { error: "Customer not recognised. This company is not mapped yet." },
        { status: 400 }
      );
    }

    const contact = await createOrFindContact({
      name,
      email,
      phone,
      customerId: matchedCustomer.customerId,
    });

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

Summary:
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
        CustomerID: matchedCustomer.customerId,
        TicketPriority: getPriority(urgency),
        TicketStatus: "Open",
      }),
    });

    return Response.json({
      success: true,
      ticket,
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