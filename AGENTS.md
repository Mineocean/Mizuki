# AGENTS.md — Mizuki

Astro 6.1 static blog, forked from `matsuzaka-yuki/Mizuki`. Deployed on Vercel.

## Quick commands

```bash
pnpm dev            # dev server (auto-syncs content)
pnpm build           # full production build
pnpm check           # astro check (astro typecheck)
pnpm type-check      # tsc --noEmit
pnpm lint            # eslint ./src --fix
pnpm format          # prettier --write ./src
pnpm new-post        # create a new blog post
```

## Code style

- tabs (4-width), semicolons, double-quotes, trailing-commas (`.prettierrc`)
- eslint + prettier-plugin-astro + prettier-plugin-svelte

## Architecture

- **Config**: `src/config.ts` is the single source of truth (siteURL, navbar, sidebar layout, music, fonts, etc.).
  - `siteURL` must end with `/`.
  - `astro.config.mjs` reads `siteURL` from `siteConfig`, do not edit it directly.
- **Components**: atomic design — `atoms/` → `widgets/` → `features/` → `organisms/`
  - `.astro` files for static/server components; `.svelte` for client-interactive.
  - Svelte components must use `import Icon from "@iconify/svelte"` (prop: `icon`).
  - Astro components use `import { Icon } from "astro-icon/components"` (prop: `name`).
- **Layouts**: `src/layouts/Layout.astro` wraps all pages; `MainGridLayout.astro` for sidebar grid.
- **Content**: `src/content/posts/*.md` (blog), `src/content/spec/*.md` (about, friends).
- **Pages**: file-based routing under `src/pages/`.
- **Navbar**: `src/components/organisms/navigation/Navbar.astro` uses direct `<img>` tags (no `<picture>` wrapping). Icon/logo paths should not have a leading `/` — `url()` helper prepends BASE_URL.

## Build pipeline

`pnpm build` runs sequentially:
1. `scripts/update-anime.mjs` — fetches bangumi/bilibili data → `src/data/`
2. `astro build` → `dist/`
3. `pagefind --site dist` — search index
4. `scripts/compress-fonts.js` — font subsetting + TTF→WOFF2 (requires fontmin; gracefully skips if unavailable)

`prebuild` runs `scripts/sync-content.js || true` — content separation sync (disabled by default, enable with `ENABLE_CONTENT_SYNC=true` in `.env`).

## Vercel deployment

- `vercel.json` configures framework=astro, builds to `dist/`.
- `installCommand` installs Python `setuptools` before `pnpm install` (needed for `ttf2woff2` native compilation on Node 24).
- Keeps Node at latest (no `.nvmrc` or `engines.node` pin).

## Environment

- `.env` is gitignored; use `.env.example` as template.
- `content/` and `*.backup` are gitignored (content-separation artifacts).
- Generated data files `src/data/bangumi-data.json` and `src/data/bilibili-data.json` are gitignored.

## Git remotes

| Remote     | URL                                         |
|------------|---------------------------------------------|
| `origin`   | `https://github.com/Mineocean/Mizuki.git`   |
| `upstream` | `https://github.com/matsuzaka-yuki/Mizuki`  |
| `lyravoid` | `https://github.com/LyraVoid/Mizuki.git`    |

## Gotchas

- **Content sync defaults OFF**: `ENABLE_CONTENT_SYNC` requires explicit `true` (was previously inverted).
- **Music player disabled**: `musicPlayerConfig.enable = false`, `music-sidebar` removed from sidebar layout.
- **Font compression**: `ttf2woff2` is a native dep of `fontmin`; SKippable if it fails to compile.
- **Swup**: client-side page transitions with cache enabled. May serve stale pages after deploy — hard-refresh if content seems outdated.
- **pageScaling**: adjusts `fontSize` on root element for screens > 1280px (disabled on touch/tablet/mobile). `targetWidth` in `src/config.ts`.
