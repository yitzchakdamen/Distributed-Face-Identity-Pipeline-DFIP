class Dashboard {
    constructor() {
        this.apiBase = '';
        this.currentView = 'dashboard';
        this.personsData = [];
        this.alertsData = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.showLoading();
        await this.loadDashboardData();
        this.hideLoading();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
    }

    async loadDashboardData() {
        try {
            const [personsResponse, alertsResponse] = await Promise.all([
                fetch('/api/persons'),
                fetch('/api/alerts')
            ]);

            if (personsResponse.ok) {
                const personsData = await personsResponse.json();
                this.personsData = personsData.persons || [];
                this.updateStats(personsData.stats || {});
                this.renderPersonsGallery();
            }

            if (alertsResponse.ok) {
                const alertsData = await alertsResponse.json();
                this.alertsData = alertsData.alerts || [];
                this.renderRecentActivity();
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    updateStats(stats) {
        const elements = {
            totalPersons: document.getElementById('totalPersons'),
            totalImages: document.getElementById('totalImages'),
            avgImages: document.getElementById('avgImages'),
            recentAlerts: document.getElementById('recentAlerts')
        };

        if (elements.totalPersons) {
            elements.totalPersons.textContent = this.formatNumber(stats.total_persons || 0);
        }
        if (elements.totalImages) {
            elements.totalImages.textContent = this.formatNumber(stats.total_images || 0);
        }
        if (elements.avgImages) {
            elements.avgImages.textContent = (stats.avg_images_per_person || 0).toFixed(1);
        }
        if (elements.recentAlerts) {
            elements.recentAlerts.textContent = this.formatNumber(this.alertsData.length);
        }
    }

    renderPersonsGallery() {
        const gallery = document.getElementById('personsGallery');
        if (!gallery) return;

        if (this.personsData.length === 0) {
            gallery.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-400 text-6xl mb-4">👥</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No persons found</h3>
                    <p class="text-gray-500">No face recognition data available yet.</p>
                </div>
            `;
            return;
        }

        gallery.innerHTML = this.personsData.map(person => `
            <div class="person-card fade-in-up" onclick="dashboard.showPersonModal('${person.person_id}')">
                <img src="${person.images[0] || '/static/images/placeholder-face.jpg'}" 
                     alt="Person ${person.person_id}" 
                     class="person-image"
                     onerror="this.src='/static/images/placeholder-face.jpg'">
                <div class="person-info">
                    <div class="person-id">ID: ${person.person_id.substring(0, 8)}...</div>
                    <div class="person-stats">
                        <span class="image-count">
                            <i class="fas fa-images"></i>
                            ${person.images.length} images
                        </span>
                        <span class="text-xs text-gray-400">Click to view</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderRecentActivity() {
        const activityList = document.getElementById('recentActivity');
        if (!activityList) return;

        const recentAlerts = this.alertsData.slice(0, 5);

        if (recentAlerts.length === 0) {
            activityList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-bell-slash text-3xl mb-2"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        activityList.innerHTML = recentAlerts.map(alert => `
            <div class="activity-item">
                <img src="${alert.image || '/static/images/placeholder-face.jpg'}" 
                     alt="Alert" 
                     class="activity-avatar"
                     onerror="this.src='/static/images/placeholder-face.jpg'">
                <div class="activity-content">
                    <div class="activity-title">Person detected: ${alert.person_id.substring(0, 8)}...</div>
                    <div class="activity-time">${this.formatTime(alert.time)}</div>
                </div>
                <span class="activity-status ${alert.level}">${alert.level}</span>
            </div>
        `).join('');
    }

    showPersonModal(personId) {
        const person = this.personsData.find(p => p.person_id === personId);
        if (!person) return;

        const modal = document.getElementById('personModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalGallery = document.getElementById('modalGallery');

        modalTitle.textContent = `Person: ${personId.substring(0, 12)}...`;
        
        modalGallery.innerHTML = person.images.map(image => `
            <img src="${image}" 
                 alt="Person image" 
                 class="modal-image"
                 onclick="dashboard.showImageFullscreen('${image}')"
                 onerror="this.src='/static/images/placeholder-face.jpg'">
        `).join('');

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    showImageFullscreen(imageSrc) {
        const fullscreenModal = document.createElement('div');
        fullscreenModal.className = 'modal active';
        fullscreenModal.innerHTML = `
            <div class="modal-content" style="background: transparent; max-width: 95vw; max-height: 95vh;">
                <img src="${imageSrc}" 
                     alt="Fullscreen image" 
                     style="width: 100%; height: 100%; object-fit: contain; border-radius: 12px;">
            </div>
        `;
        
        document.body.appendChild(fullscreenModal);
        
        fullscreenModal.addEventListener('click', () => {
            document.body.removeChild(fullscreenModal);
        });
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }

    switchView(view) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Update content
        const sections = document.querySelectorAll('.view-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        const targetSection = document.getElementById(`${view}View`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        this.currentView = view;

        // Load specific view data
        if (view === 'alerts') {
            this.renderAlertsView();
        } else if (view === 'persons') {
            this.renderPersonsView();
        }
    }

    renderAlertsView() {
        const alertsContainer = document.getElementById('alertsContainer');
        if (!alertsContainer) return;

        if (this.alertsData.length === 0) {
            alertsContainer.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-gray-400 text-6xl mb-4">🔔</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No alerts</h3>
                    <p class="text-gray-500">No security alerts at this time.</p>
                </div>
            `;
            return;
        }

        alertsContainer.innerHTML = this.alertsData.map(alert => `
            <div class="card fade-in-up">
                <div class="flex items-start gap-4">
                    <img src="${alert.image || '/static/images/placeholder-face.jpg'}" 
                         alt="Alert" 
                         class="w-16 h-16 rounded-lg object-cover"
                         onerror="this.src='/static/images/placeholder-face.jpg'">
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="font-semibold text-gray-900">Person: ${alert.person_id.substring(0, 12)}...</h3>
                            <span class="activity-status ${alert.level}">${alert.level}</span>
                        </div>
                        <p class="text-gray-600 mb-2">${alert.message}</p>
                        <div class="flex items-center gap-4 text-sm text-gray-500">
                            <span><i class="fas fa-camera mr-1"></i>Camera ${alert.camera_id}</span>
                            <span><i class="fas fa-clock mr-1"></i>${this.formatTime(alert.time)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderPersonsView() {
        const personsContainer = document.getElementById('personsContainer');
        if (!personsContainer) return;

        personsContainer.innerHTML = `
            <div class="gallery-grid">
                ${this.personsData.map(person => `
                    <div class="person-card fade-in-up" onclick="dashboard.showPersonModal('${person.person_id}')">
                        <img src="${person.images[0] || '/static/images/placeholder-face.jpg'}" 
                             alt="Person ${person.person_id}" 
                             class="person-image"
                             onerror="this.src='/static/images/placeholder-face.jpg'">
                        <div class="person-info">
                            <div class="person-id">ID: ${person.person_id.substring(0, 8)}...</div>
                            <div class="person-stats">
                                <span class="image-count">
                                    <i class="fas fa-images"></i>
                                    ${person.images.length} images
                                </span>
                                <span class="text-xs text-gray-400">Click to view</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async refreshData() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            refreshBtn.disabled = true;
        }

        await this.loadDashboardData();

        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            refreshBtn.disabled = false;
        }

        this.showNotification('Data refreshed successfully', 'success');
    }

    startAutoRefresh() {
        // Refresh data every 30 seconds
        setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }

    showLoading() {
        const loadingElements = document.querySelectorAll('.loading-placeholder');
        loadingElements.forEach(el => {
            el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        });
    }

    hideLoading() {
        const loadingElements = document.querySelectorAll('.loading-placeholder');
        loadingElements.forEach(el => {
            el.innerHTML = '';
        });
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 12px;
                    padding: 1rem 1.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    z-index: 1001;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    border-left: 4px solid var(--primary);
                }
                .notification-success { border-left-color: var(--success); }
                .notification-error { border-left-color: var(--danger); }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--gray-800);
                }
                .notification.show {
                    transform: translateX(0);
                }
            `;
            document.head.appendChild(styles);
        }

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }

    formatTime(timeString) {
        const date = new Date(timeString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});