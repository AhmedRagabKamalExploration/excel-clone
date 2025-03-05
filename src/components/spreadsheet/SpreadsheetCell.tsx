// components/spreadsheet/SpreadsheetCell.tsx
import React, { useState, useRef, useEffect } from "react";
import { CellPosition, useSpreadsheetStore, getCellId } from "@/lib/store";

interface SpreadsheetCellProps {
  row: number;
  col: number;
  isSelected: boolean;
}

export const SpreadsheetCell: React.FC<SpreadsheetCellProps> = ({
  row,
  col,
  isSelected,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cellId = getCellId(row, col);

  const { cells, updateCell, selectCell } = useSpreadsheetStore();
  const cellData = cells.get(cellId);

  // Handle click on cell
  const handleClick = () => {
    selectCell({ row, col });
  };

  // Handle double click to enter edit mode
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // Handle key press in cell
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditing) {
      if (e.key === "Enter") {
        setIsEditing(true);
        e.preventDefault();
      }
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This only updates the input field, not the store
    // Store update happens on blur or Enter press
    console.log("handleChange", e.target.value);
    console.log("cellData", cellData);
    console.log("row", row);
  };

  // Handle input blur (finish editing)
  const handleBlur = () => {
    if (isEditing && inputRef.current) {
      updateCell({ row, col }, inputRef.current.value);
      setIsEditing(false);
    }
  };

  // Handle key press in input
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (inputRef.current) {
        updateCell({ row, col }, inputRef.current.value);
      }
      setIsEditing(false);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      e.preventDefault();
    }
  };

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className={`border border-gray-200 h-8 w-24 overflow-hidden ${
        isSelected ? "border-2 border-blue-500" : ""
      }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="w-full h-full px-1 outline-none"
          defaultValue={cellData?.value || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleInputKeyDown}
        />
      ) : (
        <div className="w-full h-full px-1 truncate">
          {cellData?.displayValue || ""}
        </div>
      )}
    </div>
  );
};
