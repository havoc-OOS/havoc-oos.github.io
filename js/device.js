// ===== Device Page JavaScript =====
let deviceData = null;
let deviceId = null;

// ===== Get device ID from URL =====
function getDeviceIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// ===== Load device data =====
async function loadDeviceData() {
    deviceId = getDeviceIdFromUrl();
    
    if (!deviceId) {
        showError('Device ID not found in URL');
        return;
    }
    
    try {
        const response = await fetch('data/devices.json');
        if (!response.ok) {
            throw new Error('Failed to load devices data');
        }
        const data = await response.json();
        deviceData = data.devices.find(device => device.id === deviceId);
        
        if (!deviceData) {
            showError('Device not found');
            return;
        }
        
        renderDeviceHeader();
        renderDownloads();
        renderDeviceInfo();
        document.title = `${deviceData.name} - havocOOS`;
    } catch (error) {
        console.error('Error loading device data:', error);
        showError('Failed to load device information');
    }
}

// ===== Render device header =====
function renderDeviceHeader() {
    const headerContent = document.getElementById('deviceHeaderContent');
    
    headerContent.innerHTML = `
        <div class="device-header-inner">
            <div class="device-badge ${deviceData.status.toLowerCase()}">${deviceData.status}</div>
            <h1 class="device-header-title">${deviceData.name}</h1>
            <p class="device-header-codename">Codename: ${deviceData.codename}</p>
            <div class="device-header-meta">
                <span class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                    Android ${deviceData.androidVersion}
                </span>
                <span class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    havocOOS ${deviceData.romVersion}
                </span>
            </div>
        </div>
    `;
}

// ===== Render downloads =====
function renderDownloads() {
    const downloadsList = document.getElementById('downloadsList');
    
    // Generate multiple download versions based on the device data
    const downloads = [
        {
            version: deviceData.romVersion,
            type: 'Official',
            date: deviceData.buildDate,
            size: deviceData.size,
            url: deviceData.downloadUrl,
            changelog: deviceData.changelogUrl,
            status: 'stable'
        },
        {
            version: (parseFloat(deviceData.romVersion) - 0.1).toFixed(1),
            type: 'Official',
            date: getPreviousDate(deviceData.buildDate, 7),
            size: deviceData.size,
            url: deviceData.downloadUrl.replace(deviceData.romVersion, (parseFloat(deviceData.romVersion) - 0.1).toFixed(1)),
            changelog: deviceData.changelogUrl,
            status: 'stable'
        },
        {
            version: (parseFloat(deviceData.romVersion) - 0.2).toFixed(1),
            type: 'Official',
            date: getPreviousDate(deviceData.buildDate, 14),
            size: deviceData.size,
            url: deviceData.downloadUrl.replace(deviceData.romVersion, (parseFloat(deviceData.romVersion) - 0.2).toFixed(1)),
            changelog: deviceData.changelogUrl,
            status: 'stable'
        }
    ];
    
    downloadsList.innerHTML = downloads.map(download => `
        <div class="download-card">
            <div class="download-card-header">
                <div class="download-version">
                    <span class="version-number">v${download.version}</span>
                    <span class="version-type">${download.type}</span>
                </div>
                <span class="download-status ${download.status}">${download.status}</span>
            </div>
            <div class="download-card-body">
                <div class="download-info">
                    <div class="info-row">
                        <span class="info-label">Build Date:</span>
                        <span class="info-value">${download.date}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">File Size:</span>
                        <span class="info-value">${download.size}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Android:</span>
                        <span class="info-value">${deviceData.androidVersion}</span>
                    </div>
                </div>
                <div class="download-actions">
                    <a href="${download.url}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download ROM
                    </a>
                    <a href="${download.changelog}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Changelog
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== Render device info =====
function renderDeviceInfo() {
    const deviceInfo = document.getElementById('deviceInfo');
    
    deviceInfo.innerHTML = `
        <div class="info-card">
            <h3 class="info-card-title">Device Details</h3>
            <div class="info-card-content">
                <div class="info-row">
                    <span class="info-label">Device Name:</span>
                    <span class="info-value">${deviceData.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Codename:</span>
                    <span class="info-value">${deviceData.codename}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Brand:</span>
                    <span class="info-value">${deviceData.brand.charAt(0).toUpperCase() + deviceData.brand.slice(1)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value status-badge ${deviceData.status.toLowerCase()}">${deviceData.status}</span>
                </div>
            </div>
        </div>
        <div class="info-card">
            <h3 class="info-card-title">ROM Information</h3>
            <div class="info-card-content">
                <div class="info-row">
                    <span class="info-label">havocOOS Version:</span>
                    <span class="info-value">${deviceData.romVersion}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Android Version:</span>
                    <span class="info-value">${deviceData.androidVersion}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Latest Build:</span>
                    <span class="info-value">${deviceData.buildDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">File Size:</span>
                    <span class="info-value">${deviceData.size}</span>
                </div>
            </div>
        </div>
        <div class="info-card">
            <h3 class="info-card-title">Support Links</h3>
            <div class="info-card-content">
                <a href="${deviceData.changelogUrl}" class="support-link" target="_blank" rel="noopener noreferrer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    View Changelog
                </a>
                <a href="#" class="support-link" target="_blank" rel="noopener noreferrer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    Telegram Support
                </a>
                <a href="#" class="support-link" target="_blank" rel="noopener noreferrer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Report Issue
                </a>
            </div>
        </div>
    `;
}

// ===== Helper function to get previous date =====
function getPreviousDate(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

// ===== Show error message =====
function showError(message) {
    const headerContent = document.getElementById('deviceHeaderContent');
    const downloadsList = document.getElementById('downloadsList');
    
    headerContent.innerHTML = `
        <div class="error-message">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Error</h3>
            <p>${message}</p>
            <a href="download.html" class="btn btn-primary">Back to Downloads</a>
        </div>
    `;
    
    downloadsList.innerHTML = '';
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    loadDeviceData();
});
