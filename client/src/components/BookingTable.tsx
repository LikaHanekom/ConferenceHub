"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { fetchBookingsPaginated } from "@/lib/api";
import { useBookingStore } from "@/stores/bookingStore";
import { CancelButton } from "./CancelButton";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
        />
      ))}
    </div>
  );
}

export function BookingTable() {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Zustand selectors — one per value (no destructuring)
  const setSelectedBookingId = useBookingStore((s) => s.setSelectedBookingId);
  const openDetailPanel = useBookingStore((s) => s.openDetailPanel);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery({
    queryKey: ["bookings"],
    queryFn: ({ pageParam }) => fetchBookingsPaginated(pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });

  // Intersection observer — fires fetchNextPage when sentinel enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) return <BookingTableSkeleton />;
  if (isError)
    return (
      <p className="text-sm text-red-500">Failed to load bookings.</p>
    );

  const bookings = data.pages.flatMap((page) => page.items);

  if (bookings.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No bookings found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {["Title", "Room", "Start", "End", "Organiser", "Action"].map((h) => (
              <th
                key={h}
                className="py-2 pr-4 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr
              key={b.id}
              onClick={() => {
                setSelectedBookingId(b.id);
                openDetailPanel();
              }}
              className="cursor-pointer border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                {b.title}
              </td>
              <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">
                {b.roomName}
                <span className="ml-1 text-xs text-gray-400">({b.floor})</span>
              </td>
              <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">
                {formatDateTime(b.startTime)}
              </td>
              <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">
                {formatDateTime(b.endTime)}
              </td>
              <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">
                {b.organizerEmail}
              </td>
              <td className="py-2">
                <CancelButton bookingId={b.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="py-4 text-center text-sm text-gray-400">
        {isFetchingNextPage ? (
          <span className="animate-pulse">Loading more…</span>
        ) : !hasNextPage ? (
          <span>All bookings loaded</span>
        ) : null}
      </div>
    </div>
  );
}