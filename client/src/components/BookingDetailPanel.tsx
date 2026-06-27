"use client";

import { useQuery } from "@tanstack/react-query";
import { useBookingStore } from "@/stores/bookingStore";
import { fetchBookingById } from "@/lib/api";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function BookingDetailPanel() {
  const selectedBookingId = useBookingStore((s) => s.selectedBookingId);
  const isDetailPanelOpen = useBookingStore((s) => s.isDetailPanelOpen);
  const closeDetailPanel = useBookingStore((s) => s.closeDetailPanel);

  const { data: booking, isPending } = useQuery({
    queryKey: ["booking", selectedBookingId],
    queryFn: () => fetchBookingById(selectedBookingId!),
    enabled: !!selectedBookingId,
  });

  if (!isDetailPanelOpen) return null;

  return (
    <div className="w-80 shrink-0 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          Booking Detail
        </h2>
        <button
          onClick={closeDetailPanel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {!selectedBookingId ? (
        <p className="text-sm text-gray-500">Select a booking to view details.</p>
      ) : isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : booking ? (
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium text-gray-500">Title</dt>
            <dd className="text-gray-900 dark:text-gray-100">{booking.title}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Room</dt>
            <dd className="text-gray-900 dark:text-gray-100">
              {booking.roomName} <span className="text-gray-400">({booking.floor})</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Start</dt>
            <dd className="text-gray-900 dark:text-gray-100">{formatDateTime(booking.startTime)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">End</dt>
            <dd className="text-gray-900 dark:text-gray-100">{formatDateTime(booking.endTime)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Organiser</dt>
            <dd className="text-gray-900 dark:text-gray-100">{booking.organizerEmail}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Attendees</dt>
            <dd className="text-gray-900 dark:text-gray-100">{booking.attendeeCount}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Type</dt>
            <dd className="text-gray-900 dark:text-gray-100">{booking.type}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}