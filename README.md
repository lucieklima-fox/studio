# Melody Maestro - Hudební výchova hrou

Tato aplikace je vyvíjena v prostředí Next.js 15 s využitím Firebase (pro databázi a autentizaci) a Genkit (pro AI kouče).

## Jak nasadit aplikaci ZDARMA (bez karty)

Pro nasazení doporučujeme **Netlify**, které nabízí bezplatný tarif a podporuje všechny funkce této aplikace (včetně AI).

### Krok 1: Nahrání na GitHub
1. Vytvořte si nový repozitář na [GitHubu](https://github.com/new).
2. Propojte svůj lokální kód s GitHubem:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/vase-jmeno/nazev-repozitáře.git
   git push -u origin main
   ```

### Krok 2: Propojení s Netlify
1. Přihlaste se na [Netlify.com](https://www.netlify.com/).
2. Klikněte na **"Add new site"** -> **"Import an existing project"**.
3. Vyberte GitHub a svůj repozitář.
4. Netlify automaticky detekuje Next.js a použije nastavení z přiloženého `netlify.toml`.

### Krok 3: Nastavení Environment Variables
V administraci Netlify (Site Settings -> Environment variables) přidejte tuto proměnnou:
- `GOOGLE_GENAI_API_KEY`: Váš klíč pro Gemini (získáte ZDARMA na [Google AI Studio](https://aistudio.google.com/)).

## Lokální vývoj
```bash
npm install
npm run dev
```

Aplikace poběží na `http://localhost:9002`.
    