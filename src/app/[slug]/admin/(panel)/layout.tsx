import Image from "next/image";
import { notFound } from "next/navigation";

import { getRestaurantBySlug } from "@/data/get-restaurant-by-slug";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";

import AdminNav from "../components/admin-nav";
import LogoutButton from "../components/logout-button";

interface PanelLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

const PanelLayout = async ({ children, params }: PanelLayoutProps) => {
  const { slug } = await params;
  const session = await requireAdmin(slug);
  const [restaurant, user] = await Promise.all([
    getRestaurantBySlug(slug),
    db.user.findUnique({
      where: { id: session.userId },
      select: { name: true },
    }),
  ]);
  if (!restaurant) return notFound();

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="flex flex-col gap-4 border-b bg-card px-4 py-4 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:gap-8 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src={restaurant.avatarImageUrl}
              alt=""
              width={40}
              height={40}
              className="rounded-xl"
            />
            <div>
              <p className="font-display font-bold leading-tight">
                {restaurant.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.name ?? "Painel"}
              </p>
            </div>
          </div>
          <div className="lg:hidden">
            <LogoutButton slug={slug} />
          </div>
        </div>
        <AdminNav slug={slug} />
        <div className="mt-auto hidden lg:block">
          <LogoutButton slug={slug} />
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
    </div>
  );
};

export default PanelLayout;
