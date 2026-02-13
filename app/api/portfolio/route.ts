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
          take: 1, // only latest snapshot for performance
        },
      },
    });

    // Compute summary in one pass (O(n))
    let totalInvested = 0;
    let totalValue = 0;

    for (const holding of holdings) {
      const latestSnapshot = holding.snapshots[0];

      const invested = holding.purchasePrice * holding.quantity;
      const value = latestSnapshot
        ? latestSnapshot.value * holding.quantity
        : invested;

      totalInvested += invested;
      totalValue += value;
    }

    const totalProfit = totalValue - totalInvested;
    const profitPercentage =
      totalInvested === 0 ? 0 : (totalProfit / totalInvested) * 100;

    return NextResponse.json({
      holdings,
      summary: {
        totalInvested,
        totalValue,
        totalProfit,
        profitPercentage,
      },
    });
  } catch (error) {
    console.error("GET /api/portfolio failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}
