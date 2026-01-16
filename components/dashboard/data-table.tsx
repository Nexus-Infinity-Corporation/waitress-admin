"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ColumnDef<T> = {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
};

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: ColumnDef<T>[];
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchKey?: keyof T;
  searchPlaceholder?: string;
}

export function DataTable<T extends { id: string }>({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  searchKey,
  searchPlaceholder = "Search...",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");

  const filteredData = searchKey
    ? data.filter((item) => {
        const value = item[searchKey];
        return value
          ? String(value).toLowerCase().includes(search.toLowerCase())
          : false;
      })
    : data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out">
        <h2 className="text-2xl font-bold transition-colors duration-1000 ease-in-out">
          {title}
        </h2>
        {onAdd && (
          <Button
            className="bg-blue-500 hover:bg-blue-600 transition-all duration-1000 ease-in-out hover:scale-105 hover:shadow-md active:scale-95"
            onClick={onAdd}
          >
            <Plus className="mr-2 h-4 w-4 transition-transform duration-1000 ease-in-out" />
            Add New
          </Button>
        )}
      </div>

      {/* Search */}
      {searchKey && (
        <div className="relative max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out animate-delay-100">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-1000 ease-in-out" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-10 transition-all duration-1000 ease-in-out focus:scale-[1.02] focus:shadow-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card transition-all duration-1000 ease-in-out hover:shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out animate-delay-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className="px-6 py-4 text-left text-sm font-medium text-muted-foreground transition-colors duration-1000 ease-in-out"
                  >
                    {column.header}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground transition-colors duration-1000 ease-in-out">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                    className="px-6 py-8 text-center text-muted-foreground transition-colors duration-1000 ease-in-out"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-muted/50 transition-all duration-1000 ease-in-out hover:scale-[1.01] animate-in fade-in slide-in-from-left-4 duration-1000 ease-in-out"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-6 py-4 transition-colors duration-1000 ease-in-out"
                      >
                        {column.render
                          ? column.render(item)
                          : String(item[column.key as keyof T] ?? "")}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 transition-all duration-1000 ease-in-out hover:scale-110 hover:rotate-90"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="animate-in fade-in slide-in-from-top-4 duration-1000"
                          >
                            {onEdit && (
                              <DropdownMenuItem
                                onClick={() => onEdit(item)}
                                className="transition-colors duration-1000 ease-in-out"
                              >
                                <Edit className="mr-2 h-4 w-4 transition-transform duration-1000 ease-in-out" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => onDelete(item)}
                                className="text-destructive transition-colors duration-1000 ease-in-out"
                              >
                                <Trash2 className="mr-2 h-4 w-4 transition-transform duration-1000 ease-in-out" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
