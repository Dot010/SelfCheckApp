import { cache } from "react";

import { db } from "@/lib/prisma";

// cache() dedupes the query when the layout metadata and the page both need it
// during the same request.
export const getRestaurantBySlug = cache(async (slug: string) => {
  return db.restaurant.findUnique({ where: { slug } });
});
