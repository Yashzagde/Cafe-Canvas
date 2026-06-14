import { create } from 'zustand';
import { getSupabaseUrl } from '@/utils/supabase/env';

export interface ThemeConfig {
  themeId: string;
  primaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  bannerText: string;
  allowOrders: boolean;
}

interface ThemeState {
  config: ThemeConfig;
  setThemeConfig: (config: Partial<ThemeConfig>) => void;
  loadThemeFromCSS: (themeId: string) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  config: {
    themeId: 'theme-01',
    primaryColor: '#6366f1',
    accentColor: '#10b981',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    bannerText: '',
    allowOrders: true,
  },
  setThemeConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),
  loadThemeFromCSS: async (themeId) => {
    if (typeof window === 'undefined') return;
    const linkId = 'tenant-theme';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const cssUrl = `${getSupabaseUrl()}/storage/v1/object/public/themes/${themeId}.css`;
    link.href = cssUrl;
    set((state) => ({ config: { ...state.config, themeId } }));
  },
}));
