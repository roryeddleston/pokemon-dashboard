import { PrismaClient, type Holding } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * NOTE: Keep these in sync with `lib/constants.ts`.
 * We intentionally duplicate here to avoid cross-importing app code into Prisma scripts.
 */

const DEMO_OWNER_ID = "demo";
const TEMPLATE_OWNER_ID = "demo-template";

const holdingKey = (h: Pick<Holding, "cardId" | "grade">) =>
  `${h.cardId}::${h.grade ?? ""}`;

async function main() {
  await prisma.$transaction(async (tx) => {
    // 1) Clean existing template + demo data (idempotent)
    await tx.priceSnapshot.deleteMany({
      where: { ownerId: { in: [DEMO_OWNER_ID, TEMPLATE_OWNER_ID] } },
    });
    await tx.holding.deleteMany({
      where: { ownerId: { in: [DEMO_OWNER_ID, TEMPLATE_OWNER_ID] } },
    });

    // 2) Create template holdings
    await tx.holding.createMany({
      data: [
        {
          ownerId: TEMPLATE_OWNER_ID,
          cardId: "base1-4",
          cardName: "Charizard",
          setName: "Base Set",
          grade: "PSA 10",
          purchasePrice: 2500,
          quantity: 1,
        },
        {
          ownerId: TEMPLATE_OWNER_ID,
          cardId: "base1-2",
          cardName: "Blastoise",
          setName: "Base Set",
          grade: "PSA 9",
          purchasePrice: 900,
          quantity: 1,
        },
        {
          ownerId: TEMPLATE_OWNER_ID,
          cardId: "base1-15",
          cardName: "Venusaur",
          setName: "Base Set",
          grade: "PSA 9",
          purchasePrice: 700,
          quantity: 1,
        },
      ],
    });

    // 3) Read template holdings for snapshot creation + cloning
    const templateHoldings = await tx.holding.findMany({
      where: { ownerId: TEMPLATE_OWNER_ID },
      orderBy: { createdAt: "asc" },
    });

    // 4) Create template snapshots (baseline history)
    // Keep this intentionally small for demo clarity.
    for (const h of templateHoldings) {
      const baseValue = h.purchasePrice * 1.2;

      await tx.priceSnapshot.createMany({
        data: [
          {
            ownerId: TEMPLATE_OWNER_ID,
            holdingId: h.id,
            value: baseValue * 0.9,
          },
          {
            ownerId: TEMPLATE_OWNER_ID,
            holdingId: h.id,
            value: baseValue * 1.0,
          },
          {
            ownerId: TEMPLATE_OWNER_ID,
            holdingId: h.id,
            value: baseValue * 1.05,
          },
        ],
      });
    }

    // 5) Clone template holdings → demo holdings
    await tx.holding.createMany({
      data: templateHoldings.map((h) => ({
        ownerId: DEMO_OWNER_ID,
        cardId: h.cardId,
        cardName: h.cardName,
        setName: h.setName,
        grade: h.grade,
        purchasePrice: h.purchasePrice,
        quantity: h.quantity,
      })),
    });

    const demoHoldings = await tx.holding.findMany({
      where: { ownerId: DEMO_OWNER_ID },
    });

    // 6) Build lookup: (cardId+grade) → demo holding id
    const demoIdByKey = new Map<string, string>();
    for (const h of demoHoldings) demoIdByKey.set(holdingKey(h), h.id);

    // 7) Clone template snapshots → demo snapshots
    const templateSnapshots = await tx.priceSnapshot.findMany({
      where: { ownerId: TEMPLATE_OWNER_ID },
      orderBy: { capturedAt: "asc" },
    });

    // Build lookup: template holding id → (cardId+grade) key
    const templateKeyById = new Map<string, string>();
    for (const h of templateHoldings) templateKeyById.set(h.id, holdingKey(h));

    await tx.priceSnapshot.createMany({
      data: templateSnapshots.flatMap((s) => {
        const k = templateKeyById.get(s.holdingId);
        if (!k) return [];

        const demoHoldingId = demoIdByKey.get(k);
        if (!demoHoldingId) return [];

        return [
          {
            ownerId: DEMO_OWNER_ID,
            holdingId: demoHoldingId,
            value: s.value,
            capturedAt: s.capturedAt,
          },
        ];
      }),
    });
  });

  // Only log after transaction commits successfully
  console.log("✅ Seeded template + demo data");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
