import { create } from 'zustand'

export interface StorefrontConfig {
  id: string;
  tenant_id: string;
  theme_id: string;
  primary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  banner_text: string | null;
  show_prices: boolean;
  allow_orders: boolean;
  show_blog: boolean;
  hero_image_url: string | null;
  hero_image_url_2: string | null;
  hero_image_url_3: string | null;
  logo_url?: string | null;
  footer_description?: string | null;
  footer_hours?: string | null;
  footer_address?: string | null;
  footer_phone?: string | null;
  footer_email?: string | null;
  updated_at: string;

  // Visual layout config fields
  hero_title?: string | null;
  hero_subtitle?: string | null;
  hero_title_2?: string | null;
  hero_subtitle_2?: string | null;
  hero_title_3?: string | null;
  hero_subtitle_3?: string | null;
  about_title?: string | null;
  about_text?: string | null;
  about_image_url?: string | null;
  button_radius?: number;
  show_reviews?: boolean;
  show_instagram?: boolean;
  show_story?: boolean;
  instagram_handle?: string | null;
  google_place_id?: string | null;
  announcement_banner?: string | null;
  is_maintenance?: boolean;
  theme_preset?: string | null;
}

interface StorefrontEditorState {
  config: StorefrontConfig | null;
  isDirty: boolean;
  previewMode: 'desktop' | 'mobile';
  setConfig: (config: StorefrontConfig) => void;
  updateField: (key: keyof StorefrontConfig, value: unknown) => void;
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  markDirty: () => void;
  clearDirty: () => void;
}

export const useStorefrontEditorStore = create<StorefrontEditorState>((set) => ({
  config: null,
  isDirty: false,
  previewMode: 'desktop',
  setConfig: (config) => set({ config, isDirty: false }),
  updateField: (key, value) => set((state) => {
    if (!state.config) return {};
    return {
      config: { ...state.config, [key]: value },
      isDirty: true
    }
  }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  markDirty: () => set({ isDirty: true }),
  clearDirty: () => set({ isDirty: false })
}))
