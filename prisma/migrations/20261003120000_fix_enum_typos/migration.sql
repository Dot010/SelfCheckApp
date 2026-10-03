-- Fix typos in enum values. RENAME VALUE keeps existing rows.
ALTER TYPE "OrderStatus" RENAME VALUE 'iN_PREPARATION' TO 'IN_PREPARATION';
ALTER TYPE "ConsumptionMethod" RENAME VALUE 'TAKEWAY' TO 'TAKEAWAY';
