// Cafe Canva - Mock Supabase Client for Testing Mode
// Provides pre-seeded mock responses with real PostgreSQL UUIDs to allow full integration verification.

export const mockUser = {
  id: 'u0000000-0000-0000-0000-000000000001', // Valid user UUID
  email: 'admin@cafecanvas.bar',
  app_metadata: {
    tenant_id: 'a0000000-0000-0000-0000-000000000001', // Valid tenant UUID
    branch_id: 'ab000000-0000-0000-0000-000000000001', // Valid branch UUID
    role: 'owner'
  },
  user_metadata: {
    full_name: 'Canvas Admin Tester'
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
      // Return mock tables using authentic UUIDs mapped to 003_seed_demo.sql
      if (table === 'menu_categories') {
        return createMockChain([
          { id: 'd0000000-0000-0000-0000-000000000001', name: 'Specialty Coffee', is_visible: true },
          { id: 'd0000000-0000-0000-0000-000000000005', name: 'All-Day Breakfast', is_visible: true },
          { id: 'd0000000-0000-0000-0000-000000000004', name: 'Artisanal Desserts', is_visible: true }
        ]);
      }
      if (table === 'menu_items') {
        return createMockChain([
          { id: 'e0000000-0000-0000-0000-000000000001', name: 'Classic Cappuccino', price: 290, status: 'available', category_id: 'd0000000-0000-0000-0000-000000000001' },
          { id: 'e0000000-0000-0000-0000-000000000004', name: 'Signature Cold Brew', price: 350, status: 'available', category_id: 'd0000000-0000-0000-0000-000000000001' },
          { id: 'e0000000-0000-0000-0000-000000000011', name: 'Avocado Sourdough Toast', price: 390, status: 'available', category_id: 'd0000000-0000-0000-0000-000000000005' },
          { id: 'e0000000-0000-0000-0000-000000000010', name: 'Vegan Blueberry Muffin', price: 160, status: 'available', category_id: 'd0000000-0000-0000-0000-000000000004' }
        ]);
      }
      if (table === 'tables') {
        return createMockChain([
          { id: 'c0000000-0000-0000-0000-000000000001', table_number: 'Table 1', status: 'available', capacity: 2 },
          { id: 'c0000000-0000-0000-0000-000000000002', table_number: 'Table 2', status: 'occupied', capacity: 4 },
          { id: 'c0000000-0000-0000-0000-000000000003', table_number: 'Table 3', status: 'available', capacity: 4 }
        ]);
      }
      if (table === 'orders') {
        return createMockChain([
          { id: 'f0000000-0000-0000-0000-000000000001', status: 'pending', total: 60000, table_id: 'c0000000-0000-0000-0000-000000000002', created_at: new Date().toISOString() }
        ]);
      }
      // Fallback
      return createMockChain([]);
    }
  };
}
