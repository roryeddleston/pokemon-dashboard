import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_OWNER_ID } from "@/lib/constants";
import { updateHoldingSchema } from "@/lib/validators/holding-update";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = updateHoldingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // IDOR protection: ensure holding belongs to demo owner
    const existing = await prisma.holding.findFirst({
      where: { id: params.id, ownerId: DEMO_OWNER_ID },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const holding = await prisma.holding.update({
      where: { id: existing.id },
      data: parsed.data,
    });

    return NextResponse.json({ holding });
  } catch (error) {
    console.error("PATCH /api/holdings/[id] failed:", error);

    return NextResponse.json(
      { error: "Failed to update holding" },
      { status: 500 }
    );
  }
}
