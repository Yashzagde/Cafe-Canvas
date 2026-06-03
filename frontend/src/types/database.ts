export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string | null;
          actor_id: string | null;
          actor_role: 'owner' | 'manager' | 'cashier' | 'kitchen' | 'staff' | 'system';
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_data: Record<string, unknown> | null;
          new_data: Record<string, unknown> | null;
          metadata: Record<string, unknown>;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          branch_id?: string | null;
          actor_id?: string | null;
          actor_role: 'owner' | 'manager' | 'cashier' | 'kitchen' | 'staff' | 'system';
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_data?: Record<string, unknown> | null;
          new_data?: Record<string, unknown> | null;
          metadata?: Record<string, unknown>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
        Relationships: [];
      };
      pos_shifts: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string;
          cashier_id: string;
          opened_at: string;
          closed_at: string | null;
          opening_cash_paise: number;
          closing_cash_paise: number | null;
          expected_cash_paise: number | null;
          variance_paise: number | null;
          transaction_count: number;
          total_sales_paise: number;
          status: 'open' | 'closed' | 'reconciled';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          branch_id: string;
          cashier_id: string;
          opened_at?: string;
          closed_at?: string | null;
          opening_cash_paise?: number;
          closing_cash_paise?: number | null;
          transaction_count?: number;
          total_sales_paise?: number;
          status?: 'open' | 'closed' | 'reconciled';
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['pos_shifts']['Insert']>;
        Relationships: [];
      };
      staff_attendance: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string;
          staff_id: string;
          shift_id: string | null;
          clock_in: string;
          clock_out: string | null;
          duration_minutes: number | null;
          source: 'manual' | 'pos' | 'biometric';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          branch_id: string;
          staff_id: string;
          shift_id?: string | null;
          clock_in?: string;
          clock_out?: string | null;
          source?: 'manual' | 'pos' | 'biometric';
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['staff_attendance']['Insert']>;
        Relationships: [];
      };
      staff_leaves: {
        Row: {
          id: string;
          tenant_id: string;
          staff_id: string;
          leave_type: 'sick' | 'casual' | 'earned' | 'unpaid' | 'comp_off';
          start_date: string;
          end_date: string;
          days_count: number | null;
          status: 'pending' | 'approved' | 'rejected' | 'cancelled';
          reason: string | null;
          approved_by: string | null;
          approved_at: string | null;
          rejection_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          staff_id: string;
          leave_type: 'sick' | 'casual' | 'earned' | 'unpaid' | 'comp_off';
          start_date: string;
          end_date: string;
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
          reason?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejection_note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['staff_leaves']['Insert']>;
        Relationships: [];
      };
      staff_performance_snapshots: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string;
          staff_id: string;
          period_start: string;
          period_end: string;
          orders_handled: number;
          total_sales_paise: number;
          avg_order_value_paise: number | null;
          void_count: number;
          discount_count: number;
          discount_total_paise: number;
          avg_table_turn_minutes: number | null;
          total_hours_worked: number;
          late_clock_ins: number;
          absent_days: number;
          computed_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          branch_id: string;
          staff_id: string;
          period_start: string;
          period_end: string;
          orders_handled?: number;
          total_sales_paise?: number;
          void_count?: number;
          discount_count?: number;
          discount_total_paise?: number;
          avg_table_turn_minutes?: number | null;
          total_hours_worked?: number;
          late_clock_ins?: number;
          absent_days?: number;
          computed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['staff_performance_snapshots']['Insert']>;
        Relationships: [];
      };
      modifier_groups: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          selection_type: 'required_single' | 'optional_single' | 'multi_select';
          min_selections: number;
          max_selections: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          selection_type?: 'required_single' | 'optional_single' | 'multi_select';
          min_selections?: number;
          max_selections?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['modifier_groups']['Insert']>;
        Relationships: [];
      };
      modifier_options: {
        Row: {
          id: string;
          group_id: string;
          tenant_id: string;
          name: string;
          price_delta_paise: number;
          is_default: boolean;
          is_available: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          tenant_id: string;
          name: string;
          price_delta_paise?: number;
          is_default?: boolean;
          is_available?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['modifier_options']['Insert']>;
        Relationships: [];
      };
      menu_item_modifier_groups: {
        Row: {
          item_id: string;
          modifier_group_id: string;
          sort_order: number;
          is_required: boolean;
        };
        Insert: {
          item_id: string;
          modifier_group_id: string;
          sort_order?: number;
          is_required?: boolean;
        };
        Update: Partial<Database['public']['Tables']['menu_item_modifier_groups']['Insert']>;
        Relationships: [];
      };
      inventory_items: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string;
          name: string;
          unit: 'kg' | 'g' | 'l' | 'ml' | 'unit' | 'dozen' | 'box';
          quantity: number;
          low_stock_threshold: number;
          cost_per_unit_paise: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          branch_id: string;
          name: string;
          unit?: 'kg' | 'g' | 'l' | 'ml' | 'unit' | 'dozen' | 'box';
          quantity?: number;
          low_stock_threshold?: number;
          cost_per_unit_paise?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['inventory_items']['Insert']>;
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          menu_item_id: string;
          inventory_item_id: string;
          quantity_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          inventory_item_id: string;
          quantity_used: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['recipes']['Insert']>;
        Relationships: [];
      };
      daily_sales_analytics: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string;
          date: string;
          total_revenue_paise: number;
          order_count: number;
          avg_order_paise: number | null;
          void_count: number;
          discount_total_paise: number;
          new_customers: number;
          covers: number;
          top_items: Record<string, unknown>[] | unknown[];
          payment_breakdown: Record<string, number>;
          computed_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          branch_id: string;
          date: string;
          total_revenue_paise?: number;
          order_count?: number;
          void_count?: number;
          discount_total_paise?: number;
          new_customers?: number;
          covers?: number;
          top_items?: Record<string, unknown>[] | unknown[];
          payment_breakdown?: Record<string, number>;
          computed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['daily_sales_analytics']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string | null;
          role: 'owner' | 'manager' | 'cashier' | 'kitchen' | 'staff';
          full_name: string;
          phone: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          branch_id?: string | null;
          role?: 'owner' | 'manager' | 'cashier' | 'kitchen' | 'staff';
          full_name: string;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      tenants: {
        Row: {
          id: string;
          name: string;
          subdomain: string;
          plan: 'free' | 'pro' | 'growth' | 'enterprise';
          logo_url: string | null;
          timezone: string;
          currency: string;
          address: string | null;
          phone: string | null;
          gstin: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subdomain: string;
          plan?: 'free' | 'pro' | 'growth' | 'enterprise';
          logo_url?: string | null;
          timezone?: string;
          currency?: string;
          address?: string | null;
          phone?: string | null;
          gstin?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>;
        Relationships: [];
      };
      branches: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          address: string | null;
          phone: string | null;
          manager_id: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          manager_id?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['branches']['Insert']>;
        Relationships: [];
      };
      tables: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string | null;
          name: string;
          capacity: number;
          section: string | null;
          shape: 'square' | 'round' | 'long';
          status: 'available' | 'occupied' | 'reserved' | 'cleaning';
          position_x: number;
          position_y: number;
          qr_version: number;
          qr_generated_at: string | null;
          floor_x: number;
          floor_y: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          branch_id?: string | null;
          name: string;
          capacity?: number;
          section?: string | null;
          shape?: 'square' | 'round' | 'long';
          status?: 'available' | 'occupied' | 'reserved' | 'cleaning';
          position_x?: number;
          position_y?: number;
          qr_version?: number;
          qr_generated_at?: string | null;
          floor_x?: number;
          floor_y?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tables']['Insert']>;
        Relationships: [];
      };
      storefront_config: {
        Row: {
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
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          theme_id?: string;
          primary_color?: string;
          accent_color?: string;
          font_heading?: string;
          font_body?: string;
          banner_text?: string | null;
          show_prices?: boolean;
          allow_orders?: boolean;
          show_blog?: boolean;
          hero_image_url?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['storefront_config']['Insert']>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      invalidate_table_qr: {
        Args: {
          p_table_id: string;
        };
        Returns: void;
      };
    };
  };
}
