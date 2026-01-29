# Jak vytvořit instalační aplikaci (APK / iOS)

Tento návod vás provede procesem vytvoření mobilní aplikace z 3Play platformy.

## Prerekvizity

Než začnete, ujistěte se, že máte nainstalováno:
1. **Node.js** (již máte)
2. **Android Studio** (pro Android APK) - stáhněte z [developer.android.com](https://developer.android.com/studio)
3. **Xcode** (pro iOS, pouze na macOS) - stáhněte z App Store

## 1. Příprava projektu

Nejprve musíme "postavit" webovou část aplikace a synchronizovat ji s mobilními projekty.

Otevřete terminál ve složce projektu a spusťte:

```bash
# 1. Sestavení webové aplikace (vytvoří složku dist)
npm run build

# 2. Synchronizace změn do Android/iOS složek
npx cap sync
```

## 2. Vytvoření Android APK (Windows/Mac/Linux)

Tento krok vytvoří instalační soubor `.apk`, který můžete poslat do telefonu.

1. Spusťte Android Studio přes příkaz:
   ```bash
   npx cap open android
   ```
   (Nebo ručně otevřete složku `android` v Android Studiu)

2. V Android Studiu:
   - Počkejte, až se projekt načte (Gradle Sync).
   - V horním menu vyberte **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
   - Po dokončení se vpravo dole objeví notifikace "APK(s) generated successfully". Klikněte na **locate**.
   - Najdete soubor `app-debug.apk`. Tento soubor můžete zkopírovat do telefonu a nainstalovat.

**Pro publikaci na Google Play:**
   - Místo "Build APK" vyberte **Generate Signed Bundle / APK**.
   - Vyberte "Android App Bundle" (AAB).
   - Vytvořte si "Key store" (podpisový klíč) a postupujte podle průvodce.

## 3. Vytvoření iOS Aplikace (Pouze macOS)

Pro iOS musíte mít Mac.

1. Spusťte Xcode přes příkaz:
   ```bash
   npx cap open ios
   ```

2. V Xcode:
   - Vyberte svůj tým v **Signing & Capabilities** (potřebujete Apple ID).
   - Vyberte své zařízení v horní liště (nebo simulátor).
   - Klikněte na tlačítko **Play** (Run) pro testování.

**Pro vytvoření instalačního souboru (IPA):**
   - V menu vyberte **Product** -> **Archive**.
   - Po dokončení se otevře "Organizer".
   - Klikněte na **Distribute App** -> **Ad Hoc** (pro testování) nebo **App Store Connect** (pro vydání).

## Řešení problémů

- **Chyba "JAVA_HOME"**: Ujistěte se, že máte správně nastavenou cestu k Java JDK (součást Android Studia).
- **Chyba synchronizace**: Pokud `npx cap sync` selže, zkuste smazat složku `android` nebo `ios` a znovu přidat:
  ```bash
  rm -rf android
  npx cap add android
  npx cap sync
  ```
