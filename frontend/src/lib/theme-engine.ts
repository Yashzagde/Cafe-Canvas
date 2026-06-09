// Cafe Canava Theme Engine - loads CSS custom properties per tenant

export async function loadTenantTheme(themeId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // Sourced from public themes path or fallback default
  const cssUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/storage/v1/object/public/themes/${themeId}.css`;
  
  const existing = document.getElementById('tenant-theme');
  if (existing) {
    existing.remove();
  }
  
  const link = document.createElement('link');
  link.id = 'tenant-theme';
  link.rel = 'stylesheet';
  link.href = cssUrl;
  
  document.head.appendChild(link);
}
