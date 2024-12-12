import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";

interface TableComponentProps {
    columns: GridColDef[];
    apiUrl: string;
    exportFilename?: string;
    filterOptions?: Record<string, any>;
    pagination?: boolean;
    pageSize?: number;
}

const TableComponent: React.FC<TableComponentProps> = ({
    columns,
    apiUrl,
    exportFilename = "data_export",
    filterOptions = {},
    pagination = true,
    pageSize = 10,
}) => {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(apiUrl, { params: filterOptions });

            const fetchedRows = Array.isArray(response.data)
                ? response.data
                : response.data.data || [];
            if (!Array.isArray(fetchedRows)) {
                throw new Error("Unexpected data format: expected an array.");
            }
            const processedRows = fetchedRows.map((row, index) => ({
                ...row,
                id: row.id ?? index, // Ensure each row has a unique ID
            }));
            setRows(processedRows);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const csvData = rows.map((row) =>
            columns.map((col) => `"${row[col.field] ?? ""}"`).join(",")
        );
        const csvContent = [
            columns.map((col) => col.headerName).join(","),
            ...csvData,
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${exportFilename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        fetchData();
    }, [filterOptions]);

    return (
        <div style={{ height: 400, width: "100%" }}>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button
                onClick={handleExport}
                style={{
                    marginTop: 10,
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    cursor: "pointer",
                }}
            >
                Export as CSV
            </button>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                disableSelectionOnClick
                components={{
                    Toolbar: GridToolbar,
                }}
                pagination={pagination}
                pageSize={pagination ? pageSize : rows.length}
                rowsPerPageOptions={pagination ? [5, 10, 20, 50] : []}
                getRowId={(row) => row.id}
            />
        </div>
    );
};

export default TableComponent;
