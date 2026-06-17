"use client";

import { useState, useEffect } from "react";
import { RoomResponse } from "@/types";
import { RoomList } from "@/components/RoomList";

const STORAGE_KEY = "conferencehub:selectedRoomId";

const rooms: RoomResponse[] = [
  {
    id: "d1e2f3a4-b5c6-7890-abcd-ef1234567801",
    name: "Board Room",
    floor: "Level 1",
    capacity: 12,
    isAvailable: true,
  },
  {
    id: "d1e2f3a4-b5c6-7890-abcd-ef1234567802",
    name: "Meeting Room A",
    floor: "Ground Floor",
    capacity: 6,
    isAvailable: false,
  },
  {
    id: "d1e2f3a4-b5c6-7890-abcd-ef1234567803",
    name: "Meeting Room B",
    floor: "Ground Floor",
    capacity: 8,
    isAvailable: true,
  },
  {
    id: "d1e2f3a4-b5c6-7890-abcd-ef1234567804",
    name: "Training Room",
    floor: "Level 2",
    capacity: 20,
    isAvailable: true,
  },
];

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedRoom = rooms.find((r) => r.id === selectedId) ?? null;

  // Restore from sessionStorage on mount.
  // Empty dependency array: runs once after the first render.
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored !== null && rooms.some((r) => r.id === stored)) {
      setSelectedId(stored);
    }
  }, []);

  // Persist to sessionStorage whenever selectedId changes.
  // Dependency array with selectedId: runs after any render where selectedId changed.
  useEffect(() => {
    if (selectedId !== null) {
      sessionStorage.setItem(STORAGE_KEY, selectedId);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedId]);

  return (
    <main className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Conference Rooms
        </h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{rooms.length} rooms total</p>

        {selectedRoom !== null && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Selected: {selectedRoom.name} — {selectedRoom.floor},{" "}
              {selectedRoom.capacity} seats
            </p>
          </div>
        )}

        <RoomList
          rooms={rooms}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId((prev) => (prev === id ? null : id))}
        />
      </div>
    </main>
  );
}
