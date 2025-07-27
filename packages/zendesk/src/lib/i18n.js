/*  I18n.ts
 *  Minimal JSON‑based translation loader for Zendesk apps  */
export default class I18n {
    constructor() {
        this.translations = {};
    }
    /* ──────────────────────────────
     *  Fallback chain: "pt-BR" → ["pt-BR", "pt", "en"]
     * ────────────────────────────── */
    static getRetries(locale) {
        return [locale, locale.replace(/-.+$/, ''), 'en'];
    }
    /* Dynamically import `/translations/{locale}.json` */
    async tryRequire(locale) {
        try {
            const mod = await import(`../translations/${locale}.json`);
            /* json-loader gives `default` export */
            return mod.default;
        }
        catch {
            return null;
        }
    }
    /* Public API ─ load translations for a locale (with fallback) */
    async loadTranslations(locale) {
        const fallbackQueue = I18n.getRetries(locale);
        while (fallbackQueue.length) {
            const candidate = fallbackQueue.shift();
            const imported = await this.tryRequire(candidate);
            if (imported) {
                this.translations = imported;
                break;
            }
        }
    }
    /* Translate + interpolate */
    t(key, context = {}) {
        if (typeof key !== 'string') {
            throw new Error(`Translation key must be a string, got: ${typeof key}`);
        }
        const template = this.translations[key];
        if (!template)
            throw new Error(`Missing translation: ${key}`);
        if (typeof template !== 'string')
            throw new Error(`Invalid translation for key: ${key}`);
        return template.replace(/{{(.*?)}}/g, (_, m) => 
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        context[m] ? String(context[m]) : '');
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
