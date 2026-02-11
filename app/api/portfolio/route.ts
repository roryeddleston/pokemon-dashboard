import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_OWNER_ID = "demo";

export async function GET() {
  try {
    const holdings = await prisma.holding.findMany({
      where: { ownerId: DEMO_OWNER_ID },
      orderBy: { createdAt: "desc" },
      include: {
        snapshots: {
          orderBy: { capturedAt: "asc" },
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
