import { Suspense } from "react";
import { BookingTable, BookingTableSkeleton } from "@/components/BookingTable";
import { BookingDetailPanel } from "@/components/BookingDetailPanel";
import { auth } from "@/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getRoomCount(): Promise<number> {
  const res = await fetch(`${API_URL}/api/rooms`, { next: { tags: ["rooms"] } });
  if (!res.ok) return 0;
  const rooms = await res.json();
  return rooms.length;
}

export default async function BookingsPage() {
  const [roomCount, session] = await Promise.all([getRoomCount(), auth()]);

  return (
    <>
      <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Bookings
      </h1>

      {session && (
        <p className="mb-1 text-sm text-gray-500">
          Signed in as{" "}
          <span className="font-medium">{session.user.name}</span>
          <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs">
            {session.user.role}
          </span>
        </p>
      )}

      <div className="mb-6 flex gap-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {roomCount}
          </span>{" "}
          rooms in the system
        </p>
      </div>

      {/* Two-column layout — table left, detail panel right */}
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <Suspense fallback={<BookingTableSkeleton />}>
            <BookingTable />
          </Suspense>
        </div>
        <BookingDetailPanel />
      </div>
    </>
  );
}