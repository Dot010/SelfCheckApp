"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_LOGIN } from "@/lib/demo";

import { login, LoginState } from "../actions/auth";

interface LoginFormProps {
  slug: string;
  isDemo: boolean;
}

const LoginForm = ({ slug, isDemo }: LoginFormProps) => {
  const [state, action, isPending] = useActionState<LoginState, FormData>(
    login.bind(null, slug),
    { error: null },
  );

  return (
    <div className="flex flex-col gap-4">
      {isDemo && (
        <form
          action={action}
          className="flex flex-col gap-3 rounded-2xl bg-secondary p-4 text-center text-sm"
        >
          <input type="hidden" name="email" value={DEMO_LOGIN.email} />
          <input type="hidden" name="password" value={DEMO_LOGIN.password} />
          <p className="text-muted-foreground">
            Projeto de demonstração: entre sem digitar nada.
          </p>
          <Button
            type="submit"
            size="lg"
            className="rounded-full"
            disabled={isPending}
          >
            Entrar com a conta de demonstração
          </Button>
          <p className="text-xs text-muted-foreground">
            ou use <strong>{DEMO_LOGIN.email}</strong> /{" "}
            <strong>{DEMO_LOGIN.password}</strong>
          </p>
        </form>
      )}
      <form action={action} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-11 rounded-xl"
          />
        </div>
        {state.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {state.error}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          variant={isDemo ? "outline" : "default"}
          className="rounded-full"
          disabled={isPending}
        >
          {isPending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
