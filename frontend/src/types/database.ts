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
      bills: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string | null;
          table_id: string | null;
          order_id: string | null;
          order_ids: string[] | null;
          subtotal: number | null;
          tax: number | null;
          discount_amount: number | null;
          extra_charges: Record<string, unknown>[] | unknown[] | null;
          total: number | null;
          status: 'open' | 'paid' | 'voided' | null;
          payment_method: string | null;
          paid_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          table_session_id: string | null;
          customer_session_id: string | null;
          offer_code_id: string | null;
          subtotal_paise: number;
          discount_paise: number;
          cgst_paise: number;
          sgst_paise: number;
          tip_paise: number;
          round_off_paise: number;
          total_paise: number;
          total_amount_paise: number;
          service_charge_paise: number;
          is_void: boolean;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          branch_id?: string | null;
          table_id?: string | null;
          order_id?: string | null;
          order_ids?: string[] | null;
          subtotal?: number | null;
          tax?: number | null;
          discount_amount?: number | null;
          extra_charges?: Record<string, unknown>[] | unknown[] | null;
          total?: number | null;
          status?: 'open' | 'paid' | 'voided' | null;
          payment_method?: string | null;
          paid_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          table_session_id?: string | null;
          customer_session_id?: string | null;
          offer_code_id?: string | null;
          subtotal_paise?: number;
          discount_paise?: number;
          cgst_paise?: number;
          sgst_paise?: number;
          tip_paise?: number;
          round_off_paise?: number;
          total_paise?: number;
          total_amount_paise?: number;
          service_charge_paise?: number;
          is_void?: boolean;
        };
        Update: Partial<Database['public']['Tables']['bills']['Insert']>;
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
      menu_categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          name_hi: string | null;
          description: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          name_hi?: string | null;
          description?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['menu_categories']['Insert']>;
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          tenant_id: string;
          category_id: string | null;
          name: string;
          name_hi: string | null;
          description: string | null;
          price: number;
          compare_price: number | null;
          image_url: string | null;
          is_available: boolean;
          is_featured: boolean;
          dietary_tags: string[];
          prep_time_mins: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          category_id?: string | null;
          name: string;
          name_hi?: string | null;
          description?: string | null;
          price: number;
          compare_price?: number | null;
          image_url?: string | null;
          is_available?: boolean;
          is_featured?: boolean;
          dietary_tags?: string[];
          prep_time_mins?: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>;
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
      users: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string | null;
          role: 'owner' | 'manager' | 'cashier' | 'kitchen' | 'staff';
          name: string;
          email: string;
          phone: string | null;
          pin_hash: string | null;
          avatar_url: string | null;
          active: boolean;
          fcm_token: string | null;
          permissions: any;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          branch_id?: string | null;
          role?: 'owner' | 'manager' | 'cashier' | 'kitchen' | 'staff';
          name: string;
          email: string;
          phone?: string | null;
          pin_hash?: string | null;
          avatar_url?: string | null;
          active?: boolean;
          fcm_token?: string | null;
          permissions?: any;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
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
          hero_image_url_2: string | null;
          hero_image_url_3: string | null;
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
          hero_image_url_2?: string | null;
          hero_image_url_3?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['storefront_config']['Insert']>;
        Relationships: [];
      };
      staff_attendance: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string;
          staff_id: string;
          clock_in: string;
          clock_out: string | null;
          clock_in_lat: number | null;
          clock_in_lng: number | null;
          clock_out_lat: number | null;
          clock_out_lng: number | null;
          clock_in_selfie_url: string | null;
          clock_out_selfie_url: string | null;
          clock_in_address: string | null;
          device_id: string | null;
          status: 'clocked_in' | 'clocked_out' | 'auto_closed';
          total_minutes: number | null;
          created_at: string;
          shift_id: string | null;
          duration_minutes: number | null;
          source: 'manual' | 'pos' | 'biometric';
          notes: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          branch_id: string;
          staff_id: string;
          clock_in?: string;
          clock_out?: string | null;
          clock_in_lat?: number | null;
          clock_in_lng?: number | null;
          clock_out_lat?: number | null;
          clock_out_lng?: number | null;
          clock_in_selfie_url?: string | null;
          clock_out_selfie_url?: string | null;
          clock_in_address?: string | null;
          device_id?: string | null;
          status?: 'clocked_in' | 'clocked_out' | 'auto_closed';
          total_minutes?: number | null;
          created_at?: string;
          shift_id?: string | null;
          duration_minutes?: number | null;
          source?: 'manual' | 'pos' | 'biometric';
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['staff_attendance']['Insert']>;
        Relationships: [];
      };
      staff_devices: {
        Row: {
          id: string;
          staff_id: string;
          tenant_id: string;
          device_id: string;
          device_name: string | null;
          platform: 'android' | 'ios' | 'web' | null;
          fcm_token: string | null;
          app_version: string | null;
          is_active: boolean;
          last_seen_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          tenant_id: string;
          device_id: string;
          device_name?: string | null;
          platform?: 'android' | 'ios' | 'web' | null;
          fcm_token?: string | null;
          app_version?: string | null;
          is_active?: boolean;
          last_seen_at?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['staff_devices']['Insert']>;
        Relationships: [];
      };
      table_sessions: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string;
          table_id: string;
          opened_by: string;
          closed_by: string | null;
          customer_count: number;
          status: 'active' | 'billing' | 'closed' | 'voided';
          session_start: string;
          session_end: string | null;
          notes: string | null;
          created_at: string;
          check_in_at: string | null;
          check_out_at: string | null;
          total_revenue: number | null;
          bill_id: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          branch_id: string;
          table_id: string;
          opened_by: string;
          closed_by?: string | null;
          customer_count?: number;
          status?: 'active' | 'billing' | 'closed' | 'voided';
          session_start?: string;
          session_end?: string | null;
          notes?: string | null;
          created_at?: string;
          check_in_at?: string | null;
          check_out_at?: string | null;
          total_revenue?: number | null;
          bill_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['table_sessions']['Insert']>;
        Relationships: [];
      };
      customer_sessions: {
        Row: {
          id: string;
          tenant_id: string;
          table_session_id: string;
          name: string | null;
          phone: string | null;
          is_loyalty_member: boolean;
          total_spent_paise: number;
          visit_count: number;
          preferences: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          table_session_id: string;
          name?: string | null;
          phone?: string | null;
          is_loyalty_member?: boolean;
          total_spent_paise?: number;
          visit_count?: number;
          preferences?: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customer_sessions']['Insert']>;
        Relationships: [];
      };
      offer_codes: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string | null;
          code: string;
          description: string | null;
          discount_type: 'percentage' | 'flat';
          discount_value: number;
          min_order_paise: number;
          max_discount_paise: number | null;
          applicable_to: 'all' | 'table' | 'customer' | 'category' | 'item';
          target_ids: string[];
          valid_from: string;
          valid_until: string | null;
          usage_limit: number | null;
          used_count: number;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          branch_id?: string | null;
          code: string;
          description?: string | null;
          discount_type: 'percentage' | 'flat';
          discount_value: number;
          min_order_paise?: number;
          max_discount_paise?: number | null;
          applicable_to?: 'all' | 'table' | 'customer' | 'category' | 'item';
          target_ids?: string[];
          valid_from?: string;
          valid_until?: string | null;
          usage_limit?: number | null;
          used_count?: number;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['offer_codes']['Insert']>;
        Relationships: [];
      };
      staff_activity_feed: {
        Row: {
          id: string;
          tenant_id: string;
          branch_id: string | null;
          staff_id: string | null;
          activity_type: string;
          entity_type: string | null;
          entity_id: string | null;
          display_text: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          branch_id?: string | null;
          staff_id?: string | null;
          activity_type: string;
          entity_type?: string | null;
          entity_id?: string | null;
          display_text?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['staff_activity_feed']['Insert']>;
        Relationships: [];
      };
      storefront_publish_history: {
        Row: {
          id: string;
          tenant_id: string;
          settings_snapshot: Record<string, unknown>;
          version: number;
          published_by: string | null;
          published_at: string;
          note: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          settings_snapshot: Record<string, unknown>;
          version: number;
          published_by?: string | null;
          published_at?: string;
          note?: string | null;
        };
        Update: Partial<Database['public']['Tables']['storefront_publish_history']['Insert']>;
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
      clock_in_staff: {
        Args: {
          p_staff_id: string;
          p_branch_id: string;
          p_lat?: number | null;
          p_lng?: number | null;
          p_selfie_url?: string | null;
          p_address?: string | null;
          p_device_id?: string | null;
        };
        Returns: Database['public']['Tables']['staff_attendance']['Row'];
      };
      clock_out_staff: {
        Args: {
          p_staff_id: string;
          p_lat?: number | null;
          p_lng?: number | null;
          p_selfie_url?: string | null;
        };
        Returns: Database['public']['Tables']['staff_attendance']['Row'];
      };
      lookup_customer_by_phone: {
        Args: {
          p_tenant_id: string;
          p_phone: string;
        };
        Returns: Record<string, unknown>;
      };
      validate_offer_code: {
        Args: {
          p_tenant_id: string;
          p_code: string;
          p_subtotal: number;
        };
        Returns: Record<string, unknown>;
      };
      generate_table_bill: {
        Args: {
          p_order_id: string;
          p_payment_method: string;
          p_offer_code_id?: string | null;
          p_discount_paise?: number;
          p_tip_paise?: number;
          p_table_session_id?: string | null;
          p_customer_session_id?: string | null;
        };
        Returns: Database['public']['Tables']['bills']['Row'];
      };
      publish_storefront: {
        Args: {
          p_tenant_id: string;
          p_publisher_id: string;
          p_note?: string | null;
        };
        Returns: Record<string, unknown>;
      };
      rollback_storefront: {
        Args: {
          p_tenant_id: string;
          p_version: number;
          p_publisher_id: string;
        };
        Returns: Record<string, unknown>;
      };
    };
  };
}

