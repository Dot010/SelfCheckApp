// Shared by the product page (to price and validate the customer's choices as
// they make them) and by the order action (to do the same on the server, where
// it actually counts).

export interface OptionLike {
  id: string;
  name: string;
  price: number;
}

export interface OptionGroupLike {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  options: OptionLike[];
}

export type SelectedOptionsResult =
  | { ok: true; options: OptionLike[]; extraPrice: number }
  | { ok: false; error: string };

export const resolveSelectedOptions = (
  groups: OptionGroupLike[],
  selectedIds: string[],
): SelectedOptionsResult => {
  const selected = new Set(selectedIds);
  if (selected.size !== selectedIds.length) {
    return { ok: false, error: "Opção repetida." };
  }

  const options: OptionLike[] = [];
  for (const group of groups) {
    const chosen = group.options.filter((option) => selected.has(option.id));
    if (chosen.length < group.minSelect) {
      const amount =
        group.minSelect === 1 ? "uma opção" : `${group.minSelect} opções`;
      return {
        ok: false,
        error: `Escolha ${amount} em ${group.name.toLowerCase()}.`,
      };
    }
    if (chosen.length > group.maxSelect) {
      return {
        ok: false,
        error: `Escolha no máximo ${group.maxSelect} em ${group.name.toLowerCase()}.`,
      };
    }
    options.push(...chosen);
  }

  // Every id must belong to one of this product's groups.
  if (options.length !== selected.size) {
    return { ok: false, error: "Opção indisponível." };
  }

  return {
    ok: true,
    options,
    extraPrice: options.reduce((sum, option) => sum + option.price, 0),
  };
};

export const defaultOptionIds = (
  groups: Array<{ options: Array<{ id: string; isDefault: boolean }> }>,
) =>
  groups.flatMap((group) =>
    group.options.filter((option) => option.isDefault).map((o) => o.id),
  );
