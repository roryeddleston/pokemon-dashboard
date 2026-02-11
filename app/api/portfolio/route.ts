import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_OWNER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const holdings = await prisma.holding.findMany({
      where: { ownerId: DEMO_OWNER_ID },
      orderBy: { createdAt: "desc" },
      include: {
        snapshots: {
          orderBy: { capturedAt: "desc" },
          take: 1, // keep response small; full history comes from a dedicated endpoint later
        },
      },
    });

    return NextResponse.json({ holdings });
  } catch (error) {
    console.error("GET /api/portfolio failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}
