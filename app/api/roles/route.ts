import { NextResponse } from "next/server";
import { getAllRoles, getLimitedRoles } from "@/lib/supabase/roles";

export async function GET() {
  try {
    const roles = await getLimitedRoles(9);
    return NextResponse.json({ roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}
