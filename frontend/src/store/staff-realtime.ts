import { create } from 'zustand'

interface StaffPresenceState {
  onlineUserIds: Set<string>;
  setOnline: (userId: string) => void;
  setOffline: (userId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
}

export const useStaffPresenceStore = create<StaffPresenceState>((set) => ({
  onlineUserIds: new Set<string>(),
  setOnline: (userId) => set((state) => {
    const updated = new Set(state.onlineUserIds)
    updated.add(userId)
    return { onlineUserIds: updated }
  }),
  setOffline: (userId) => set((state) => {
    const updated = new Set(state.onlineUserIds)
    updated.delete(userId)
    return { onlineUserIds: updated }
  }),
  setOnlineUsers: (userIds) => set(() => ({
    onlineUserIds: new Set(userIds)
  }))
}))
