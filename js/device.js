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
        // First, load the main devices list to find the device
        const listResponse = await fetch('data/devices.json');
        if (!listResponse.ok) {
            throw new Error('Failed to load devices list');
        }
        const listData = await listResponse.json();
        const deviceInfo = listData.devices.find(device => device.id === deviceId);
        
        if (!deviceInfo) {
            showError('Device not found');
            return;
        }
        
        // Load device-specific JSON file if available
        if (deviceInfo.dataFile) {
            const deviceResponse = await fetch(deviceInfo.dataFile);
            if (deviceResponse.ok) {
                deviceData = await deviceResponse.json();
            } else {
                // Fallback to basic device info if device-specific file doesn't exist
                deviceData = deviceInfo;
            }
        } else {
            deviceData = deviceInfo;
        }
        
        renderDeviceHeader();
        renderDownloads();
        renderDeviceInfo();
        renderMaintainer();
        renderScreenshots();
        renderKnownIssues();
        document.title = `${deviceData.name} - havocOOS`;
    } catch (error) {
        console.error('Error loading device data:', error);
        showError('Failed to load device information');
    }
}

// ===== Render device header =====
function renderDeviceHeader() {
    const headerContent = document.getElementById('deviceHeaderContent');
    
    // Get wallpaper path
    const wallpaperPath = deviceData.wallpaper || `images/${deviceData.codename}.jpg`;
    
    headerContent.innerHTML = `
        <div class="device-header-inner">
            <div class="device-wallpaper" style="background-image: url('${wallpaperPath}')"></div>
            <div class="device-header-content">
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
                    <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        ${deviceData.brand.charAt(0).toUpperCase() + deviceData.brand.slice(1)}
                    </span>
                </div>
            </div>
        </div>
    `;
}

// ===== Render downloads =====
function renderDownloads() {
    const downloadsList = document.getElementById('downloadsList');
    
    if (!deviceData.builds || deviceData.builds.length === 0) {
        downloadsList.innerHTML = `
            <div class="no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>No downloads available</h3>
                <p>Check back later for updates</p>
            </div>
        `;
        return;
    }
    
    downloadsList.innerHTML = deviceData.builds.map((build, index) => `
        <div class="download-card ${index === 0 ? 'latest' : ''}">
            <div class="download-card-header">
                <div class="download-version">
                    <span class="version-number">v${build.version}</span>
                    <span class="version-type">${build.type}</span>
                    ${index === 0 ? '<span class="latest-badge">Latest</span>' : ''}
                </div>
                <span class="download-status ${build.type.toLowerCase()}">${build.type}</span>
            </div>
            <div class="download-card-body">
                <div class="download-info">
                    <div class="info-row">
                        <span class="info-label">Build Date:</span>
                        <span class="info-value">${build.date}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">File Size:</span>
                        <span class="info-value">${build.size}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Android:</span>
                        <span class="info-value">${deviceData.androidVersion}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">MD5:</span>
                        <span class="info-value md5-hash">${build.md5}</span>
                    </div>
                </div>
                <div class="download-actions">
                    <a href="${build.downloadUrl}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download ROM
                    </a>
                    <button class="btn btn-secondary" onclick="toggleChangelog(${index})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Changelog
                    </button>
                </div>
                <div id="changelog-${index}" class="changelog-content" style="display: none;">
                    <h4>Changelog</h4>
                    <ul>
                        ${build.changelog.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== Toggle changelog =====
function toggleChangelog(index) {
    const changelog = document.getElementById(`changelog-${index}`);
    if (changelog) {
        changelog.style.display = changelog.style.display === 'none' ? 'block' : 'none';
    }
}

// ===== Render device info =====
function renderDeviceInfo() {
    const deviceInfo = document.getElementById('deviceInfo');
    
    if (!deviceData.deviceInfo) {
        deviceInfo.innerHTML = '';
        return;
    }
    
    const info = deviceData.deviceInfo;
    
    deviceInfo.innerHTML = `
        <div class="info-card">
            <h3 class="info-card-title">Device Specifications</h3>
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
                <div class="info-row">
                    <span class="info-label">Chipset:</span>
                    <span class="info-value">${info.chipset}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">CPU:</span>
                    <span class="info-value">${info.cpu}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">GPU:</span>
                    <span class="info-value">${info.gpu}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">RAM:</span>
                    <span class="info-value">${info.ram}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Storage:</span>
                    <span class="info-value">${info.storage}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Display:</span>
                    <span class="info-value">${info.display}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Battery:</span>
                    <span class="info-value">${info.battery}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Camera:</span>
                    <span class="info-value">${info.camera}</span>
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
                    <span class="info-value">${deviceData.builds && deviceData.builds[0] ? deviceData.builds[0].date : 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">File Size:</span>
                    <span class="info-value">${deviceData.builds && deviceData.builds[0] ? deviceData.builds[0].size : 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

// ===== Render maintainer =====
function renderMaintainer() {
    const maintainerSection = document.getElementById('maintainerSection');
    
    if (!deviceData.maintainer) {
        maintainerSection.innerHTML = '';
        return;
    }
    
    const maintainer = deviceData.maintainer;
    
    maintainerSection.innerHTML = `
        <div class="info-card">
            <h3 class="info-card-title">Maintainer</h3>
            <div class="maintainer-info">
                <div class="maintainer-avatar">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <div class="maintainer-details">
                    <h4 class="maintainer-name">${maintainer.name}</h4>
                    <p class="maintainer-username">@${maintainer.username}</p>
                    <div class="maintainer-links">
                        ${maintainer.telegram ? `
                        <a href="https://t.me/${maintainer.telegram.replace('@', '')}" target="_blank" rel="noopener noreferrer" class="maintainer-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022-.547l-8.38-3.876a2.252 2.252 0 0 0-1.846.817l-.075.068c-1.794 1.623-3.934 2.948-6.22 3.768-.227.098-.465.165-.718.165-.968 0-1.877-.735-1.877-1.654 0-.314.126-.615.352-.892l7.497-9.817a.6.6.6 0 0 1 .228-.484c.192-.307.466-.549.804-.716l.076-.032c1.797-.607 3.549-1.328 5.08-2.163.207-.117.41-.265.636-.265.966 0 1.759-.905 1.759-2.175 0-.312-.077-.6-.214-.863l-7.5-9.867z"></path>
                            </svg>
                            Telegram
                        </a>` : ''}
                        ${maintainer.xda ? `
                        <a href="${maintainer.xda}" target="_blank" rel="noopener noreferrer" class="maintainer-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            XDA
                        </a>` : ''}
                        ${maintainer.email ? `
                        <a href="mailto:${maintainer.email}" class="maintainer-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            Email
                        </a>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== Render screenshots =====
function renderScreenshots() {
    const screenshotsSection = document.getElementById('screenshotsSection');
    
    if (!deviceData.screenshots || deviceData.screenshots.length === 0) {
        screenshotsSection.innerHTML = '';
        return;
    }
    
    screenshotsSection.innerHTML = `
        <div class="info-card">
            <h3 class="info-card-title">Screenshots</h3>
            <div class="screenshots-grid">
                ${deviceData.screenshots.map((screenshot, index) => `
                    <div class="screenshot-item">
                        <div class="screenshot-placeholder" onclick="openScreenshot('${screenshot}')">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span>Screenshot ${index + 1}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ===== Open screenshot =====
function openScreenshot(src) {
    window.open(src, '_blank');
}

// ===== Render known issues =====
function renderKnownIssues() {
    const issuesSection = document.getElementById('issuesSection');
    
    if (!deviceData.knownIssues || deviceData.knownIssues.length === 0) {
        issuesSection.innerHTML = '';
        return;
    }
    
    issuesSection.innerHTML = `
        <div class="info-card warning-card">
            <h3 class="info-card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.16L6 22h12l2.47-2.84A2 2 0 0 0 22.18 18L13.71 3.86a2 2 0 0 0-3.42 0zM12 18a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"></path>
                </svg>
                Known Issues
            </h3>
            <div class="info-card-content">
                <ul class="issues-list">
                    ${deviceData.knownIssues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
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
