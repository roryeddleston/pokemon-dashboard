import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_OWNER_ID } from "@/lib/constants";
import { createHoldingSchema } from "@/lib/validators/holding";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createHoldingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { cardId, cardName, setName, grade, purchasePrice, quantity } =
      parsed.data;

    const holding = await prisma.holding.upsert({
      where: {
        ownerId_cardId_grade: {
          ownerId: DEMO_OWNER_ID,
          cardId,
          grade, // always a string now
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        ownerId: DEMO_OWNER_ID,
        cardId,
        cardName,
        setName,
        grade,
        purchasePrice,
        quantity,
      },
    });

    return NextResponse.json({ holding }, { status: 201 });
  } catch (error) {
    console.error("POST /api/holdings failed:", error);

    return NextResponse.json(
      { error: "Failed to create holding" },
      { status: 500 }
    );
  }
}
