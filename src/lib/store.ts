// lib/store.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import { evaluateFormula } from "./formulaParser";

// Enable the MapSet plugin for Immer
enableMapSet();

export type CellPosition = {
  row: number;
  col: number;
};

export type CellData = {
  value: string;
  displayValue?: string | number;
  formula?: string;
  dependencies?: string[];
};

export type SpreadsheetState = {
  cells: Map<string, CellData>;
  selection: CellPosition | null;
  columnWidths: Map<number, number>;
  rowHeights: Map<number, number>;

  // Actions
  updateCell: (position: CellPosition, value: string) => void;
  selectCell: (position: CellPosition | null) => void;
  setColumnWidth: (col: number, width: number) => void;
  setRowHeight: (row: number, height: number) => void;
};

// Helper to convert row/col to cell ID (e.g., A1, B2)
export const getCellId = (row: number, col: number): string => {
  const colLabel = String.fromCharCode(65 + col);
  return `${colLabel}${row + 1}`;
};

// Helper to convert cell ID to row/col
export const getCellPosition = (cellId: string): CellPosition => {
  const colLabel = cellId.match(/[A-Z]+/)?.[0] || "A";
  const rowLabel = cellId.match(/\d+/)?.[0] || "1";

  const col = colLabel.charCodeAt(0) - 65;
  const row = parseInt(rowLabel) - 1;

  return { row, col };
};

// Create store
export const useSpreadsheetStore = create<SpreadsheetState>()(
  immer((set, get) => ({
    cells: new Map<string, CellData>(),
    selection: null,
    columnWidths: new Map<number, number>(),
    rowHeights: new Map<number, number>(),

    updateCell: (position, value) => {
      set((state) => {
        const cellId = getCellId(position.row, position.col);

        // Check if it's a formula
        const isFormula = value.startsWith("=");

        let cellData: CellData = {
          value,
          displayValue: value,
        };

        if (isFormula) {
          try {
            // Remove the '=' prefix for evaluation
            const formulaExpression = value.substring(1);
            cellData.formula = formulaExpression;

            // Evaluate the formula
            const { result, dependencies } = evaluateFormula(
              formulaExpression,
              state.cells
            );
            cellData.displayValue = result;
            cellData.dependencies = dependencies;

            // Update dependent cells
            // This is a simplified version - in a real implementation,
            // you'd need to recalculate all dependent cells recursively
          } catch (error) {
            cellData.displayValue = "#ERROR";
          }
        }

        state.cells.set(cellId, cellData);
      });
    },

    selectCell: (position) => {
      set({ selection: position });
    },

    setColumnWidth: (col, width) => {
      set((state) => {
        state.columnWidths.set(col, width);
      });
    },

    setRowHeight: (row, height) => {
      set((state) => {
        state.rowHeights.set(row, height);
      });
    },
  }))
);
