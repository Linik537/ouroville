# Fix: header logo breaks on Vercel/GitHub deploys

## Diagnosis

- `tsconfig.json` and `vite.config.ts` are correct — no changes needed.
- Root cause of the broken top-left icon on Vercel: `src/components/site/Header.tsx` imports the logo via `src/assets/ouroville-logo-new.jpg.asset.json`. That file is only a pointer; its `url` (`/__l5e/assets-v1/.../ouroville-logo-new.jpg`) is served exclusively by Lovable's hosting. Outside Lovable (GitHub/Vercel) the URL 404s, so the `<img>` fails and the browser shows the alt text / file name instead.
- The favicon (`public/favicon.png`) is a real binary file in the repo, so it works anywhere — no fix needed there.

## Fix

1. Download the actual logo image from the Lovable asset URL and save it as a real file at `src/assets/ouroville-logo.jpg` (committed to the repo, so it ships with the code to GitHub/Vercel).
2. Update `src/components/site/Header.tsx` to import the image directly (`import logo from "@/assets/ouroville-logo.jpg"`) and use `src={logo}` instead of `logo.url`.
3. Delete the now-unused pointer files `src/assets/ouroville-logo-new.jpg.asset.json` and `src/assets/logo.jpg.asset.json`.
4. Verify the build passes and the logo still renders in the preview.

## Result

The header logo becomes a normal bundled asset: it works identically in the Lovable preview, on the published Lovable site, and on any external host (Vercel, Netlify, etc.).
