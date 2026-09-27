import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppLanguage = 'ne' | 'en';

const LANGUAGE_KEY = 'voiceme.appLanguage';

// The ने / EN choice made on one screen (Flashcards, AI helper) is remembered
// and used by the others, instead of every screen starting over in Nepali.
export function useAppLanguage(): [AppLanguage, (next: AppLanguage) => void] {
  const [lang, setLangState] = useState<AppLanguage>('ne');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((saved) => {
        if (saved === 'ne' || saved === 'en') setLangState(saved);
      })
      .catch(() => {});
  }, []);

  const setLang = useCallback((next: AppLanguage) => {
    setLangState(next);
    AsyncStorage.setItem(LANGUAGE_KEY, next).catch(() => {});
  }, []);

  return [lang, setLang];
}
