import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Lazy init — avoid running at build time when env vars aren't available
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Helper: Extract plain text from Notion-style rich_text array or title array
 */
function extractText(field: any): string {
  // rich_text array: [{ plain_text: "..." }]
  if (Array.isArray(field)) {
    // Notion rich_text format: [{ plain_text: "..." }]
    if (field.length > 0 && typeof field[0] === "object" && field[0].plain_text !== undefined) {
      return field.map((t: any) => t.plain_text || "").join("").trim();
    }
    // iPhone Shortcuts native array format: ["Cash"] or [55000]
    return field.map((t: any) => String(t)).join("").trim();
  }
  // Single string
  if (typeof field === "string") return field.trim();
  // Number
  if (typeof field === "number") return String(field);
  return "";
}

/**
 * Helper: Extract value from various property formats
 * Supports: Notion (select, rich_text, title, number, date, formula)
 *           iPhone Shortcuts native arrays ["value"]
 *           Plain strings/numbers
 */
function extractProperty(prop: any): any {
  if (prop === undefined || prop === null) return undefined;

  // Plain string or number — direct value
  if (typeof prop === "string") return prop.trim() || undefined;
  if (typeof prop === "number") return prop;

  // iPhone Shortcuts native: array of plain values ["Cash"] or [55000]
  if (Array.isArray(prop)) {
    if (prop.length === 0) return undefined;
    const first = prop[0];
    // If array contains Notion rich_text objects
    if (typeof first === "object" && first.plain_text !== undefined) {
      return extractText(prop) || undefined;
    }
    // Plain value array
    return typeof first === "number" ? first : String(first).trim() || undefined;
  }

  // Notion-style object with `type`
  switch (prop.type) {
    case "number":
      return prop.number;
    case "select":
      return prop.select?.name;
    case "rich_text":
      return extractText(prop.rich_text) || undefined;
    case "title":
      return extractText(prop.title) || undefined;
    case "date":
      return prop.date?.start;
    case "formula":
      return prop.formula?.string || prop.formula?.number;
    default:
      // Fallback: try common fields
      if (prop.number !== undefined) return prop.number;
      if (prop.select?.name) return prop.select.name;
      if (prop.rich_text) return extractText(prop.rich_text) || undefined;
      if (prop.title) return extractText(prop.title) || undefined;
      return undefined;
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();

    // 1. Verify Authorization Header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (token !== process.env.API_WEBHOOK_BEARER_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Parse JSON Body (supports Notion-style and flat-style)
    const body = await req.json();
    console.log("[API] Raw body received:", JSON.stringify(body, null, 2));
    const props = body?.properties || body;

    if (!props) {
      return NextResponse.json(
        { error: "Invalid payload format." },
        { status: 400 }
      );
    }

    // 3. Extract values — supports both `properties.Field` and root-level `Field`
    // Helper to check props first, then fall back to root body
    // Helper: check props then root body, always through extractProperty to handle objects
    const get = (key: string): string => {
      const sources = [
        props[key],
        body[key],
        props[key?.toLowerCase()],
        body[key?.toLowerCase()],
      ];
      for (const src of sources) {
        const val = extractProperty(src);
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          return String(val).trim();
        }
        // Also handle plain string/number directly
        if (typeof src === "string" && src.trim()) return src.trim();
        if (typeof src === "number") return String(src);
      }
      return "";
    };

    const amount = extractProperty(props.Amount) ?? props.amount ?? body.Amount ?? body.amount;
    const description = get("Keterangan") || get("Description") || get("description") || "";
    const rawType = get("Jenis Transaksi") || get("jenis_transaksi") || get("transaction_type") || "";
    const transaction_date =
      extractProperty(props.Date) ||
      body.Date ||
      props.transaction_date ||
      body.transaction_date ||
      new Date().toISOString();
    const categoryName = get("Category") || get("category") || "";
    const paymentName = get("Payment") || get("payment") || "";
    const createdByName =
      get("User") || get("Created_by") || get("created_by_name") || "Unknown";

    // Normalize transaction type
    const transaction_type = rawType.toLowerCase().includes("pemasukan")
      ? "pemasukan"
      : rawType.toLowerCase().includes("pengeluaran")
        ? "pengeluaran"
        : rawType.toLowerCase();

    // Validate required fields
    if (!amount || !transaction_type || !categoryName || !paymentName) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            amount: amount || "MISSING",
            transaction_type: transaction_type || "MISSING",
            category: categoryName || "MISSING",
            payment: paymentName || "MISSING",
          },
        },
        { status: 400 }
      );
    }

    if (!["pemasukan", "pengeluaran"].includes(transaction_type)) {
      return NextResponse.json(
        { error: `Invalid transaction_type: "${rawType}". Must be "Pemasukan" or "Pengeluaran".` },
        { status: 400 }
      );
    }

    // 4. Map string names to Master Table IDs
    const { data: categoryData } = await supabase
      .from("master_categories")
      .select("id")
      .ilike("name", categoryName)
      .single();

    if (!categoryData) {
      return NextResponse.json(
        { error: `Category not found: "${categoryName}". Please add it in Master Categories first.` },
        { status: 400 }
      );
    }

    const { data: paymentData } = await supabase
      .from("master_payment_methods")
      .select("id")
      .ilike("name", paymentName)
      .single();

    if (!paymentData) {
      return NextResponse.json(
        { error: `Payment method not found: "${paymentName}". Please add it in Master Payment Methods first.` },
        { status: 400 }
      );
    }

    // 5. Insert transaction with created_by_name
    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .insert([
        {
          amount: Number(amount),
          description,
          transaction_type,
          category_id: categoryData.id,
          payment_method_id: paymentData.id,
          transaction_date,
          created_by_name: createdByName,
        },
      ])
      .select()
      .single();

    if (txError) {
      console.error("Supabase insert error:", txError);
      return NextResponse.json(
        { error: "Failed to insert transaction", details: txError.message },
        { status: 500 }
      );
    }

    // 6. Success
    return NextResponse.json({ success: true, data: txData }, { status: 201 });
  } catch (error: any) {
    console.error("Webhook unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
