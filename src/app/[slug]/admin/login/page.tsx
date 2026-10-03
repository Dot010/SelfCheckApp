import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { getRestaurantBySlug } from "@/data/get-restaurant-by-slug";
import { getAdminSession } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo";

import LoginForm from "./login-form";

interface LoginPageProps {
  params: Promise<{ slug: string }>;
}

const LoginPage = async ({ params }: LoginPageProps) => {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return notFound();

  const session = await getAdminSession();
  if (session?.slug === slug) redirect(`/${slug}/admin`);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image
            src={restaurant.avatarImageUrl}
            alt=""
            width={56}
            height={56}
            className="rounded-2xl"
          />
          <h1 className="text-2xl font-extrabold">Painel {restaurant.name}</h1>
          <p className="text-sm text-muted-foreground">
            Entre para acompanhar pedidos e editar o cardápio.
          </p>
        </div>
        <LoginForm slug={slug} isDemo={isDemoMode()} />
      </div>
    </main>
  );
};

export default LoginPage;
