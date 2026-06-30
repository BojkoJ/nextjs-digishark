# DigiShark – Moderní fullstack e-commerce tržiště pro digitální produkty

Postaveno na **Next.js 15 (App Router)**, **Payload 3**, **tRPC 11**, **TypeScript**, **Tailwind CSS** a **shadcn/ui**.

> Projekt byl postaven v lednu-březnu 2024

> Projekt byl migrován 30.06.2026 z **Payload 2 (self-hosted přes Express)** na **Payload 3**, který běží
> nativně uvnitř Next.js. Díky tomu odpadá vlastní Express server a aplikace běží plně na **Vercelu**.

---

## Hlavní změny oproti původní verzi

| Oblast         | Dříve (Payload 2)                       | Nyní (Payload 3)                                    |
| -------------- | --------------------------------------- | --------------------------------------------------- |
| Hosting        | Vlastní Express server (`server.ts`)    | Nativně v Next.js → běží na Vercelu                 |
| Databáze       | MongoDB                                 | **PostgreSQL** (`@payloadcms/db-postgres`)          |
| Úložiště médií | Lokální filesystem (`staticDir`)        | **UploadThing** (`@payloadcms/storage-uploadthing`) |
| Admin panel    | `/sell` (přes Express)                  | `/sell` (route group `(payload)`)                   |
| Bundler        | webpack (`@payloadcms/bundler-webpack`) | Next.js (žádný extra bundler)                       |
| Editor         | Slate                                   | Lexical (`@payloadcms/richtext-lexical`)            |
| E-maily        | nodemailer v `get-payload.ts`           | `@payloadcms/email-nodemailer` v konfiguraci        |
| API vrstva     | tRPC 10 přes Express adaptér            | tRPC 11 přes fetch route handler                    |

Struktura `app/` je nyní rozdělená na dvě route groups:

- `src/app/(frontend)/` – veřejný web (každá má vlastní root layout)
- `src/app/(payload)/` – admin panel + REST/GraphQL API generované Payloadem

---

## Lokální spuštění

```bash
# 1. Nainstalujte závislosti (doporučeno pnpm)
pnpm install

# 2. Vytvořte .env podle vzoru a vyplň hodnoty
cp .env.example .env

# 3. Vygenerujte TypeScript typy z Payload konfigurace
pnpm generate:types

# 4. Spusťte vývojový server
pnpm dev
```

- Web poběží na `http://localhost:3000`
- Admin (CMS) na `http://localhost:3000/sell`

Při prvním spuštění Payload automaticky vytvoří tabulky v Postgres (dev mód).
Otevřete `/sell` a založte si prvního uživatele, tomu pak v tabulce `users` nastav `role = admin`,
aby viděl všechny kolekce.

> **Proměnné prostředí**: kompletní seznam i s popisem je v souboru [.env.example](.env.example).

---

První admin účet vytvoříte registrací na `/sell`; pak danému uživateli v Payload CMS
nastavte `role = admin`.

---

## Užitečné příkazy

```bash
pnpm dev                 # vývojový server
pnpm build               # produkční build
pnpm start               # spuštění produkčního buildu
pnpm generate:types      # regenerace src/payload-types.ts z konfigurace
pnpm generate:importmap  # regenerace import map (jen když přidáš custom Payload komponenty)
pnpm lint                # ESLint
```
