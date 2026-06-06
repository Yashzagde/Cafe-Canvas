import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'
import { useUIStore } from './ui.store'

export interface Notification {
  id: string
  tenant_id: string
  type: string
  title: string
  body: string
  read: boolean
  sent_at: string
}

interface NotificationsState {
  notifications: Notification[]
  isLoading: boolean
  fetchNotifications: (tenantId: string) => Promise<void>
  subscribeToNotifications: (tenantId: string) => () => void
  markRead: (id: string) => Promise<void>
  markAllRead: (tenantId: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  isLoading: false,

  fetchNotifications: async (tenantId) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('notification_log')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sent_at', { ascending: false })
        .limit(100)

      if (error) throw error

      set({ notifications: data || [] })
      
      // Update badge count in UI store
      const unreadCount = (data || []).filter(n => !n.read).length
      useUIStore.getState().setBadgeCounts({ unreadNotificationsCount: unreadCount })
    } catch (err: unknown) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  subscribeToNotifications: (tenantId) => {
    const channel = supabase
      .channel(`notifications:${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_log',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const { notifications } = get()
          const newNotif = payload.new as Notification
          
          set({ notifications: [newNotif, ...notifications] })

          // Trigger global toast notification popup
          toast.info(newNotif.title, newNotif.body)

          // Update badge count
          const unreadCount = [newNotif, ...notifications].filter(n => !n.read).length
          useUIStore.getState().setBadgeCounts({ unreadNotificationsCount: unreadCount })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  markRead: async (id) => {
    try {
      const { error } = await supabase
        .from('notification_log')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error

      const updated = get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )

      set({ notifications: updated })

      // Update badge count
      const unreadCount = updated.filter(n => !n.read).length
      useUIStore.getState().setBadgeCounts({ unreadNotificationsCount: unreadCount })
    } catch (err: unknown) {
      console.error('Failed to mark notification as read:', err)
    }
  },

  markAllRead: async (tenantId) => {
    try {
      const { error } = await supabase
        .from('notification_log')
        .update({ read: true })
        .eq('tenant_id', tenantId)
        .eq('read', false)

      if (error) throw error

      const updated = get().notifications.map((n) => ({ ...n, read: true }))
      set({ notifications: updated })
      useUIStore.getState().setBadgeCounts({ unreadNotificationsCount: 0 })
    } catch (err: unknown) {
      console.error('Failed to mark all notifications as read:', err)
    }
  },

  deleteNotification: async (id) => {
    try {
      const { error } = await supabase
        .from('notification_log')
        .delete()
        .eq('id', id)

      if (error) throw error

      const updated = get().notifications.filter((n) => n.id !== id)
      set({ notifications: updated })

      // Update badge count
      const unreadCount = updated.filter(n => !n.read).length
      useUIStore.getState().setBadgeCounts({ unreadNotificationsCount: unreadCount })
      toast.success('Notification deleted')
    } catch (err: unknown) {
      console.error('Failed to delete notification:', err)
    }
  },
}))
