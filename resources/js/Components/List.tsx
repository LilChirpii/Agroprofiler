import React from "react";
import {
    DataGrid,
    GridColDef,
    GridCsvExportOptions,
    GridCsvGetRowsToExportParams,
    gridExpandedSortedRowIdsSelector,
    gridPaginatedVisibleSortedGridRowIdsSelector,
    GridRenderCellParams,
    gridSortedRowIdsSelector,
    GridToolbarContainer,
    GridToolbarExport,
    useGridApiContext,
} from "@mui/x-data-grid";
import { Button, createSvgIcon, IconButton } from "@mui/material";
import { Edit2Icon, Eye, Trash } from "lucide-react";
import { ButtonProps } from "antd";

interface ListProps {
    rows: any[];
    columns: string[];
    onEdit: (row: any) => void;
    onDelete: (row: any) => void;
    onView: (row: any) => void;
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export default function List({
    rows,
    columns,
    onEdit,
    onDelete,
    onView,
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
}: ListProps) {
    const gridColumns: GridColDef[] = [
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
            renderCell: (params: GridRenderCellParams) => (
                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                    }}
                >
                    <IconButton
                        onClick={() => onView(params.row)}
                        aria-label="view"
                        color="primary"
                    >
                        <Eye size={18} />
                    </IconButton>
                    <IconButton
                        onClick={() => onEdit(params.row)}
                        aria-label="edit"
                        color="success"
                    >
                        <Edit2Icon size={18} />
                    </IconButton>
                    <IconButton
                        onClick={() => onDelete(params.row)}
                        aria-label="delete"
                        color="error"
                    >
                        <Trash size={18} />
                    </IconButton>
                </div>
            ),
        },
    ];

    const getRowsFromCurrentPage = ({ apiRef }: GridCsvGetRowsToExportParams) =>
        gridPaginatedVisibleSortedGridRowIdsSelector(apiRef);

    const getUnfilteredRows = ({ apiRef }: GridCsvGetRowsToExportParams) =>
        gridSortedRowIdsSelector(apiRef);

    const getFilteredRows = ({ apiRef }: GridCsvGetRowsToExportParams) =>
        gridExpandedSortedRowIdsSelector(apiRef);

    const ExportIcon = createSvgIcon(
        <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />,
        "SaveAlt"
    );

    function CustomToolbar() {
        const apiRef = useGridApiContext();

        const handleExport = (options: GridCsvExportOptions) =>
            apiRef.current.exportDataAsCsv(options);

        const buttonBaseProps: ButtonProps = {
            color: "primary",
            size: "small",
            startIcon: <ExportIcon />,
        };

        return (
            <GridToolbarContainer>
                <Button
                    {...buttonBaseProps}
                    onClick={() =>
                        handleExport({
                            getRowsToExport: getRowsFromCurrentPage,
                        })
                    }
                >
                    Current page rows
                </Button>
                <Button
                    {...buttonBaseProps}
                    onClick={() =>
                        handleExport({ getRowsToExport: getFilteredRows })
                    }
                >
                    Filtered rows
                </Button>
                <Button
                    {...buttonBaseProps}
                    onClick={() =>
                        handleExport({ getRowsToExport: getUnfilteredRows })
                    }
                >
                    Unfiltered rows
                </Button>
            </GridToolbarContainer>
        );
    }

    return (
        <div
            style={{
                height: "380px",
                width: "100%",
                overflow: "auto",
                padding: "10px",
            }}
        >
            <DataGrid
                rows={rows}
                columns={gridColumns}
                pageSizeOptions={[5, 10]}
                // rowsPerPageOptions={[itemsPerPage]}
                pagination
                paginationMode="server"
                // onPageChange={(params) => onPageChange(params.page + 1)} // Handling page change
                rowCount={totalItems}
                // disableSelectionOnClick
                checkboxSelection
                sx={{
                    borderRadius: "20px",
                    "& .MuiDataGrid-cell": {
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                    },
                }}
                initialState={{
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
                }}
            />
        </div>
    );
}
