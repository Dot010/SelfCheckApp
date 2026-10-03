import { Prisma, PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

// Prices are in cents. Images live in /public/tigela.

// Toppings offered on every açaí and bowl. `key` is also the 3D preview key.
const toppings = [
  { key: "granola", name: "Granola", price: 0 },
  { key: "banana", name: "Banana", price: 0 },
  { key: "leitepo", name: "Leite em pó", price: 200 },
  { key: "morango", name: "Morango", price: 300 },
  { key: "condensado", name: "Leite condensado", price: 200 },
  { key: "pacoca", name: "Paçoca", price: 250 },
  { key: "kiwi", name: "Kiwi", price: 350 },
  { key: "ninho", name: "Creme de ninho", price: 400 },
  { key: "coco", name: "Coco ralado", price: 200 },
  { key: "manga", name: "Manga", price: 300 },
];

// The product price is the 300 ml price; bigger sizes add to it.
const sizes = [
  { key: "size-300", name: "300 ml", price: 0 },
  { key: "size-500", name: "500 ml", price: 600, isDefault: true },
  { key: "size-700", name: "700 ml", price: 1200 },
];

interface MenuProduct {
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  // Customizable products get a size choice and/or a toppings choice.
  hasSizes?: boolean;
  // Toppings that come with the product: pre-selected and free.
  includedToppings?: string[];
  maxToppings?: number;
}

const menu: Array<{ category: string; products: MenuProduct[] }> = [
  {
    category: "Monte o seu",
    products: [
      {
        name: "Açaí do seu jeito",
        description: "Escolha o tamanho e até 4 complementos.",
        price: 1690,
        image: "acai-puro",
        ingredients: ["Açaí"],
        hasSizes: true,
        includedToppings: [],
        maxToppings: 4,
      },
    ],
  },
  {
    category: "Açaí",
    products: [
      {
        name: "Açaí Tradicional",
        description: "Açaí batido na hora com granola crocante e banana.",
        price: 1690,
        image: "acai-tradicional",
        ingredients: ["Açaí", "Granola", "Banana"],
        hasSizes: true,
        includedToppings: ["granola", "banana"],
      },
      {
        name: "Açaí Ninho e Morango",
        description:
          "Creme de leite ninho, morangos frescos e um fio de leite condensado.",
        price: 2190,
        image: "acai-ninho-morango",
        ingredients: ["Açaí", "Creme de ninho", "Morango", "Leite condensado"],
        hasSizes: true,
        includedToppings: ["ninho", "morango", "condensado"],
      },
      {
        name: "Açaí com Paçoca",
        description: "Paçoca esfarelada, banana e leite em pó.",
        price: 1990,
        image: "acai-pacoca",
        ingredients: ["Açaí", "Paçoca", "Banana", "Leite em pó"],
        hasSizes: true,
        includedToppings: ["pacoca", "banana", "leitepo"],
      },
    ],
  },
  {
    category: "Bowls",
    products: [
      {
        name: "Bowl Tropical",
        description: "Manga, kiwi, coco ralado e granola sobre açaí.",
        price: 2890,
        image: "bowl-tropical",
        ingredients: ["Açaí", "Manga", "Kiwi", "Coco ralado", "Granola"],
        includedToppings: ["manga", "kiwi", "coco", "granola"],
      },
      {
        name: "Bowl Frutas Vermelhas",
        description: "Morango, banana, granola e leite condensado.",
        price: 2690,
        image: "bowl-frutas-vermelhas",
        ingredients: [
          "Açaí",
          "Morango",
          "Banana",
          "Granola",
          "Leite condensado",
        ],
        includedToppings: ["morango", "banana", "granola", "condensado"],
      },
      {
        name: "Bowl Energia",
        description: "Banana, paçoca, granola e leite em pó para o pós-treino.",
        price: 2990,
        image: "bowl-energia",
        ingredients: ["Açaí", "Banana", "Paçoca", "Granola", "Leite em pó"],
        includedToppings: ["banana", "pacoca", "granola", "leitepo"],
      },
    ],
  },
  {
    category: "Smoothies",
    products: [
      {
        name: "Smoothie de Açaí com Banana 400 ml",
        description: "Açaí e banana batidos com leite.",
        price: 1690,
        image: "smoothie-acai-banana",
        ingredients: ["Açaí", "Banana", "Leite"],
      },
      {
        name: "Smoothie de Manga 400 ml",
        description: "Manga com iogurte natural.",
        price: 1490,
        image: "smoothie-manga",
        ingredients: ["Manga", "Iogurte natural"],
      },
      {
        name: "Smoothie de Morango 400 ml",
        description: "Morango e banana batidos com leite.",
        price: 1590,
        image: "smoothie-morango",
        ingredients: ["Morango", "Banana", "Leite"],
      },
      {
        name: "Água de Coco 300 ml",
        description: "Natural e gelada.",
        price: 790,
        image: "agua-de-coco",
        ingredients: ["Água de coco"],
      },
    ],
  },
  {
    category: "Picolés",
    products: [
      {
        name: "Picolé de Açaí",
        description: "Açaí puro, sem açúcar.",
        price: 900,
        image: "picole-acai",
        ingredients: ["Açaí"],
      },
      {
        name: "Picolé de Açaí com Ninho",
        description: "Açaí com recheio cremoso de leite ninho.",
        price: 1100,
        image: "picole-acai-ninho",
        ingredients: ["Açaí", "Creme de ninho"],
      },
    ],
  },
];

const optionGroupsFor = (
  product: MenuProduct,
): Prisma.ProductOptionGroupCreateWithoutProductInput[] => {
  const groups: Prisma.ProductOptionGroupCreateWithoutProductInput[] = [];
  if (product.hasSizes) {
    groups.push({
      name: "Tamanho",
      minSelect: 1,
      maxSelect: 1,
      position: 0,
      options: {
        create: sizes.map((size, position) => ({
          name: size.name,
          price: size.price,
          isDefault: size.isDefault ?? false,
          visualKey: size.key,
          position,
        })),
      },
    });
  }
  if (product.includedToppings) {
    const included = product.includedToppings;
    groups.push({
      name: "Complementos",
      minSelect: 0,
      maxSelect: product.maxToppings ?? included.length + 2,
      position: 1,
      options: {
        create: toppings.map((topping, position) => ({
          name: topping.name,
          // Toppings that come with the product are free.
          price: included.includes(topping.key) ? 0 : topping.price,
          isDefault: included.includes(topping.key),
          visualKey: topping.key,
          position,
        })),
      },
    });
  }
  return groups;
};

const main = async () => {
  await prismaClient.$transaction(
    async (tx: Prisma.TransactionClient) => {
      // Deleting restaurants cascades to categories, products and orders.
      await tx.restaurant.deleteMany();

      const restaurant = await tx.restaurant.create({
        data: {
          name: "Tigela",
          slug: "tigela",
          description: "Açaí cremoso, montado do seu jeito",
          avatarImageUrl: "/tigela/logo.svg",
          coverImageUrl: "/tigela/cover.svg",
        },
      });

      // Categories are created one at a time, in menu order.
      for (const { category, products } of menu) {
        const menuCategory = await tx.menuCategory.create({
          data: { name: category, restaurantId: restaurant.id },
        });
        for (const product of products) {
          await tx.product.create({
            data: {
              name: product.name,
              description: product.description,
              price: product.price,
              imageUrl: `/tigela/products/${product.image}.svg`,
              ingredients: product.ingredients,
              menuCategoryId: menuCategory.id,
              restaurantId: restaurant.id,
              optionGroups: { create: optionGroupsFor(product) },
            },
          });
        }
      }
    },
    { timeout: 30_000 },
  );
};

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
