import { create } from 'zustand'

export interface Branch {
  id: string;
  tenant_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  manager_id: string | null;
  active: boolean;
  created_at: string;
}

interface BranchState {
  activeBranch: Branch | null;
  branches: Branch[];
  setActiveBranch: (branch: Branch | null) => void;
  setBranches: (branches: Branch[]) => void;
}

export const useBranchStore = create<BranchState>((set) => ({
  activeBranch: null,
  branches: [],
  setActiveBranch: (branch) => set({ activeBranch: branch }),
  setBranches: (branches) => set({ branches, activeBranch: branches.length > 0 ? branches[0] : null }),
}))
