This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# sima-web

## Admin subdomain setup (admin.trysima.uz)

This app serves both `trysima.uz` (regular users) and `admin.trysima.uz` (super-admins) from a single Next.js / Vercel deploy. The host-based routing is handled in `proxy.ts`.

### 1. DNS (manual — do not automate)

Add an A-record in your DNS provider:

| Field  | Value        |
|--------|--------------|
| Name   | `admin`      |
| Type   | `A`          |
| Value  | `76.76.21.21`|
| TTL    | `300`        |

### 2. Vercel domain (manual)

1. Open **Vercel → Project → Settings → Domains**.
2. Click **Add** and enter `admin.trysima.uz`.
3. Vercel provisions an SSL certificate automatically (Let's Encrypt).

### 3. Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (all environments unless noted):

| Variable                    | Example value              | Purpose                                              |
|-----------------------------|----------------------------|------------------------------------------------------|
| `NEXT_PUBLIC_COOKIE_DOMAIN` | `.trysima.uz`              | Cross-subdomain cookie domain (leading dot required). Omit/leave blank on localhost. |
| `NEXT_PUBLIC_ADMIN_ORIGIN`  | `https://admin.trysima.uz` | Used by `proxy.ts` when redirecting SUPER_ADMIN to admin subdomain. |
| `NEXT_PUBLIC_USER_ORIGIN`   | `https://trysima.uz`       | Used by `proxy.ts` when redirecting non-admins to the user site. |

> **Local dev**: leave all three unset. `proxy.ts` detects localhost (no `.trysima.uz` host) and skips cross-origin redirects; cookies are set without `Domain` and `Secure` so they work over plain HTTP.
