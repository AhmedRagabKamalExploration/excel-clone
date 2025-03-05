import React, { useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SpreadsheetCell } from "./SpreadsheetCell";
import { useSpreadsheetStore } from "@/lib/store";

const NUM_ROWS = 10000;
const NUM_COLS = 10000;
const DEFAULT_CELL_WIDTH = 100;
const DEFAULT_CELL_HEIGHT = 32;
const HEADER_SIZE = 32;

export const SpreadsheetGrid: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { selection } = useSpreadsheetStore();

  // Get viewport dimensions
  const [viewportSize, setViewportSize] = useState({
    width: 1000,
    height: 600,
  });

  // Update viewport size on resize
  React.useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setViewportSize({ width, height });
    }

    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setViewportSize({ width, height });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add this useEffect to restore scroll position

  // Create row virtualizer
  const rowVirtualizer = useVirtualizer({
    count: NUM_ROWS,
    getScrollElement: () => containerRef.current,
    estimateSize: () => DEFAULT_CELL_HEIGHT,
    overscan: 5,
  });

  // Create column virtualizer
  const columnVirtualizer = useVirtualizer({
    count: NUM_COLS,
    getScrollElement: () => containerRef.current,
    estimateSize: () => DEFAULT_CELL_WIDTH,
    horizontal: true,
    overscan: 5,
  });

  // Calculate total size
  const totalHeight = rowVirtualizer.getTotalSize();
  const totalWidth = columnVirtualizer.getTotalSize();

  // Get visible items
  const visibleRows = rowVirtualizer.getVirtualItems();
  const visibleColumns = columnVirtualizer.getVirtualItems();

  return (
    <div className="flex flex-col h-full">
      {/* Column Headers */}
      <div className="flex">
        <div className="w-12 h-8 bg-gray-200 border-r border-b border-gray-300" />
        <div
          className="overflow-hidden"
          style={{ width: viewportSize.width - 48, height: HEADER_SIZE }}
        >
          <div
            style={{
              width: totalWidth,
              height: HEADER_SIZE,
              position: "relative",
              transform: `translateX(-${
                columnVirtualizer.scrollElement?.scrollLeft || 0
              }px)`,
            }}
          >
            {visibleColumns.map((virtualColumn) => (
              <div
                key={virtualColumn.index}
                className="absolute top-0 flex items-center justify-center bg-gray-200 border-r border-b border-gray-300"
                style={{
                  left: virtualColumn.start,
                  width: virtualColumn.size,
                  height: HEADER_SIZE,
                }}
              >
                {String.fromCharCode(65 + virtualColumn.index)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Row Headers */}
        <div
          className="overflow-hidden"
          style={{ width: 48, height: viewportSize.height - HEADER_SIZE }}
        >
          <div
            style={{
              height: totalHeight,
              width: 48,
              position: "relative",
              transform: `translateY(-${
                rowVirtualizer.scrollElement?.scrollTop || 0
              }px)`,
            }}
          >
            {visibleRows.map((virtualRow) => (
              <div
                key={virtualRow.index}
                className="absolute left-0 flex items-center justify-center bg-gray-200 border-r border-b border-gray-300"
                style={{
                  top: virtualRow.start,
                  height: virtualRow.size,
                  width: 48,
                }}
              >
                {virtualRow.index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div
          ref={containerRef}
          className="overflow-auto flex-1"
          style={{
            width: viewportSize.width - 48,
            height: viewportSize.height - HEADER_SIZE,
          }}
        >
          <div
            style={{
              height: totalHeight,
              width: totalWidth,
              position: "relative",
            }}
          >
            {visibleRows.map((virtualRow) =>
              visibleColumns.map((virtualColumn) => (
                <div
                  key={`${virtualRow.index},${virtualColumn.index}`}
                  className="absolute"
                  style={{
                    top: virtualRow.start,
                    left: virtualColumn.start,
                    width: virtualColumn.size,
                    height: virtualRow.size,
                  }}
                >
                  <SpreadsheetCell
                    row={virtualRow.index}
                    col={virtualColumn.index}
                    isSelected={
                      selection?.row === virtualRow.index &&
                      selection?.col === virtualColumn.index
                    }
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
