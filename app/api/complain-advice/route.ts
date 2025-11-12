import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby7p2X2c1NdbPMftMeQqYCuQ46rkxRFssp025TmyvXC0iNnIRlUC1zt6eiZbNiBrew/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Try to parse JSON response, otherwise assume success
    let result;
    try {
      result = await response.json();
    } catch {
      result = { ok: response.ok };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Submission failed" },
      { status: 500 }
    );
  }
}
