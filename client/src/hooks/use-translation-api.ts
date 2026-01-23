import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";

interface TranslationItem {
  id: string;
  text: string;
}

interface TranslationResponse {
  translations: Record<string, string>;
  sourceLang: string;
  targetLang: string;
}

function hashItems(items: TranslationItem[]): string {
  const combined = items.map(i => `${i.id}:${i.text.length}`).join("|");
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash = hash & hash;
  }
  return hash.toString(36);
}

export function useTranslationApi(
  items: TranslationItem[],
  options?: { enabled?: boolean }
) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const needsTranslation = currentLang !== "en" && currentLang !== "ko";
  const itemsHash = hashItems(items);

  const { data, isLoading, error } = useQuery<TranslationResponse>({
    queryKey: ["/api/community/translate-batch", currentLang, itemsHash],
    queryFn: async () => {
      if (!needsTranslation || items.length === 0) {
        return { translations: {}, sourceLang: "en", targetLang: currentLang };
      }
      
      const response = await apiRequest("POST", "/api/community/translate-batch", {
        items: items.map(item => ({ id: item.id, text: item.text })),
        targetLang: currentLang,
        sourceLang: "en"
      });
      
      return response.json();
    },
    enabled: needsTranslation && items.length > 0 && (options?.enabled !== false),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  const getTranslation = (id: string, originalText: string, koText?: string): string => {
    if (currentLang === "en") {
      return originalText;
    }
    if (currentLang === "ko" && koText) {
      return koText;
    }
    if (data?.translations && data.translations[id]) {
      return data.translations[id];
    }
    return originalText;
  };

  return {
    getTranslation,
    isTranslating: isLoading && needsTranslation,
    translationError: error,
    currentLang
  };
}
