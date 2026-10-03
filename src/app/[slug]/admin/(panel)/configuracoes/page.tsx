import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";

import SettingsForm from "../../components/settings-form";

interface SettingsPageProps {
  params: Promise<{ slug: string }>;
}

const SettingsPage = async ({ params }: SettingsPageProps) => {
  const { slug } = await params;
  const { restaurantId } = await requireAdmin(slug);
  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
    include: { openingHours: true },
  });
  if (!restaurant) return notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-extrabold">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          As mudanças valem na hora para quem está no cardápio.
        </p>
      </header>
      <SettingsForm
        slug={slug}
        isPaused={restaurant.isPaused}
        name={restaurant.name}
        description={restaurant.description}
        openingHours={restaurant.openingHours}
      />
    </div>
  );
};

export default SettingsPage;
