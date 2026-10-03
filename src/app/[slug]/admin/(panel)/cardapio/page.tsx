import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";

import ProductRow from "../../components/product-row";

interface AdminMenuPageProps {
  params: Promise<{ slug: string }>;
}

const AdminMenuPage = async ({ params }: AdminMenuPageProps) => {
  const { slug } = await params;
  const { restaurantId } = await requireAdmin(slug);
  const categories = await db.menuCategory.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "asc" },
    include: { products: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-extrabold">Cardápio</h1>
        <p className="text-sm text-muted-foreground">
          Desligue &quot;Disponível&quot; para marcar um produto como esgotado.
          O cardápio do cliente muda na hora.
        </p>
      </header>

      {categories.map((category) => (
        <section key={category.id} className="space-y-3">
          <h2 className="text-lg font-bold">{category.name}</h2>
          <div className="divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
            {category.products.map((product) => (
              <ProductRow key={product.id} slug={slug} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default AdminMenuPage;
