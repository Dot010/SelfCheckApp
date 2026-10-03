"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSession, destroySession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { db } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export interface LoginState {
  error: string | null;
}

// Hash compared when the e-mail doesn't exist, so a wrong e-mail takes as long
// as a wrong password and doesn't reveal which accounts exist.
let dummyHash: Promise<string> | undefined;

export const login = async (
  slug: string,
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> => {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const invalid = { error: "E-mail ou senha incorretos." };
  if (!parsed.success) return invalid;

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    include: { restaurant: { select: { slug: true } } },
  });
  dummyHash ??= hashPassword("not-a-real-password");
  const passwordMatches = await verifyPassword(
    parsed.data.password,
    user?.passwordHash ?? (await dummyHash),
  );
  if (!user || !passwordMatches || user.restaurant.slug !== slug) {
    return invalid;
  }

  await createSession({
    userId: user.id,
    restaurantId: user.restaurantId,
    slug,
  });
  redirect(`/${slug}/admin`);
};

export const logout = async (slug: string) => {
  await destroySession();
  redirect(`/${slug}/admin/login`);
};
