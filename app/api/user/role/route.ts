import { NextResponse } from "next/server";
import { getRoleForCurrentUser } from "@/lib/supabase/roles";

export async function GET() {
  try {
    const role = await getRoleForCurrentUser();
    console.log("Role:", role);
    return NextResponse.json(role);
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { error: "Failed to fetch user role" },
      { status: 500 }
    );
  }
}
