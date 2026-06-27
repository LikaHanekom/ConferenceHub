"use client";

import { useQueryStates, parseAsString, parseAsInteger, parseAsBoolean } from "nuqs";
import { useEffect, useState } from "react";
import React from "react";

const filterParsers = {
  floor: parseAsString.withDefault(""),
  capacity: parseAsInteger.withDefault(0),
  available: parseAsBoolean.withDefault(false),
};

export default function RoomFilters() {
  const [filters, setFilters] = useQueryStates(filterParsers, {
    shallow: false,
  });

  // Debounced local state for floor (text input)
  const [floorInput, setFloorInput] = useState(filters.floor);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ floor: floorInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [floorInput]);

  return (
    <div className="mb-6 flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {/* Floor */}
      <div className="flex flex-1 flex-col gap-1 min-w-[160px]">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Floor
        </label>
        <input
          type="text"
          value={floorInput}
          onChange={(e) => setFloorInput(e.target.value)}
          placeholder="e.g. Floor 1"
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      {/* Minimum Capacity */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Min Capacity
        </label>
        <input
          type="number"
          min={0}
          value={filters.capacity === 0 ? "" : filters.capacity}
          onChange={(e) =>
            setFilters({ capacity: e.target.value ? parseInt(e.target.value) : 0 })
          }
          placeholder="e.g. 8"
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      {/* Available Only */}
      <div className="flex flex-col justify-end gap-1">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={filters.available}
            onChange={(e) => setFilters({ available: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          Available only
        </label>
      </div>

      {/* Clear */}
      {(filters.floor || filters.capacity > 0 || filters.available) && (
        <div className="flex flex-col justify-end">
          <button
            onClick={() => {
              setFloorInput("");
              setFilters({ floor: "", capacity: 0, available: false });
            }}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}