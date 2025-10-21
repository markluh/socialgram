import React from 'react';
import { Notification } from '../types';
import { NotificationItem } from '../components/NotificationItem';

interface NotificationsPageProps {
    notifications: Notification[];
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications }) => {
    return (
        <main className="w-full max-w-[600px] pt-16 md:pt-8">
            <div className="px-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Notifications</h1>
                <div className="space-y-2">
                    {notifications.map(notification => (
                        <NotificationItem key={notification.id} notification={notification} />
                    ))}
                    {notifications.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 mt-8 text-center">You're all caught up!</p>
                    )}
                </div>
            </div>
        </main>
    );
};