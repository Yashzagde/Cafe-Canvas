// Cafe Canva - Mock Supabase Client for Demo Mode
// Provides pre-seeded mock responses for UI routes to function fully without Supabase backend connection.

export const mockUser = {
  id: 'demo-user-1234-5678',
  email: 'demo@cafecanvas.bar',
  app_metadata: {
    tenant_id: 'demo-tenant-5555',
    branch_id: 'demo-branch-7777',
    role: 'owner'
  },
  user_metadata: {
    full_name: 'Demo Admin'
  }
};

const createMockChain = (data: any) => {
  const chain = {
    select: () => chain,
    eq: () => chain,
    in: () => chain,
    order: () => chain,
    limit: () => chain,
    single: async () => ({ data: data[0] || data, error: null }),
    maybeSingle: async () => ({ data: data[0] || data, error: null }),
    update: () => createMockChain(data),
    insert: () => createMockChain(data),
    then: (resolve: any) => resolve({ data, error: null })
  };
  return chain;
};

export function createClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: mockUser }, error: null }),
      getSession: async () => ({ data: { session: { user: mockUser } }, error: null }),
      signInWithPassword: async () => ({ data: { user: mockUser, session: {} }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback: any) => {
        callback('SIGNED_IN', { user: mockUser });
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: (table: string) => {
      // Return beautiful mock tables
      if (table === 'menu_categories') {
        return createMockChain([
          { id: '1', name: 'Specialty Coffee', is_visible: true },
          { id: '2', name: 'All-Day Breakfast', is_visible: true },
          { id: '3', name: 'Artisanal Desserts', is_visible: true }
        ]);
      }
      if (table === 'menu_items') {
        return createMockChain([
          { id: '101', name: 'Pour Over V60', price: 280, status: 'available', category_id: '1' },
          { id: '102', name: 'Cold Brew Classic', price: 240, status: 'available', category_id: '1' },
          { id: '103', name: 'Avocado Sourdough Toast', price: 380, status: 'available', category_id: '2' },
          { id: '104', name: 'New York Cheesecake', price: 320, status: 'available', category_id: '3' }
        ]);
      }
      if (table === 'tables') {
        return createMockChain([
          { id: 't1', table_number: 'Table 1', status: 'available', capacity: 2 },
          { id: 't2', table_number: 'Table 2', status: 'occupied', capacity: 4 },
          { id: 't3', table_number: 'Table 3', status: 'available', capacity: 4 }
        ]);
      }
      if (table === 'orders') {
        return createMockChain([
          { id: 'o1', status: 'pending', total: 600, table_id: 't2', created_at: new Date().toISOString() }
        ]);
      }
      // Fallback
      return createMockChain([]);
    }
  };
}
