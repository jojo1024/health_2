import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
    message,
    type,
    onClose,
    duration = 4000,
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${bgColor} ${borderColor} shadow-lg`}>
            <div className="flex items-center">
                <p className={`${textColor} font-medium`}>{message}</p>
                <button
                    onClick={onClose}
                    className="ml-4 text-gray-400 hover:text-gray-500"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default Notification; 