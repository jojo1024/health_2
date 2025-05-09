import React from 'react';
import Button from '../../components/Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
        <p className="text-sm text-gray-600 mb-2 sm:mb-0">
            Page {currentPage} sur {totalPages}
        </p>
        <div className="flex flex-wrap gap-2">
            <Button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                {`<<`}
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={page === currentPage ? 'bg-blue-500 text-white' : ''}
                >
                    {page}
                </Button>
            ))}
            <Button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                {`>>`}
            </Button>
        </div>
    </div>
);

export default Pagination;
