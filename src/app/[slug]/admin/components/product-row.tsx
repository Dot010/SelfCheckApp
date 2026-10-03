"use client";

import { Product } from "@prisma/client";
import Image from "next/image";
import { useState, useTransition } from "react";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/helpers/format-currency";

import { setProductAvailability, updateProduct } from "../actions/products";

interface ProductRowProps {
  slug: string;
  product: Pick<
    Product,
    "id" | "name" | "description" | "price" | "imageUrl" | "isAvailable"
  >;
}

const ProductRow = ({ slug, product }: ProductRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
  });

  const toggleAvailability = (isAvailable: boolean) =>
    startTransition(async () => {
      const ok = await setProductAvailability(slug, product.id, isAvailable);
      if (ok) {
        toast.success(
          `${product.name} ${isAvailable ? "disponível" : "esgotado"}`,
        );
      } else {
        toast.error("Não foi possível atualizar o produto.");
      }
    });

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateProduct(slug, product.id, form);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Produto atualizado");
      setIsEditing(false);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:gap-4 sm:px-5">
      <div className="relative h-12 w-12 shrink-0 rounded-xl bg-secondary">
        <Image
          src={product.imageUrl}
          alt=""
          fill
          sizes="48px"
          className="object-contain p-1"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{product.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(product.price)}
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={product.isAvailable}
          disabled={isPending}
          onChange={(event) => toggleAvailability(event.target.checked)}
          aria-label={`${product.name} disponível`}
        />
        <span className="w-20 text-muted-foreground">
          {product.isAvailable ? "Disponível" : "Esgotado"}
        </span>
      </label>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={() => setIsEditing(true)}
      >
        Editar
      </Button>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar produto</DialogTitle>
            <DialogDescription>
              O preço é o valor base; tamanhos e complementos somam a ele.
            </DialogDescription>
          </DialogHeader>
          <form id={`edit-${product.id}`} onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`name-${product.id}`}>Nome</Label>
              <Input
                id={`name-${product.id}`}
                value={form.name}
                maxLength={80}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`description-${product.id}`}>Descrição</Label>
              <Input
                id={`description-${product.id}`}
                value={form.description}
                maxLength={300}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`price-${product.id}`}>Preço</Label>
              <NumericFormat
                id={`price-${product.id}`}
                customInput={Input}
                prefix="R$ "
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                inputMode="decimal"
                value={form.price / 100}
                onValueChange={({ floatValue }) =>
                  setForm({
                    ...form,
                    price: Math.round((floatValue ?? 0) * 100),
                  })
                }
              />
            </div>
          </form>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form={`edit-${product.id}`}
              className="rounded-full"
              disabled={isPending}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductRow;
