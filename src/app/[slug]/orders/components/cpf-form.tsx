"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollTextIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { isValidCpf } from "../../menu/helpers/cpf";
import { identifyCustomer } from "../actions/customer";

const formSchema = z.object({
  cpf: z
    .string()
    .trim()
    .min(1, {
      message: "O CPF é obrigatório.",
    })
    .refine((value) => isValidCpf(value), {
      message: "CPF inválido.",
    }),
});

type FormSchema = z.infer<typeof formSchema>;

interface CpfFormProps {
  slug: string;
}

const CpfForm = ({ slug }: CpfFormProps) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { cpf: "" },
  });
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: FormSchema) => {
    startTransition(async () => {
      const result = await identifyCustomer(data.cpf);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            <ScrollTextIcon />
          </span>
          <h1 className="text-2xl font-extrabold">Meus pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Digite o CPF usado no pedido para acompanhar o andamento.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <PatternFormat
                      placeholder="000.000.000-00"
                      format="###.###.###-##"
                      inputMode="numeric"
                      customInput={Input}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="lg"
              className="rounded-full"
              disabled={isPending}
            >
              Ver pedidos
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href={`/${slug}`}>Voltar ao início</Link>
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
};

export default CpfForm;
