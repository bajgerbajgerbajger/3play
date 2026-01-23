# Průvodce nasazením (Deployment Guide)

Aplikace je připravena k nasazení jako unifikovaná full-stack aplikace (Frontend + Backend v jednom).

## Doporučená metoda: Render.com

Pro tento typ projektu (Node.js + Express + React + MongoDB) je nejvhodnější platforma **Render**.

### Postup nasazení:

1.  **Vytvořte si účet** na [render.com](https://render.com).
2.  V dashboardu klikněte na **New +** a vyberte **Blueprints**.
3.  Propojte svůj GitHub účet a vyberte repozitář `3play`.
4.  Render automaticky detekuje soubor `render.yaml`.
5.  Budete vyzváni k zadání **Environment Variables** (proměnných prostředí):
    *   `MONGODB_URI`: Váš připojovací řetězec k MongoDB Atlas.
    *   `CLOUDINARY_CLOUD_NAME`: Název vašeho cloudu na Cloudinary.
    *   `CLOUDINARY_API_KEY`: API klíč z Cloudinary.
    *   `CLOUDINARY_API_SECRET`: API tajný klíč z Cloudinary.
6.  Klikněte na **Apply**. Render začne aplikaci sestavovat a nasazovat.

### Alternativní metoda: Ruční nastavení (Render/Railway/Heroku)

Pokud nepoužijete Blueprint, nastavte službu takto:
*   **Build Command:** `npm run build`
*   **Start Command:** `npm start`
*   **Environment Variables:** Stejné jako výše.

## Poznámky k architektuře

*   **Frontend:** Vite build se vytvoří do složky `dist`.
*   **Backend:** Express server (`api/server.ts`) běží přes `tsx` a v produkci servíruje statické soubory z `dist`.
*   **Databáze:** Aplikace vyžaduje externí MongoDB (např. MongoDB Atlas).
*   **Média:** Uploady jsou směrovány na Cloudinary (viz `src/lib/api.ts` a `api/_lib/lib/cloudinary.ts`). Lokální složka `uploads` slouží jen jako dočasné úložiště nebo fallback, na serverless hostingu (jako Vercel) by nefungovala trvale.

## Kontrola před nasazením

Ujistěte se, že máte v GitHub Secrets nebo u hostingu nastavené správné klíče. Lokální `.env` soubor se na server nenasazuje!
