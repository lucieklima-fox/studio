
# Melody Maestro - Hudební výchova hrou

Tato aplikace je vyvíjena v prostředí Next.js 15 s využitím Firebase (pro databázi a autentizaci) a Genkit (pro AI kouče).

## Co je to terminál?
Terminál je okno (najdete ho ve spodní části tohoto prostředí), do kterého se píší textové příkazy. Je to jako psaní zpráv počítači, aby udělal přesně to, co chcete.

## Jak nahrát projekt na GitHub (Krok za krokem)

1. **Vytvořte si účet na GitHubu**: Jděte na [github.com](https://github.com/join) a zaregistrujte se.
2. **Vytvořte nový repozitář**: Klikněte na tlačítko "New" (nebo [zde](https://github.com/new)), pojmenujte projekt (např. `melody-maestro`) a klikněte na "Create repository". **Nevybírejte** možnost "Initialize this repository with a README".
3. **Získejte URL repozitáře**: Po vytvoření uvidíte URL adresu končící na `.git` (např. `https://github.com/vase-jmeno/melody-maestro.git`). Zkopírujte si ji.
4. **Otevřete terminál**: V dolní části tohoto prostředí klikněte na záložku **Terminal**.
5. **Spusťte tyto příkazy (postupně)**:
   ```bash
   git init
   git add .
   git commit -m "První verze Melody Maestro"
   git branch -M main
   git remote add origin <VLOŽTE_VAŠI_URL_ADRESU_Z_KROKU_3>
   git push -u origin main
   ```

## Jak nasadit na Netlify (ZDARMA a bez karty)

1. Přihlaste se na [Netlify.com](https://www.netlify.com/).
2. Klikněte na **"Add new site"** -> **"Import an existing project"**.
3. Vyberte **GitHub** a vyberte svůj repozitář `melody-maestro`.
4. Netlify vše nastaví automaticky díky souboru `netlify.toml`. Klikněte na **"Deploy site"**.
5. **DŮLEŽITÉ - AI KLÍČ**: Aby fungoval AI kouč, v administraci Netlify (Site Settings -> Environment variables) přidejte:
   - `GOOGLE_GENAI_API_KEY`: Váš klíč z [Google AI Studio](https://aistudio.google.com/).

## Funkce aplikace
- **Český hudební systém**: Rozsah kontra A (A1) až tříčárkované G (g3).
- **Značení**: Používá české názvy oktáv a tón "h" místo "B".
- **AI Kouč**: Personalizované lekce na základě vašeho pokroku.
- **Responzivita**: Klaviatura je na mobilech posuvná prstem.

```bash
# Lokální spuštění
npm install
npm run dev
```
