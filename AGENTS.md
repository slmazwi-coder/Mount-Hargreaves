# AGENTS.md

## Project
Mount Hargreaves Senior Secondary School website — React 19 + TypeScript + Vite 6,
Tailwind 4, react-router-dom v7. Public marketing site plus a client-only admin area.

## Build / run
- `npm install`
- `npm run build` — Vite build to `dist/`
- `npm run lint` — `tsc --noEmit`
- `npm run dev` — dev server on port 3000

## Hosting
- **Primary:** Vercel. Project `mount-hargreaves`
  (project id `prj_SiGQdKUuCGa2udkX2IOaYmCyGN9A`, team `team_ltx8xlbloizEaDmvlKPIIIgk`).
  Linked to this GitHub repo; pushes to `main` auto-deploy.
- **Domain:** `www.mthargreavessss.co.za` is primary. The apex
  `mthargreavessss.co.za` and `mount-hargreaves.vercel.app` 307/308-redirect to `www`.
  DNS is managed at Host Africa (nameservers `dan1.host-ww.net`, `dan2.host-ww.net`).
  Required records: `www` CNAME -> `cname.vercel-dns.com`, apex A -> `76.76.21.21`.
- **Fallback:** `.github/workflows/deploy.yml` FTP-deploys `dist/` to Host Africa
  `/public_html/` on every push to `main`. Intentionally kept as a hot standby.

## Gotchas
- **Vite `base` must stay `'/'`** (absolute). With the old `'./'`, Vite emitted relative
  asset URLs (`./assets/...`); on a deep link such as `/admissions` the browser requested
  `/admissions/assets/*.js`, which the SPA rewrite served as `index.html` (text/html),
  leaving the page blank. Fixed in commit 87edd44.
- **`vercel.json`** rewrites all paths to `/index.html` (SPA). Keep it.
- **Unused code:** `src/services/supabase.ts` and `src/services/geminiService.ts` are not
  imported anywhere. The admin area persists to `localStorage` via
  `src/admin/utils/storage.ts`. So Supabase/Gemini env vars are not needed to build or run.
- **Chatbot** (`src/components/ChatbotWidget.tsx`) calls the Anthropic API directly from the
  browser (no key configured) and optionally VulaVula for language detect/translate via
  `VITE_VULAVULA_API_KEY`. It degrades gracefully when keys are absent.
- Vercel deployment protection is set to `all_except_custom_domains`, so the custom domain
  is publicly reachable but `*.vercel.app` preview URLs require auth.
- `GEMINI_API_KEY` / `VULAVULA_API_KEY` are injected at build time by `vite.config.ts`
  `define`; changing them requires a redeploy, not just an env-var change.

## Conventions
- Client-only; no server. Admin auth is a `localStorage` flag (`admin_auth`), not real auth.
- Keep `index.html` SEO/canonical tags pointing at `https://www.mthargreavessss.co.za/`.
