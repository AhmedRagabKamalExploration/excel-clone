// components/spreadsheet/FormulaBar.tsx
import React, { useRef, useEffect } from "react";
import { useSpreadsheetStore, getCellId } from "@/lib/store";

export const FormulaBar: React.FC = () => {
  const { selection, cells, updateCell } = useSpreadsheetStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the current cell data if a cell is selected
  const currentCellId = selection
    ? getCellId(selection.row, selection.col)
    : null;
  const currentCellData = currentCellId ? cells.get(currentCellId) : null;

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update is done on blur or enter key
  };

  // Handle input blur
  const handleBlur = () => {
    if (selection && inputRef.current) {
      updateCell(selection, inputRef.current.value);
    }
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && selection && inputRef.current) {
      updateCell(selection, inputRef.current.value);
      e.preventDefault();
    }
  };

  // Focus effect
  useEffect(() => {
    if (selection && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selection]);

  return (
    <div className="flex items-center bg-gray-100 p-2 border-b">
      <div className="mr-2 font-medium min-w-[50px]">{currentCellId || ""}</div>
      <div className="flex-1">
        <input
          ref={inputRef}
          className="w-full px-2 py-1 border border-gray-300 rounded"
          value={currentCellData?.value || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Enter value or formula..."
          disabled={!selection}
        />
      </div>
    </div>
  );
};
