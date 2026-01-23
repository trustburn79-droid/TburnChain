import { aiService } from "../ai-service-manager";

interface TranslationCache {
  [key: string]: {
    text: string;
    timestamp: number;
  };
}

const SUPPORTED_LANGUAGES = {
  en: "English",
  ko: "Korean",
  zh: "Chinese (Simplified)",
  ja: "Japanese",
  es: "Spanish",
  fr: "French",
  ru: "Russian",
  ar: "Arabic",
  hi: "Hindi",
  bn: "Bengali",
  pt: "Portuguese",
  ur: "Urdu"
};

class TranslationService {
  private cache: TranslationCache = {};
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 10000;
  
  private getCacheKey(text: string, targetLang: string): string {
    const textHash = Buffer.from(text.substring(0, 100)).toString('base64').substring(0, 20);
    return `${targetLang}:${textHash}:${text.length}`;
  }
  
  private cleanCache(): void {
    const now = Date.now();
    const keys = Object.keys(this.cache);
    
    if (keys.length > this.MAX_CACHE_SIZE) {
      const sortedKeys = keys.sort((a, b) => 
        this.cache[a].timestamp - this.cache[b].timestamp
      );
      const keysToDelete = sortedKeys.slice(0, keys.length - this.MAX_CACHE_SIZE + 1000);
      keysToDelete.forEach(key => delete this.cache[key]);
    }
    
    keys.forEach(key => {
      if (now - this.cache[key].timestamp > this.CACHE_TTL) {
        delete this.cache[key];
      }
    });
  }
  
  async translate(text: string, targetLang: string, sourceLang: string = "en"): Promise<string> {
    if (!text || text.trim().length === 0) {
      return text;
    }
    
    if (targetLang === sourceLang) {
      return text;
    }
    
    if (!SUPPORTED_LANGUAGES[targetLang as keyof typeof SUPPORTED_LANGUAGES]) {
      return text;
    }
    
    const cacheKey = this.getCacheKey(text, targetLang);
    const cached = this.cache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.text;
    }
    
    try {
      const targetLangName = SUPPORTED_LANGUAGES[targetLang as keyof typeof SUPPORTED_LANGUAGES];
      const sourceLangName = SUPPORTED_LANGUAGES[sourceLang as keyof typeof SUPPORTED_LANGUAGES] || "English";
      
      const prompt = `Translate the following ${sourceLangName} text to ${targetLangName}. 
Only output the translated text, nothing else. Do not add any explanations or notes.
Preserve any HTML tags, markdown formatting, numbers, and special characters.

Text to translate:
${text}`;

      const response = await aiService.makeRequest({
        prompt,
        maxTokens: Math.min(text.length * 3, 4000),
        temperature: 0.3,
        systemPrompt: `You are a professional translator. Translate accurately while preserving the original meaning, tone, and formatting. Do not add any commentary or notes.`
      });
      
      const translatedText = response.text.trim();
      
      this.cache[cacheKey] = {
        text: translatedText,
        timestamp: Date.now()
      };
      
      this.cleanCache();
      
      return translatedText;
    } catch (error) {
      console.error("[TranslationService] Translation failed:", error);
      return text;
    }
  }
  
  async translateBatch(items: { text: string; field: string }[], targetLang: string, sourceLang: string = "en"): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    const translations = await Promise.all(
      items.map(async (item) => {
        const translated = await this.translate(item.text, targetLang, sourceLang);
        return { field: item.field, text: translated };
      })
    );
    
    translations.forEach(({ field, text }) => {
      results[field] = text;
    });
    
    return results;
  }
  
  getSupportedLanguages(): typeof SUPPORTED_LANGUAGES {
    return SUPPORTED_LANGUAGES;
  }
  
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: Object.keys(this.cache).length,
      maxSize: this.MAX_CACHE_SIZE
    };
  }
}

export const translationService = new TranslationService();
