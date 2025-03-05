// components/spreadsheet/Spreadsheet.tsx
import React from "react";
import { SpreadsheetGrid } from "./SpreadsheetGrid";
import { FormulaBar } from "./FormulaBar";

export const Spreadsheet: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-full">
      <FormulaBar />
      <div className="flex-1">
        <SpreadsheetGrid />
      </div>
    </div>
  );
};
