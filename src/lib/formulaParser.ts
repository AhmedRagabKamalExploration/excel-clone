// lib/formulaParser.ts
import { Parser } from "hot-formula-parser";
import { CellData, getCellPosition } from "./store";

// Initialize the formula parser
const parser = new Parser();

type EvaluationResult = {
  result: any;
  dependencies: string[];
};

export function evaluateFormula(
  formula: string,
  cells: Map<string, CellData>
): EvaluationResult {
  // Track dependencies
  const dependencies: string[] = [];

  // Register cell accessor function
  parser.setFunction("callCellValue", (cellId: unknown) => {
    // Track this cell as a dependency
    dependencies.push(cellId as string);

    // Get cell data
    const cell = cells.get(cellId as string);
    return cell ? cell.displayValue : null;
  });

  // Register range accessor function
  parser.setFunction("callRangeValue", (params: unknown) => {
    const [startCellId, endCellId] = params as [string, string];
    // Handle range references like A1:B3
    const startPos = getCellPosition(startCellId);
    const endPos = getCellPosition(endCellId);

    const values = [];

    for (let row = startPos.row; row <= endPos.row; row++) {
      const rowValues = [];
      for (let col = startPos.col; col <= endPos.col; col++) {
        const cellId = String.fromCharCode(65 + col) + (row + 1);
        dependencies.push(cellId);

        const cell = cells.get(cellId);
        rowValues.push(cell ? cell.displayValue : null);
      }
      values.push(rowValues);
    }

    return values;
  });

  // Parse the formula
  const result = parser.parse(formula);

  return {
    result: result.result,
    dependencies,
  };
}
