# Deploy na GitHub Pages

Projekt je připravený pro veřejné nasazení přes GitHub Actions workflow:

- `.github/workflows/deploy-pages.yml`

## Postup

1. Pushni repozitář na GitHub (větve `main` nebo `master`).
2. V GitHub repozitáři otevři **Settings → Pages**.
3. V části **Build and deployment** nastav **Source = GitHub Actions**.
4. Po pushi se spustí workflow **Deploy static site to GitHub Pages**.
5. Po dokončení bude aplikace dostupná na URL z běhu workflow (např. `https://<user>.github.io/<repo>/`).

## Poznámka k PWA

V `manifest.webmanifest` je použito:

- `start_url: "./"`
- `scope: "./"`

Díky tomu funguje nasazení i pod cestou repozitáře (`/<repo>/`) na GitHub Pages.
