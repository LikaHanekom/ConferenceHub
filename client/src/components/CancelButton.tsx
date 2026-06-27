"use client";

import { useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { cancelBooking } from "@/lib/api";
import { PagedBookingsResponse } from "@/types";

export function CancelButton({ bookingId }: { bookingId: string }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => cancelBooking(bookingId),

    onMutate: async () => {
      // 1. Cancel in-flight refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["bookings"] });

      // 2. Snapshot current data for rollback
      const previous = queryClient.getQueryData<InfiniteData<PagedBookingsResponse>>(
        ["bookings"]
      );

      // 3. Apply optimistic update — remove booking from whichever page it's on
      queryClient.setQueryData<InfiniteData<PagedBookingsResponse>>(
        ["bookings"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((b) => b.id !== bookingId),
              totalCount: page.totalCount - 1,
            })),
          };
        }
      );

      // 4. Return snapshot so onError can roll back
      return { previous };
    },

    onError: (_err, _vars, context) => {
      // Roll back to snapshot
      if (context?.previous) {
        queryClient.setQueryData(["bookings"], context.previous);
      }
    },

    onSettled: () => {
      // Re-sync with server regardless of success or failure
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // prevent row click opening detail panel
        mutation.mutate();
      }}
      disabled={mutation.isPending}
      className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400"
    >
      {mutation.isPending ? "Cancelling…" : "Cancel"}
    </button>
  );
}