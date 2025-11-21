// ===== NOTIFICATIONS MANAGER =====

class NotificationsManager {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.init();
    }

    init() {
        this.loadNotifications();
        this.setupEventListeners();
        this.updateBadge();
    }

    setupEventListeners() {
        const notificationsBtn = document.getElementById('notifications-btn');
        const closeBtn = document.getElementById('close-notifications');
        const markAllReadBtn = document.getElementById('mark-all-read');
        const panel = document.getElementById('notifications-panel');

        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                this.togglePanel();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePanel();
            });
        }

        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }

        // Close panel when clicking outside
        if (panel) {
            panel.addEventListener('click', (e) => {
                if (e.target === panel) {
                    this.closePanel();
                }
            });
        }
    }

    loadNotifications() {
        // Load from localStorage or generate demo notifications
        const stored = localStorage.getItem('dhindus_notifications');
        if (stored) {
            this.notifications = JSON.parse(stored);
        } else {
            this.generateDemoNotifications();
        }
        this.updateUnreadCount();
        this.renderNotifications();
    }

    generateDemoNotifications() {
        this.notifications = [
            {
                id: 1,
                type: 'transaction',
                title: 'Transaction Successful',
                message: 'Your transfer of ₹5,000 to Account ****5678 was completed',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                read: false,
                icon: 'fa-check-circle',
                color: 'success'
            },
            {
                id: 2,
                type: 'payment',
                title: 'Bill Payment Reminder',
                message: 'Your electricity bill of ₹2,500 is due in 3 days',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                read: false,
                icon: 'fa-file-invoice-dollar',
                color: 'warning'
            },
            {
                id: 3,
                type: 'account',
                title: 'Account Updated',
                message: 'Your account balance has been updated',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                read: true,
                icon: 'fa-wallet',
                color: 'info'
            },
            {
                id: 4,
                type: 'security',
                title: 'New Login Detected',
                message: 'Your account was accessed from a new device',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                read: true,
                icon: 'fa-shield-alt',
                color: 'warning'
            }
        ];
        this.saveNotifications();
    }

    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            type: notification.type || 'info',
            title: notification.title || 'Notification',
            message: notification.message || '',
            timestamp: new Date().toISOString(),
            read: false,
            icon: notification.icon || 'fa-bell',
            color: notification.color || 'info'
        };

        this.notifications.unshift(newNotification);
        this.updateUnreadCount();
        this.renderNotifications();
        this.updateBadge();
        this.saveNotifications();

        // Show toast notification
        if (window.showToast) {
            window.showToast(newNotification.title + ': ' + newNotification.message, newNotification.color);
        }
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.updateUnreadCount();
            this.renderNotifications();
            this.updateBadge();
            this.saveNotifications();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.updateUnreadCount();
        this.renderNotifications();
        this.updateBadge();
        this.saveNotifications();
    }

    deleteNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.updateUnreadCount();
        this.renderNotifications();
        this.updateBadge();
        this.saveNotifications();
    }

    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
    }

    updateBadge() {
        const badge = document.querySelector('#notifications-btn .badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    renderNotifications() {
        const list = document.getElementById('notifications-list');
        const empty = document.getElementById('notifications-empty');

        if (!list) return;

        if (this.notifications.length === 0) {
            list.style.display = 'none';
            if (empty) empty.style.display = 'flex';
            return;
        }

        if (empty) empty.style.display = 'none';
        list.style.display = 'block';

        list.innerHTML = this.notifications.map(notification => {
            const timeAgo = this.getTimeAgo(notification.timestamp);
            const readClass = notification.read ? 'read' : 'unread';

            return `
                <div class="notification-item ${readClass}" data-id="${notification.id}">
                    <div class="notification-icon ${notification.color}">
                        <i class="fas ${notification.icon}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-header">
                            <h4>${notification.title}</h4>
                            <span class="notification-time">${timeAgo}</span>
                        </div>
                        <p class="notification-message">${notification.message}</p>
                    </div>
                    <div class="notification-actions">
                        ${!notification.read ? `
                            <button class="icon-btn-sm" onclick="window.notificationsManager.markAsRead(${notification.id})" title="Mark as read">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="icon-btn-sm" onclick="window.notificationsManager.deleteNotification(${notification.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    togglePanel() {
        const panel = document.getElementById('notifications-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                this.renderNotifications();
            }
        }
    }

    closePanel() {
        const panel = document.getElementById('notifications-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    saveNotifications() {
        localStorage.setItem('dhindus_notifications', JSON.stringify(this.notifications));
    }
}

// Initialize Notifications Manager
let notificationsManager = null;

document.addEventListener('DOMContentLoaded', () => {
    notificationsManager = new NotificationsManager();
    window.notificationsManager = notificationsManager;
});

