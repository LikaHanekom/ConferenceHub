import { create } from "zustand";

interface BookingStore {
  selectedBookingId: string | null;
  setSelectedBookingId: (id: string | null) => void;
  isDetailPanelOpen: boolean;
  openDetailPanel: () => void;
  closeDetailPanel: () => void;
}

export const useBookingStore = create<BookingStore>()((set) => ({
  selectedBookingId: null,
  setSelectedBookingId: (id) => set({ selectedBookingId: id }),
  isDetailPanelOpen: false,
  openDetailPanel: () => set({ isDetailPanelOpen: true }),
  closeDetailPanel: () => set({ isDetailPanelOpen: false, selectedBookingId: null }),
}));