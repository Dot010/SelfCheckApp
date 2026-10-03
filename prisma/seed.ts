import { Prisma, PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

// Prices are in cents. Images live in /public/tigela.
const menu: Array<{
  category: string;
  products: Array<{
    name: string;
    description: string;
    price: number;
    image: string;
    ingredients: string[];
  }>;
}> = [
  {
    category: "Açaí",
    products: [
      {
        name: "Açaí Tradicional 500 ml",
        description: "Açaí batido na hora com granola crocante e banana.",
        price: 2290,
        image: "acai-tradicional",
        ingredients: ["Açaí", "Granola", "Banana"],
      },
      {
        name: "Açaí Ninho e Morango 500 ml",
        description:
          "Creme de leite ninho, morangos frescos e um fio de leite condensado.",
        price: 2790,
        image: "acai-ninho-morango",
        ingredients: ["Açaí", "Creme de ninho", "Morango", "Leite condensado"],
      },
      {
        name: "Açaí com Paçoca 500 ml",
        description: "Paçoca esfarelada, banana e leite em pó.",
        price: 2590,
        image: "acai-pacoca",
        ingredients: ["Açaí", "Paçoca", "Banana", "Leite em pó"],
      },
      {
        name: "Açaí Puro 300 ml",
        description: "Só açaí, cremoso e sem complementos.",
        price: 1490,
        image: "acai-puro",
        ingredients: ["Açaí"],
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
      },
      {
        name: "Bowl Energia",
        description: "Banana, paçoca, granola e leite em pó para o pós-treino.",
        price: 2990,
        image: "bowl-energia",
        ingredients: ["Açaí", "Banana", "Paçoca", "Granola", "Leite em pó"],
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

const main = async () => {
  await prismaClient.$transaction(async (tx: Prisma.TransactionClient) => {
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
      await tx.product.createMany({
        data: products.map(({ image, ...product }) => ({
          ...product,
          imageUrl: `/tigela/products/${image}.svg`,
          menuCategoryId: menuCategory.id,
          restaurantId: restaurant.id,
        })),
      });
    }
  });
};

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
