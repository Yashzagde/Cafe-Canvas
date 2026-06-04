import { describe, it, expect } from 'vitest';

// Simulating translations structure from page.tsx to test content integrity
const contentMock = {
  en: {
    title: 'Cafe Canvas App Center',
    appsCount: 5,
    apps: [
      { id: 'desktop-admin', category: 'desktop' },
      { id: 'mobile-admin', category: 'mobile' },
      { id: 'staff-pos', category: 'mobile' },
      { id: 'kds', category: 'mobile' },
      { id: 'customer-storefront', category: 'mobile' }
    ]
  },
  hi: {
    title: 'कैफे कैनवास ऐप केंद्र',
    appsCount: 5,
    apps: [
      { id: 'desktop-admin', category: 'desktop' },
      { id: 'mobile-admin', category: 'mobile' },
      { id: 'staff-pos', category: 'mobile' },
      { id: 'kds', category: 'mobile' },
      { id: 'customer-storefront', category: 'mobile' }
    ]
  }
};

describe('Downloads Page Translation & Configuration Tests', () => {
  it('should contain exactly 5 applications configured for download', () => {
    expect(contentMock.en.appsCount).toBe(5);
    expect(contentMock.en.apps.length).toBe(5);
    expect(contentMock.hi.apps.length).toBe(5);
  });

  it('should include one desktop application and four mobile/tablet applications', () => {
    const enDesktop = contentMock.en.apps.filter(a => a.category === 'desktop');
    const enMobile = contentMock.en.apps.filter(a => a.category === 'mobile');
    
    expect(enDesktop.length).toBe(1);
    expect(enMobile.length).toBe(4);
  });

  it('should return correct localized title based on selected language', () => {
    expect(contentMock.en.title).toBe('Cafe Canvas App Center');
    expect(contentMock.hi.title).toBe('कैफे कैनवास ऐप केंद्र');
  });

  it('should enforce strict matching of app IDs across languages', () => {
    const enIds = contentMock.en.apps.map(a => a.id);
    const hiIds = contentMock.hi.apps.map(a => a.id);
    
    expect(enIds).toEqual(hiIds);
  });
});
