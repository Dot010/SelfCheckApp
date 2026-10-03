import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { isDemoMode } from "@/lib/demo";
import { resetDemoData } from "@/lib/demo-data";
import { db } from "@/lib/prisma";

// Called once a day by Vercel Cron (see vercel.json) to undo whatever visitors
// changed on the public demo. Does nothing outside demo mode.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Not in demo mode" }, { status: 404 });
  }

  // Vercel sends "Authorization: Bearer <CRON_SECRET>" on cron calls.
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await resetDemoData(db, { alwaysOpen: true });
  revalidatePath("/", "layout");
  return NextResponse.json({ reset: true });
}
