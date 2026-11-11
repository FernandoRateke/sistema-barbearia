# Sistema de Barbearia

Sistema para a barbearia gerenciar clientes, barbeiros, serviços e agendamentos.

- `backend` → Node.js + Express + Prisma + PostgreSQL
  - senha criptografada com `bcryptjs`
  - login com JWT guardado em cookie (`cookie-parser`)
- `frontend` → React + Vite

## Back-end

1. Crie o banco `sistema_barbearia` no PostgreSQL.
2. Copie o `.env.example` para `.env` e ajuste usuário/senha do banco e o `JWT_SECRET`.

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

## Front-end

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`, crie uma conta e faça login.
