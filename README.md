# Rumah Genset — Studio Denah 2D & Model 3D

Aplikasi React + Vite + Three.js untuk desain rumah genset: denah 2D terukur,
model 3D interaktif, POV semua sisi, perbandingan before–after, dan editor dimensi.

Live site: <https://nihtlouw.github.io/Rumah-Genset-before-after-Design-3D-v2/>

## Development

```bash
npm ci
npm run dev      # dev server (entry source ada di src/index.html)
npm run build    # hasil: dist/index.html (single file, semua aset inline)
npm run preview  # preview hasil build
```

## Cara deploy GitHub Pages bekerja

Repo ini memakai Pages **"Deploy from a branch"** (branch `main`, folder `/`),
yang artinya GitHub menyajikan **file mentah** dari root branch. Karena itu:

- **`index.html` di root = file hasil build (artefak).** Jangan diedit manual.
  Source aslinya ada di `src/index.html`.
- Setiap push ke `main`, workflow `.github/workflows/deploy.yml` otomatis
  menjalankan `vite build`, menyalin `dist/index.html` ke root `index.html`,
  dan meng-commit-nya bila berubah (push bot tidak memicu workflow ulang,
  plus trigger workflow mengabaikan path `index.html`).
- Workflow juga meng-upload artefak lewat `actions/deploy-pages`, jadi kalau
  nanti setting Pages diganti ke **"GitHub Actions"** (Settings → Pages →
  Build and deployment → Source), deploy tetap bekerja tanpa mengubah apa pun.
