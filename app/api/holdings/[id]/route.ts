import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_OWNER_ID } from "@/lib/constants";
import { updateHoldingSchema } from "@/lib/validators/holding-update";

type ParamsPromise = Promise<{ id: string }>;

export async function PATCH(
  req: NextRequest,
  { params }: { params: ParamsPromise }
) {
  try {
    const { id } = await params;

    const body = await req.json();
    const parsed = updateHoldingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.holding.findFirst({
      where: { id, ownerId: DEMO_OWNER_ID },
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: ParamsPromise }
) {
  try {
    const { id } = await params;

    // IDOR protection: only delete demo-owned holdings
    const existing = await prisma.holding.findFirst({
      where: { id, ownerId: DEMO_OWNER_ID },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Cascades snapshots via your Prisma relation onDelete: Cascade
    await prisma.holding.delete({
      where: { id: existing.id },
    });

    // 204 is correct for successful delete with no body
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/holdings/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to delete holding" },
      { status: 500 }
    );
  }
}
