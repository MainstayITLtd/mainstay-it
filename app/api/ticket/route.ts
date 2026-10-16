
import { put } from "@vercel/blob";

export const runtime = "nodejs";

const ATERA_BASE_URL = "https://app.atera.com/api/v3";
const PAGE_SIZE = 50;
const MAX_PAGES = 100;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

type AteraRecord = Record<string, any>;

const PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "hotmail.co.uk",
  "live.com",
  "live.co.uk",
  "yahoo.com",
  "yahoo.co.uk",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
]);

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
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

  if (value.includes("critical") || value.includes("high")) {
    return "High";
  }

  if (value.includes("medium")) {
    return "Medium";
  }

  return "Low";
}

function getContactId(contact: AteraRecord) {
  return Number(
    contact?.EndUserID ??
    contact?.ContactID ??
    contact?.ID ??
    contact?.id ??
    0
  );
}

function getCustomerId(record: AteraRecord) {
  return Number(
    record?.CustomerID ??
    record?.customerId ??
    0
  );
}

function getEmailDomain(email: string) {
  return email.toLowerCase().split("@")[1] || "";
}

function normalizeDomain(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/:,\s;]/)[0];
}

function getCustomerDomains(customer: AteraRecord) {
  const raw = String(customer.Domain || "");

  return raw
    .split(/[,;\s]+/)
    .map(normalizeDomain)
    .filter(Boolean);
}

async function ateraRequest(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const apiKey = process.env.ATERA_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ATERA_API_KEY");
  }

  const response = await fetch(`${ATERA_BASE_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();

  let data: any;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      `Atera API error ${response.status}: ${JSON.stringify(data)}`
    );
  }

  return data;
}

function extractItems(data: any): AteraRecord[] {
  if (Array.isArray(data)) return data;

  const items =
    data?.items ??
    data?.Items ??
    data?.value ??
    data?.Value ??
    [];

  return Array.isArray(items) ? items : [];
}

async function getAllRecords(path: string): Promise<AteraRecord[]> {
  const records: AteraRecord[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const separator = path.includes("?") ? "&" : "?";

    const data = await ateraRequest(
      `${path}${separator}page=${page}&itemsInPage=${PAGE_SIZE}`
    );

    const items = extractItems(data);

    records.push(...items);

    const totalPages = Number(
      data?.totalPages ?? data?.TotalPages ?? 0
    );

    if (totalPages > MAX_PAGES) {
      throw new Error(
        `Atera ${path} exceeds the configured pagination limit`
      );
    }

    if (totalPages > 0) {
      if (page >= totalPages) return records;
    } else if (items.length < PAGE_SIZE) {
      return records;
    }
  }

  throw new Error(`Incomplete Atera pagination for ${path}`);
}

function uniqueCustomerIds(records: AteraRecord[]) {
  return [
    ...new Set(
      records
        .map(getCustomerId)
        .filter((id) => Number.isInteger(id) && id > 0)
    ),
  ];
}

function findExistingContact(
  contacts: AteraRecord[],
  email: string
) {
  const matches = contacts.filter(
    (contact) =>
      String(contact.Email || "").trim().toLowerCase() === email
  );

  const ids = uniqueCustomerIds(matches);

  if (ids.length > 1) {
    return { contact: null, ambiguous: true };
  }

  return {
    contact: matches.find((c) => getContactId(c) > 0) || null,
    ambiguous: false,
  };
}

function findCustomerByDomain(
  domain: string,
  customers: AteraRecord[],
  contacts: AteraRecord[]
) {
  if (!domain || PERSONAL_DOMAINS.has(domain)) {
    return null;
  }

  // First check the explicit domain configured in Atera.
  const explicitMatches = customers.filter((customer) =>
    getCustomerDomains(customer).includes(domain)
  );

  const explicitIds = uniqueCustomerIds(explicitMatches);

  if (explicitIds.length === 1) {
    return explicitIds[0];
  }

  if (explicitIds.length > 1) {
    return null;
  }

  // Otherwise infer the company from existing contacts.
  const contactMatches = contacts.filter((contact) => {
    const contactEmail = String(contact.Email || "").toLowerCase();

    return getEmailDomain(contactEmail) === domain;
  });

  const contactIds = uniqueCustomerIds(contactMatches);

  if (contactIds.length === 1) {
    return contactIds[0];
  }

  return null;
}

async function createContact(
  name: string,
  email: string,
  phone: string,
  customerId: number
) {
  const { firstName, lastName } = splitName(name);

  return ateraRequest("/contacts", {
    method: "POST",
    body: JSON.stringify({
      CustomerID: customerId,
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Phone: phone || "",
    }),
  });
}

async function resolveContact(
  name: string,
  email: string,
  phone: string,
  contacts: AteraRecord[],
  customers: AteraRecord[]
) {
  const existing = findExistingContact(contacts, email);

  if (existing.ambiguous) {
    throw new Error("Email belongs to multiple Atera customers");
  }

  if (existing.contact) {
    const customerId = getCustomerId(existing.contact);
    const endUserId = getContactId(existing.contact);

    if (customerId > 0 && endUserId > 0) {
      return {
        customerId,
        endUserId,
        matched: true,
        method: "existing-contact",
      };
    }
  }

  const domain = getEmailDomain(email);

  const matchedCustomerId = findCustomerByDomain(
    domain,
    customers,
    contacts
  );

  const intakeCustomerId = Number(
    process.env.ATERA_UNASSIGNED_CUSTOMER_ID || 0
  );

  const customerId = matchedCustomerId || intakeCustomerId;

  if (!customerId) {
    throw new Error(
      "No matching customer and no intake customer configured"
    );
  }

  if (!customers.some((c) => getCustomerId(c) === customerId)) {
    throw new Error("Resolved customer does not exist in Atera");
  }

  let contact: AteraRecord;

  try {
    contact = await createContact(
      name,
      email,
      phone,
      customerId
    );
  } catch (error: any) {
    const message = String(error?.message || "");

    if (
      !message.includes("409") &&
      !message.toLowerCase().includes("already exists")
    ) {
      throw error;
    }

    // Another submission may have created the contact.
    const refreshedContacts = await getAllRecords("/contacts");

    const retry = findExistingContact(refreshedContacts, email);

    if (retry.ambiguous || !retry.contact) {
      throw new Error(
        "Contact already exists but could not be resolved safely"
      );
    }

    contact = retry.contact;
  }

  const endUserId = getContactId(contact);
  const actualCustomerId = getCustomerId(contact);

  if (!endUserId) {
    throw new Error("Atera did not return a valid contact ID");
  }

  if (!actualCustomerId) {
    throw new Error("Atera did not return a valid customer ID");
  }

  return {
    customerId: actualCustomerId,
    endUserId,
    matched: Boolean(matchedCustomerId),
    method: matchedCustomerId ? "domain-match" : "intake",
  };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = clean(formData.get("name"));
    const company = clean(formData.get("company"));
    const email = clean(formData.get("email")).toLowerCase();
    const phone = clean(formData.get("phone"));
    const urgency = clean(formData.get("urgency"));
    const summary = clean(formData.get("summary"));
    const details = clean(formData.get("details"));

    const uploaded = formData.get("file");
    const file = uploaded instanceof File ? uploaded : null;

    if (
      !name ||
      !company ||
      !email ||
      !urgency ||
      !summary ||
      !details
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254
    ) {
      return Response.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (file && file.size > MAX_ATTACHMENT_BYTES) {
      return Response.json(
        { error: "Attachment must be 10 MB or smaller" },
        { status: 400 }
      );
    }

    // Retrieve current Atera data rather than hardcode clients.
    const [contacts, customers] = await Promise.all([
      getAllRecords("/contacts"),
      getAllRecords("/customers"),
    ]);

    const resolved = await resolveContact(
      name,
      email,
      phone,
      contacts,
      customers
    );

    let attachmentUrl = "";

    if (file && file.size > 0) {
      const safeName = file.name.replace(
        /[^a-zA-Z0-9.\-_]/g,
        "-"
      );

      const blob = await put(
        `tickets/${crypto.randomUUID()}-${safeName}`,
        file,
        {
          access: "public",
          addRandomSuffix: true,
        }
      );

      attachmentUrl = blob.url;
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

Customer routing: ${resolved.method}

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
        Description: description,
        EndUserID: resolved.endUserId,
        EndUserEmail: email,
        CustomerID: resolved.customerId,
        TicketPriority: getPriority(urgency),
        TicketStatus: "Open",
      }),
    });

    return Response.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Ticket submission failed:", error);

    return Response.json(
      { error: "Unable to submit ticket. Please contact support." },
      { status: 500 }
    );
  }
}
