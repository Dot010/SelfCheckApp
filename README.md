# SelfCheckApp

Sistema de autoatendimento para restaurantes: o cliente escolhe se vai comer no local ou levar, monta o pedido pelo cardápio digital, paga online com Stripe e acompanha o status do pedido.

Demo: https://self-check-app.vercel.app

## Tecnologias

- Next.js 15 (App Router, Server Components e Server Actions)
- React 19 e TypeScript
- Tailwind CSS e shadcn/ui
- Prisma ORM com PostgreSQL
- Stripe Checkout e webhooks
- Zod e React Hook Form para validação

## Restaurante de demonstração

O seed cria a **Tigela**, uma loja de açaí fictícia com açaís, bowls, smoothies e picolés. As ilustrações dos produtos, o logo e a capa são originais, feitos em SVG para este projeto, e ficam em `public/tigela`.

## Funcionalidades

- Escolha entre comer no local ou levar
- Cardápio por categorias, página de produto e sacola salva no navegador
- Checkout com validação de nome e CPF
- Pagamento com cartão ou boleto pelo Stripe Checkout
- Status do pedido atualizado pelo webhook do Stripe, inclusive para pagamentos assíncronos (boleto)
- Consulta de pedidos pelo CPF, guardado em cookie e nunca na URL

## Decisões técnicas

- **Preços em centavos (inteiros).** Valores monetários nunca usam ponto flutuante, evitando erros de arredondamento no total e no Stripe.
- **O servidor não confia no cliente.** Server Actions validam a entrada com Zod e buscam preços e itens no banco. A sessão do Stripe é montada a partir do pedido salvo.
- **Webhook idempotente.** Só pedidos pendentes mudam de status, então eventos repetidos do Stripe não causam efeitos duplicados.

## Estrutura

```text
src/
├── app/
│   ├── [slug]/                 # Páginas de cada restaurante
│   │   ├── menu/               # Cardápio, produto, sacola e checkout
│   │   │   ├── actions/        # Server Actions (criar pedido, checkout)
│   │   │   ├── contexts/       # Contexto da sacola
│   │   │   └── helpers/        # Validação de CPF
│   │   └── orders/             # Acompanhamento de pedidos
│   └── api/webhooks/stripe/    # Webhook do Stripe
├── components/ui/              # Componentes shadcn/ui
├── data/                       # Consultas reutilizáveis
├── helpers/                    # Formatação de moeda
└── lib/                        # Prisma, Stripe e cookies
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

## Rodando localmente

Pré-requisitos: Node.js 20+, PostgreSQL e a [Stripe CLI](https://docs.stripe.com/stripe-cli).

```bash
git clone https://github.com/Dot010/SelfCheckApp.git
cd SelfCheckApp
npm install
cp .env.example .env   # preencha as variáveis
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Acesse http://localhost:3000. A página inicial leva ao primeiro restaurante cadastrado.

> O seed apaga os restaurantes existentes (e, em cascata, seus pedidos) antes de criar a Tigela.

### Testando pagamentos

Em outro terminal, encaminhe os eventos do Stripe para o webhook local:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copie o `whsec_...` exibido para `STRIPE_WEBHOOK_SECRET_KEY` no `.env`. No checkout, use o cartão de teste `4242 4242 4242 4242`, com qualquer data futura e qualquer CVC.

## Autor

Jonathan Carvalho, [GitHub](https://github.com/Dot010)
