import { sendContactEnquiryEmail } from "@/lib/mailer";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set(["feedback", "bug", "report", "support", "partnership"]);

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function cleanHeader(value, maxLength) {
  return clean(value, maxLength).replace(/[\r\n]+/g, " ");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    const limit = rateLimit(request, {
      keyPrefix: "contact-form",
      limit: 4,
      windowMs: 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many enquiries. Please wait and try again.", limit);
    }

    const body = await request.json().catch(() => ({}));

    if (body?.companyWebsite) {
      return NextResponse.json({
        success: true,
        message: "Thanks. Your enquiry has been received.",
      });
    }

    const name = cleanHeader(body.name, 80);
    const email = cleanHeader(body.email, 120).toLowerCase();
    const phone = cleanHeader(body.phone, 30);
    const enquiryType = cleanHeader(body.enquiryType, 30).toLowerCase();
    const subject = cleanHeader(body.subject, 140);
    const message = clean(body.message, 3000);

    const errors = {};

    if (!name || name.length < 2) errors.name = "Name must be at least 2 characters";
    if (!email || !isValidEmail(email)) errors.email = "Enter a valid email address";
    if (!ALLOWED_TYPES.has(enquiryType)) errors.enquiryType = "Choose a valid enquiry type";
    if (!subject || subject.length < 4) errors.subject = "Subject must be at least 4 characters";
    if (!message || message.length < 10) errors.message = "Message must be at least 10 characters";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors },
        { status: 400 },
      );
    }

    await sendContactEnquiryEmail({
      name,
      email,
      phone,
      enquiryType,
      subject,
      message,
    });

    return NextResponse.json({
      success: true,
      message: "Thanks. Your enquiry has been sent successfully.",
    });
  } catch (error) {
    console.error("Contact enquiry error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to send enquiry. Please try again later." },
      { status: 500 },
    );
  }
}
