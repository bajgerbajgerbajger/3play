# Návrh obrazovek: Registrace (Google‑styl wizard)

## Globální design (desktop-first)
- Layout: hybrid CSS Grid + Flexbox. Celá stránka vycentrovaná, max-width 1040px; uvnitř 2 sloupce (vlevo formulář, vpravo důvěryhodnost / pomoc), na mobile 1 sloupec (stack).
- Spacing: 8px baseline; karty 24–32px padding; mezery mezi prvky 12–16px.
- Typografie: základ 16px; H1 28–32px; popisky 12–13px; důraz na čitelnost.
- Barvy (tokeny):
  - bg: #0B0F17 (nebo světlá varianta dle brandu), surface: #121A2A, border: rgba(255,255,255,0.08)
  - primary: brand primary; hover: +8% brightness
  - success: #2ECC71, warning: #F1C40F, error: #E74C3C
- Tlačítka: Primary (vyplněné), Secondary (outline), Ghost (text). Disabled stav snižuje kontrast a vypíná hover.
- Linky: podtržení pouze na hover; vždy s ikonou externího odkazu pro právní dokumenty.
- Animace: framer-motion, 180–240ms ease-out; přechod kroků (slide + fade), validace (jemné „shake“ při error), progress bar (plynulé doplnění).

## Stránka: Registrace (wizard)
### Meta informace
- Title: „Vytvořit účet | 3Play“
- Description: „Rychlá registrace ve 4 krocích. Ověření emailu po prvním kroku.“
- OG: og:title, og:description, og:type=website

### Struktura stránky
- Horní lišta (minimal): logo vlevo, „Už máš účet? Přihlásit se“ vpravo.
- Hlavní obsah: Card (elevation) se 2 sloupci:
  - Levý sloupec: wizard (nadpis kroku, inputy, CTA)
  - Pravý sloupec: panel důvěry (security, privacy, help)
- Spodní řádek: odkazy „Podmínky“, „Zásady soukromí“, „Kontakt“.

### Sdílené komponenty wizardu
- Progress header: „Krok X ze 4“ + tenký progress bar.
- Step container: animovaný přechod (enter/exit). Zachovat výšku (layout animations), aby stránka „neskákala“.
- Inline validace: pod polem krátká, konkrétní chyba; nad formulářem pouze souhrn při submit.
- Důvěryhodnost panel:
  - „Tvoje data jsou v bezpečí“ + 2–3 bullet body (šifrování, žádný spam, kontrola souhlasů)
  - „Proč potřebujeme telefon?“ tooltip/accordion s vysvětlením.

### Krok 1 – Účet (email + heslo + právní souhlas)
- Nadpis: „Vytvoř si účet“
- Pole:
  - Email (povinné): placeholder „např. jana@domena.cz“, validace formátu.
  - Heslo (povinné): minimální požadavky zobrazené pod polem; indikátor síly.
- Souhlasy (povinné):
  - Checkbox: „Souhlasím s Podmínkami používání“ (link).
  - Checkbox: „Souhlasím se Zásadami soukromí“ (link).
- CTA:
  - Primary: „Pokračovat“ (odeslat registraci, spustit odeslání ověřovacího emailu).
  - Sekundární: „Zpět“ skryté (na prvním kroku není).
- Důvěryhodnost mikrocopy pod CTA: „Ověření emailu proběhne hned v dalším kroku.“

### Krok 2 – Ověření emailu (gating)
- Nadpis: „Ověř svůj email“
- Obsah:
  - Status karta: „Poslali jsme odkaz na {email}“.
  - Instrukce: 3 krátké kroky („Otevři email“, „Klikni na odkaz“, „Vrátíš se sem“).
  - Resend: tlačítko „Poslat znovu“ + cooldown (např. 30–60s) a informace o spamu.
  - „Změnit email“ (link) → vrátí na Krok 1 a umožní upravit email.
- Pokračování:
  - Primary „Pokračovat“ disabled, dokud není email ověřen.
  - Auto-advance po úspěšném návratu z odkazu (optimisticky s loaderem).

### Stránka: Potvrzení ověření emailu (/auth/callback)
- Meta: Title „Email ověřen | 3Play“
- Layout: jednoduchá karta uprostřed.
- Stavy:
  - Success: ikona + text „Email ověřen. Pokračujeme v registraci…“ + auto redirect do /register (Krok 3).
  - Error: text „Ověření se nepodařilo“ + CTA „Zkusit znovu“ (zpět na Krok 2) + „Kontaktovat podporu“.

### Krok 3 – Telefon & souhlasy kontaktu
- Nadpis: „Zabezpečení účtu“
- Pole:
  - Telefon (povinné): country select + číslo; okamžitá validace.
- Souhlasy:
  - Povinný checkbox: „Souhlasím, že mě můžete kontaktovat přes SMS/telefon kvůli účtu a bezpečnosti.“
  - Volitelný checkbox: „Chci dostávat marketingové novinky.“
  - Pod čárou: „Souhlasy můžeš kdykoliv změnit“ (pokud bude v produktu stránka nastavení; pokud ne, uvést „kontaktuj podporu“).
- CTA:
  - Primary: „Pokračovat“
  - Secondary: „Zpět“ (na Krok 2)

### Krok 4 – Dokončení
- Nadpis: „Hotovo“
- Shrnutí: email, telefon, souhlasy (přehledné řádky).
- CTA: Primary „Přejít do aplikace“
- Důvěra: krátké potvrzení „Děkujeme — tvé souhlasy evidujeme s časem a verzí.“

## Stránka: Přihlášení
### Meta informace
- Title: „Přihlášení | 3Play“
- Description: „Přihlas se ke svému účtu.“

### Struktura a komponenty
- Karta uprostřed (max-width 420–480px).
- Pole: Email, Heslo.
- CTA: „Přihlásit se“.
- Linky: „Zapomněl/a jsi heslo?“ a „Vytvořit účet“.
- Dů