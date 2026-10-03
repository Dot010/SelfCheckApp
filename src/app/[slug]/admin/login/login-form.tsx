"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { login, LoginState } from "../actions/auth";

interface LoginFormProps {
  slug: string;
  showDemoHint: boolean;
}

const LoginForm = ({ slug, showDemoHint }: LoginFormProps) => {
  const [state, action, isPending] = useActionState<LoginState, FormData>(
    login.bind(null, slug),
    { error: null },
  );

  return (
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
        className="rounded-full"
        disabled={isPending}
      >
        {isPending ? "Entrando…" : "Entrar"}
      </Button>
      {showDemoHint && (
        <p className="rounded-2xl bg-secondary p-3 text-center text-xs text-muted-foreground">
          Acesso de demonstração: <strong>demo@tigela.com</strong> /{" "}
          <strong>tigela123</strong>
        </p>
      )}
    </form>
  );
};

export default LoginForm;
