import { PrismaClient } from "@prisma/client";

import { resetDemoData } from "../src/lib/demo-data";

const prismaClient = new PrismaClient();

resetDemoData(prismaClient, { alwaysOpen: process.env.DEMO_MODE === "true" })
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
