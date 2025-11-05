# SelfCheckApp

Sistema de autoatendimento para restaurantes, desenvolvido com Next.js, TypeScript, Tailwind CSS, Prisma e Stripe.

## Sobre o Projeto

O SelfCheckApp foi desenvolvido para oferecer uma experiência moderna, prática e eficiente no processo de pedidos em restaurantes.  
A aplicação permite que o cliente visualize o cardápio, selecione produtos, finalize o pedido e realize o pagamento online, sem necessidade de atendimento presencial.

Além disso, o restaurante pode gerenciar seus pedidos em tempo real, atualizar produtos e monitorar o status das vendas, tudo em um único sistema.

Acesse a aplicação:  
https://self-check-app.vercel.app/fsw-donalds

## Desenvolvedor

Jonathan Carvalho — Desenvolvimento Full Stack

## Tecnologias Utilizadas

- Next.js 14 — Framework React para aplicações full stack  
- TypeScript — Superset do JavaScript com tipagem estática  
- Tailwind CSS — Framework CSS utilitário  
- Prisma ORM — Manipulação de banco de dados  
- PostgreSQL — Banco de dados relacional  
- Stripe — Processamento de pagamentos online  
- Vercel — Hospedagem e deploy contínuo  

## Funcionalidades

### Pedidos
- Criação e visualização de pedidos em tempo real  
- Atualização automática de status após confirmação de pagamento  
- Interface intuitiva e responsiva para o cliente  

### Pagamentos
- Integração com Stripe Checkout  
- Processamento seguro de pagamentos  
- Atualização de pedidos via webhook Stripe  

### Restaurante
- Gerenciamento de produtos e cardápio  
- Controle e acompanhamento dos pedidos  
- Revalidação automática de páginas  

### Interface
- Design limpo e responsivo  
- Componentes reutilizáveis  
- Feedback visual em todas as ações do usuário  

## Estrutura do Projeto
src/
├── app/
│ ├── [slug]/ # Área do restaurante
│ │ ├── menu/ # Exibição do cardápio e produtos
│ │ ├── orders/ # Pedidos e status
│ │ └── api/ # Integração com Stripe e banco
│ └── components/ # Componentes reutilizáveis
├── lib/
│ └── prisma.ts # Configuração do Prisma ORM
├── styles/
│ └── globals.css # Estilos globais
└── utils/
└── helpers.ts # Funções auxiliares


## Integração com Stripe

O sistema se comunica diretamente com a API do Stripe para processamento de pagamentos.  
O webhook recebe os seguintes eventos principais:

- `checkout.session.completed` → Atualiza o pedido para *Pagamento Confirmado*  
- `charge.failed` → Atualiza o pedido para *Pagamento Falhou*  

## Execução Local

1. Clone o repositório  
```bash
git clone https://github.com/Dot010/SelfCheckApp.git
cd SelfCheckApp
Instale as dependências

npm install


Configure o arquivo .env

DATABASE_URL="postgresql://usuario:senha@localhost:5432/selfcheckapp"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET_KEY="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."


Execute as migrações do Prisma

npx prisma migrate dev


Inicie o servidor

npm run dev


Acesse em: http://localhost:3000

Teste de Webhook

Para testar localmente os eventos de pagamento:

stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed

Objetivo Técnico

O projeto aplica conceitos de componentização, tipagem estática, rotas dinâmicas e integração com APIs REST, utilizando boas práticas de clean code, UI/UX e responsividade, com foco na experiência do usuário e eficiência operacional para restaurantes.

Contribuição

O projeto foi desenvolvido como parte de um estudo prático em desenvolvimento web e integração com sistemas de pagamento.
Para sugestões ou melhorias, entre em contato com o desenvolvedor.

Suporte

Para dúvidas ou suporte técnico, entre em contato com:

Jonathan Carvalho
GitHub

