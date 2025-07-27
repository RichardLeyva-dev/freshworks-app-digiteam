/*  I18n.ts
 *  Minimal JSON‑based translation loader for Zendesk apps  */

type TranslationDict = Record<string, string>;
type Context          = Record<string, string | number>;

export default class I18n {
  private translations: TranslationDict = {};

  /* ──────────────────────────────
   *  Fallback chain: "pt-BR" → ["pt-BR", "pt", "en"]
   * ────────────────────────────── */
  private static getRetries(locale: string): string[] {
    return [locale, locale.replace(/-.+$/, ''), 'en'];
  }

  /* Dynamically import `/translations/{locale}.json` */
  private async tryRequire(locale: string): Promise<TranslationDict | null> {
    try {
      const mod = await import(`../translations/${locale}.json`);
      /* json-loader gives `default` export */
      return mod.default as TranslationDict;
    } catch {
      return null;
    }
  }

  /* Public API ─ load translations for a locale (with fallback) */
  async loadTranslations(locale: string): Promise<void> {
    const fallbackQueue = I18n.getRetries(locale);

    while (fallbackQueue.length) {
      const candidate = fallbackQueue.shift() as string;
      const imported  = await this.tryRequire(candidate);
      if (imported) {
        this.translations = imported;
        break;
      }
    }
  }

  /* Translate + interpolate */
  t(key: string, context: Context = {}): string {
    if (typeof key !== 'string') {
      throw new Error(`Translation key must be a string, got: ${typeof key}`);
    }

    const template = this.translations[key];
    if (!template)               throw new Error(`Missing translation: ${key}`);
    if (typeof template !== 'string') throw new Error(`Invalid translation for key: ${key}`);

    return template.replace(/{{(.*?)}}/g, (_, m: string) =>
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      context[m] ? String(context[m]) : ''
    );
  }
}

/*  ⚠  tsconfig.json must include:
    {
      "compilerOptions": {
        …
        "resolveJsonModule": true,
        "esModuleInterop": true
      }
    }
*/
