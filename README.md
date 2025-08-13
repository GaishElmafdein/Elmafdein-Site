## Gaish Elmafdein Monorepo (Root)

This root now only aggregates multiple subprojects. The active web application lives entirely in:

`/gaish-elmafdein-nextjs`

All dependency management, scripts, builds and deployments MUST be executed inside that folder.

### Active App
Next.js 15 (App Router) + TypeScript + Tailwind (sacred theme)

### Other Directories
- `backend/` Python book API utilities
- `orthodox-book-api/` Packaged API variant
- `orthodox-book-scraper/` Node scraping tool

### Standard Workflow
```bash
cd gaish-elmafdein-nextjs
npm install            # first time / after dependency changes
npm run dev            # local development (http://localhost:3000)
npm run type-check     # TS types
npm run lint           # ESLint
npm run build          # production build
npm run start          # start built app
```

### Deployment
1. Ensure clean build: `npm run build`
2. Deploy folder `/gaish-elmafdein-nextjs` to hosting (Vercel / Railway Node service)
3. Set environment variables within hosting dashboard if needed (Supabase keys, etc.)

### Why Single Dependency Source?
Previously there was a root `package.json` that proxied scripts. This caused duplicate lockfile warnings and confusion. It was intentionally removed so the Next.js app is authoritative.

### Notes
- Run commands ONLY after changing into `gaish-elmafdein-nextjs`.
- Do not recreate a root package.json unless you intend to manage a true workspace setup.

✝  Soli Deo Gloria ✝
