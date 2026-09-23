import React from "react";
import clsx from "clsx";

export const Table = ({
  columns = [],
  data = [],
  keyField = "_id",
  onRowClick,
  emptyMessage = "No records found",
  loading = false,
  className = ""
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-muted font-mono text-xs flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading data...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-muted font-mono text-xs border border-dashed border-border rounded-md">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={clsx("overflow-x-auto border border-border rounded-md", className)}>
      <table className="bank-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={clsx(col.className, col.align === "right" && "text-right")}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row[keyField] || rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={clsx(
                onRowClick && "cursor-pointer transition-colors hover:bg-surface-hover"
              )}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={col.key || colIdx}
                  className={clsx(col.className, col.align === "right" && "text-right")}
                >
                  {col.render ? col.render(row, rowIdx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
