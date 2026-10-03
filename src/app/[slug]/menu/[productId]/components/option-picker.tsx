"use client";

import { ProductOption, ProductOptionGroup } from "@prisma/client";
import { CheckIcon } from "lucide-react";

import { formatCurrency } from "@/helpers/format-currency";
import { toppingColors } from "@/helpers/topping-visuals";
import { cn } from "@/lib/utils";

type Group = ProductOptionGroup & { options: ProductOption[] };

interface OptionPickerProps {
  group: Group;
  basePrice: number;
  selectedIds: string[];
  onToggle: (group: Group, option: ProductOption) => void;
  limitReached: boolean;
}

const OptionPicker = ({
  group,
  basePrice,
  selectedIds,
  onToggle,
  limitReached,
}: OptionPickerProps) => {
  const isSingle = group.maxSelect === 1;
  const chosenCount = group.options.filter((o) =>
    selectedIds.includes(o.id),
  ).length;

  return (
    <section className="space-y-3" aria-labelledby={`group-${group.id}`}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id={`group-${group.id}`} className="text-lg font-bold">
          {group.name}
        </h2>
        {group.minSelect > 0 ? (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
            obrigatório
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            {chosenCount} de {group.maxSelect}
          </span>
        )}
      </div>

      <div
        className={cn(
          "grid gap-2",
          isSingle ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-2",
        )}
      >
        {group.options.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          const color = option.visualKey && toppingColors[option.visualKey];
          const priceLabel = isSingle
            ? formatCurrency(basePrice + option.price)
            : option.price > 0
              ? `+ ${formatCurrency(option.price)}`
              : option.isDefault
                ? "incluso"
                : "grátis";

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(group, option)}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-2xl border-2 px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSingle && "flex-col justify-center gap-0.5 py-3 text-center",
                isSelected
                  ? "border-primary bg-accent"
                  : "border-border bg-card hover:border-primary/40",
                !isSelected && limitReached && !isSingle && "opacity-60",
              )}
            >
              {!isSingle && (
                <span
                  aria-hidden
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {isSelected && <CheckIcon className="h-3.5 w-3.5" />}
                </span>
              )}
              {!isSingle && color && (
                <span
                  aria-hidden
                  className="h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: color }}
                />
              )}
              <span className={cn("font-medium", !isSingle && "flex-1")}>
                {option.name}
              </span>
              <span
                className={cn(
                  "text-xs",
                  isSelected && option.price > 0
                    ? "font-semibold text-primary"
                    : "text-muted-foreground",
                )}
              >
                {priceLabel}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default OptionPicker;
