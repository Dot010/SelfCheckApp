-- Store money as integer cents instead of floating point.
-- Existing values are converted, e.g. 39.9 -> 3990.
ALTER TABLE "Product" ALTER COLUMN "price" TYPE INTEGER USING ROUND("price" * 100)::INTEGER;
ALTER TABLE "Order" ALTER COLUMN "total" TYPE INTEGER USING ROUND("total" * 100)::INTEGER;
ALTER TABLE "OrderProduct" ALTER COLUMN "price" TYPE INTEGER USING ROUND("price" * 100)::INTEGER;
