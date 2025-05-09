import React, { useState, useMemo } from 'react';
import Pagination from './Pagination';

export interface Column<T> {
    /**
     * Label for the header or the mobile card title
     */
    label: string;
    /**
     * Function to render the cell value for this column
     */
    render: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
    /** Array of items to display */
    items: T[];
    /** Column definitions */
    columns: Column<T>[];
    /** Optional render function for actions column */
    renderActions?: (item: T) => React.ReactNode;
    /** Message to display when items array is empty */
    noDataText?: string;
    /** Number of items per page */
    itemsPerPage?: number;
    /** Function to get a unique key for each item (defaults to using index) */
    getItemKey?: (item: T, index: number) => string | number;
}

/**
 * Generic, responsive data table with mobile card view, desktop table view, and pagination.
 *
 * @template T Type of items displayed in the table
 */
function DataTable<T>({
    items,
    columns,
    renderActions,
    noDataText = 'No data available',
    itemsPerPage = 10,
    getItemKey = (item: T, index: number) => index.toString(),
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate total pages
    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

    // Memoize paginated items
    const paginatedItems = useMemo(
        () => items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [items, currentPage, itemsPerPage]
    );

    // Handle page change
    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div className="w-full">
            {/* Mobile: cards */}
            <div className="sm:hidden">
                {paginatedItems.length > 0 ? (
                    paginatedItems.map((item, index) => (
                        <div key={getItemKey(item, index)} className="bg-white rounded-lg shadow p-4 mb-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">
                                    {columns[0].render(item)}
                                </h3>
                                {renderActions && (
                                    <div className="flex space-x-2">
                                        {renderActions(item)}
                                    </div>
                                )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600 space-y-1">
                                {columns.slice(1).map(({ label, render }) => (
                                    <p key={label}>
                                        <span className="font-medium">{label}:</span> {render(item)}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">{noDataText}</p>
                )}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map(({ label }) => (
                                <th
                                    key={label}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {label}
                                </th>
                            ))}
                            {renderActions && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedItems.length > 0 ? (
                            paginatedItems.map((item, index) => (
                                <tr key={getItemKey(item, index)} className="hover:bg-gray-50">
                                    {columns.map(({ render, label }) => (
                                        <td key={label} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {render(item)}
                                        </td>
                                    ))}
                                    {renderActions && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {renderActions(item)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (renderActions ? 1 : 0)}
                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                >
                                    {noDataText}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
            />
        </div>
    );
}

export default DataTable;