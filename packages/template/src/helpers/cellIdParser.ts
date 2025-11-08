/**
 * Parse a cell ID string to extract box and cell coordinates
 * Cell ID format: "box:x,y,cell:x,y"
 */
export const splitCellId = (
  cellId: string
): {
  box: { x: number; y: number };
  cell: { x: number; y: number };
} => {
  const matches = Array.from(
    cellId.matchAll(
      new RegExp('box:([0-3]),([0-3]),cell:([0-3]),([0-3])', 'g')
    ),
    (m) => [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])]
  )[0];

  if (!matches) {
    console.error(`Invalid cellId format: ${cellId}`);
    // Return default values to prevent crash
    return {
      box: { x: 0, y: 0 },
      cell: { x: 0, y: 0 },
    };
  }

  return {
    box: { x: matches[0], y: matches[1] },
    cell: { x: matches[2], y: matches[3] },
  };
};
