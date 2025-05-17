// src/TableCrud.tsx
import React, { ReactNode, useMemo, useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { TextField } from "@mui/material";

type Person = {
  id: number;
  name: string;
  age: number;
};

type MuiLikeColumn<T> = {
  field: keyof T;
  headerName: string;
  renderCell?: (value: any) => React.ReactNode;
  renderEditCell?: (
    row: T,
    value: string,
    onChange: (val: string) => void,
    onBlur: () => void
  ) => React.ReactNode;
};

export default function TableCrud() {
  const [data, setData] = useState<Person[]>([
    { id: 1, name: "Nguyễn Văn A", age: 30 },
    { id: 2, name: "Trần Thị B", age: 25 },
  ]);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<{
    rowId: number;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const updateCell = (rowId: number, field: keyof Person, value: any) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, [field]: field === "age" ? Number(value) : value }
          : row
      )
    );
  };

  const muiLikeColumns: MuiLikeColumn<Person>[] = [
    {
      field: "id",
      headerName: "ID",
      renderCell: (value: number) => <span>{value}</span>,
    },
    {
      field: "name",
      headerName: "Name",
      renderCell: (value: string) => <strong>{value}</strong>,
      renderEditCell: (
        row: Person,
        value: string,
        onChange: (val: string) => void,
        onBlur: () => void
      ) => (
        <TextField
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoFocus
          fullWidth
        />
      ),
    },
    {
      field: "age",
      headerName: "Age",
      renderCell: (value: number) => <span>{value} tuổi</span>,
      renderEditCell: (
        row: Person,
        value: string,
        onChange: (val: string) => void,
        onBlur: () => void
      ) => (
        <TextField
          size="small"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoFocus
          fullWidth
        />
      ),
    },
  ];

  const columns = useMemo<ColumnDef<Person>[]>(() => {
    return muiLikeColumns.map((col) => ({
      accessorKey: col.field,
      header: col.headerName,
      cell: (info) => {
        const row = info.row.original;
        const value = info.getValue();
        const isEditing =
          editingCell &&
          editingCell.rowId === row.id &&
          editingCell.field === col.field;

        if (isEditing && col.renderEditCell) {
          return col.renderEditCell(
            row,
            editValue,
            (val) => setEditValue(val),
            () => {
              updateCell(row.id, col.field as keyof Person, editValue);
              setEditingCell(null);
            }
          );
        }

        return (
          <div className="text-center">
            {col.renderCell ? col.renderCell(value) : (value as ReactNode)}
          </div>
        );
      },
    }));
  }, [editingCell, editValue]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedRow = data.find((row) => row.id === selectedRowId);

  const handleAdd = () => {
    const name = prompt("Enter name");
    const ageStr = prompt("Enter age");
    if (name && ageStr) {
      setData((prev) => [
        ...prev,
        { id: Date.now(), name, age: parseInt(ageStr) },
      ]);
    }
  };

  const handleEdit = () => {
    if (!selectedRow) return;
    // Khi edit, mở tất cả các field
    setEditingCell(null); // clear từng cell editing
    // Mình sẽ set một state mới để bật edit tất cả các cột cho dòng đó
    setEditRowId(selectedRow.id);
    setEditValues({
      id: selectedRow.id.toString(),
      name: selectedRow.name,
      age: selectedRow.age.toString(),
    });
  };

  // State mới cho edit toàn bộ dòng
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const handleChangeEditValue = (field: keyof Person, val: string) => {
    setEditValues((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleSave = () => {
    if (editRowId !== null) {
      setData((prev) =>
        prev.map((row) =>
          row.id === editRowId
            ? {
                ...row,
                id: Number(editValues.id),
                name: editValues.name,
                age: Number(editValues.age),
              }
            : row
        )
      );
      setEditRowId(null);
      setEditValues({});
    }
  };

  const handleCancel = () => {
    setEditRowId(null);
    setEditValues({});
  };

  const handleDelete = () => {
    if (selectedRow && window.confirm("Delete this row?")) {
      setData((prev) => prev.filter((row) => row.id !== selectedRow.id));
      setSelectedRowId(null);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen">
      <div className="mb-4 space-x-2">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add
        </button>
        <button
          onClick={handleEdit}
          disabled={!selectedRow}
          className={`px-4 py-2 rounded ${
            selectedRow
              ? "bg-green-500 text-white"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Edit
        </button>

        <button
          onClick={handleDelete}
          disabled={!selectedRow}
          className={`px-4 py-2 rounded ml-2 ${
            selectedRow
              ? "bg-red-500 text-white"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Delete
        </button>
      </div>

      <table className="min-w-full border border-black text-center">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border border-gray-500 px-4 py-2 bg-gray-100 text-center"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const isEditingThisRow = editRowId === row.original.id;
            return (
              <tr
                key={row.id}
                className={`cursor-pointer ${
                  row.original.id === selectedRowId ? "bg-yellow-300" : ""
                }`}
                onClick={() => setSelectedRowId(row.original.id)}
              >
                {row.getVisibleCells().map((cell) => {
                  const colField = cell.column.id as keyof Person;
                  if (isEditingThisRow) {
                    // Edit toàn bộ dòng
                    const col = muiLikeColumns.find(
                      (c) => c.field === colField
                    );
                    if (col && col.renderEditCell) {
                      return (
                        <td
                          key={cell.id}
                          className="border border-gray-500 px-4 py-1 text-center"
                        >
                          {col.renderEditCell(
                            row.original,
                            editValues[colField] ?? "",
                            (val) => handleChangeEditValue(colField, val),
                            () => {}
                          )}
                        </td>
                      );
                    }
                    return (
                      <td
                        key={cell.id}
                        className="border border-gray-500 px-4 py-1 text-center"
                      >
                        {cell.getValue()?.toString() ?? ""}
                      </td>
                    );
                  }

                  return (
                    <td
                      key={cell.id}
                      className="border border-gray-500 px-4 py-1 text-center"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {editRowId !== null && (
        <>
          <button
            onClick={handleSave}
            className="px-4 py-2 ml-2 bg-green-600 text-white rounded"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 ml-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
