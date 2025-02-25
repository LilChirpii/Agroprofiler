import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DataGrid, gridExpandedSortedRowIdsSelector, gridPaginatedVisibleSortedGridRowIdsSelector, gridSortedRowIdsSelector, GridToolbarContainer, useGridApiContext, } from "@mui/x-data-grid";
import { Button, createSvgIcon, IconButton } from "@mui/material";
import { Edit2Icon, Eye, Trash } from "lucide-react";
export default function List({ rows, columns, onEdit, onDelete, onView, totalItems, itemsPerPage, currentPage, onPageChange, }) {
    const gridColumns = [
        ...columns.map((column) => ({
            field: column,
            headerName: column.charAt(0).toUpperCase() + column.slice(1),
            flex: 1,
            sortable: true,
        })),
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            sortable: false,
            renderCell: (params) => (_jsxs("div", { style: {
                    display: "flex",
                    gap: "8px",
                }, children: [_jsx(IconButton, { onClick: () => onView(params.row), "aria-label": "view", color: "primary", children: _jsx(Eye, { size: 18 }) }), _jsx(IconButton, { onClick: () => onEdit(params.row), "aria-label": "edit", color: "success", children: _jsx(Edit2Icon, { size: 18 }) }), _jsx(IconButton, { onClick: () => onDelete(params.row), "aria-label": "delete", color: "error", children: _jsx(Trash, { size: 18 }) })] })),
        },
    ];
    const getRowsFromCurrentPage = ({ apiRef }) => gridPaginatedVisibleSortedGridRowIdsSelector(apiRef);
    const getUnfilteredRows = ({ apiRef }) => gridSortedRowIdsSelector(apiRef);
    const getFilteredRows = ({ apiRef }) => gridExpandedSortedRowIdsSelector(apiRef);
    const ExportIcon = createSvgIcon(_jsx("path", { d: "M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" }), "SaveAlt");
    function CustomToolbar() {
        const apiRef = useGridApiContext();
        const handleExport = (options) => apiRef.current.exportDataAsCsv(options);
        const buttonBaseProps = {
            color: "primary",
            size: "small",
            startIcon: _jsx(ExportIcon, {}),
        };
        return (_jsxs(GridToolbarContainer, { children: [_jsx(Button, { ...buttonBaseProps, onClick: () => handleExport({
                        getRowsToExport: getRowsFromCurrentPage,
                    }), children: "Current page rows" }), _jsx(Button, { ...buttonBaseProps, onClick: () => handleExport({ getRowsToExport: getFilteredRows }), children: "Filtered rows" }), _jsx(Button, { ...buttonBaseProps, onClick: () => handleExport({ getRowsToExport: getUnfilteredRows }), children: "Unfiltered rows" })] }));
    }
    return (_jsx("div", { style: {
            height: "380px",
            width: "100%",
            overflow: "auto",
            padding: "10px",
        }, children: _jsx(DataGrid, { rows: rows, columns: gridColumns, pageSizeOptions: [5, 10], 
            // rowsPerPageOptions={[itemsPerPage]}
            pagination: true, paginationMode: "server", 
            // onPageChange={(params) => onPageChange(params.page + 1)} // Handling page change
            rowCount: totalItems, 
            // disableSelectionOnClick
            checkboxSelection: true, sx: {
                borderRadius: "20px",
                "& .MuiDataGrid-cell": {
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                },
            }, initialState: {
                ...data.initialState,
                filter: {
                    ...data.initialState?.filter,
                    filterModel: {
                        items: [
                            {
                                field: "quantity",
                                operator: ">",
                                value: "20000",
                            },
                        ],
                    },
                },
                pagination: {
                    ...data.initialState?.pagination,
                    paginationModel: {
                        pageSize: 10,
                    },
                },
            } }) }));
}
