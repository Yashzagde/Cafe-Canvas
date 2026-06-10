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
  hero_title?: string;
  hero_subtitle?: string;
  about_title?: string;
  about_text?: string;
  about_image_url?: string;
  button_radius?: number;
  show_reviews?: boolean;
  show_instagram?: boolean;
  instagram_handle?: string;
  google_place_id?: string;
  announcement_banner?: string;
  is_maintenance?: boolean;
  theme_preset?: string;
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
