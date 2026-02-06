// ===== Device Data Management =====
let devicesData = [];
let currentFilter = 'all';
let searchQuery = '';

// ===== Load devices from JSON =====
async function loadDevices() {
    const deviceList = document.getElementById('deviceList');
    const noResults = document.getElementById('noResults');
    
    try {
        const response = await fetch('data/devices.json');
        if (!response.ok) {
            throw new Error('Failed to load devices data');
        }
        devicesData = await response.json();
        renderDevices();
    } catch (error) {
        console.error('Error loading devices:', error);
        deviceList.innerHTML = `
            <div class="no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>Failed to load devices</h3>
                <p>Please try again later or contact support</p>
            </div>
        `;
    }
}

// ===== Render devices =====
function renderDevices() {
    const deviceList = document.getElementById('deviceList');
    const noResults = document.getElementById('noResults');
    
    // Filter devices based on current filter and search query
    let filteredDevices = devicesData.filter(device => {
        const matchesFilter = currentFilter === 'all' || device.brand.toLowerCase() === currentFilter;
        const matchesSearch = searchQuery === '' || 
            device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.codename.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });
    
    if (filteredDevices.length === 0) {
        deviceList.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    deviceList.innerHTML = filteredDevices.map(device => `
        <div class="device-card" data-brand="${device.brand.toLowerCase()}" onclick="window.location.href='device.html?id=${device.id}'">
            <div class="device-header">
                <div>
                    <h3 class="device-name">${device.name}</h3>
                    <p class="device-codename">${device.codename}</p>
                </div>
                <span class="device-badge ${device.status.toLowerCase()}">${device.status}</span>
            </div>
            <div class="device-info">
                <div class="device-info-item">
                    <span class="device-info-label">Android Version</span>
                    <span class="device-info-value">${device.androidVersion}</span>
                </div>
                <div class="device-info-item">
                    <span class="device-info-label">havocOOS Version</span>
                    <span class="device-info-value">${device.romVersion}</span>
                </div>
                <div class="device-info-item">
                    <span class="device-info-label">Build Date</span>
                    <span class="device-info-value">${device.buildDate}</span>
                </div>
                <div class="device-info-item">
                    <span class="device-info-label">Size</span>
                    <span class="device-info-value">${device.size}</span>
                </div>
            </div>
            <div class="device-actions">
                <a href="device.html?id=${device.id}" class="device-btn primary" onclick="event.stopPropagation()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    View Downloads
                </a>
                <a href="${device.changelogUrl}" class="device-btn secondary" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
    `).join('');
    
    // Re-observe new device cards for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.device-card').forEach(card => {
        observer.observe(card);
    });
}

// ===== Search functionality =====
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value.trim();
            renderDevices();
        }, 300);
    });
}

// ===== Filter functionality =====
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update filter and re-render
        currentFilter = button.dataset.filter;
        renderDevices();
    });
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    loadDevices();
});

// ===== Export functions for potential external use =====
window.deviceManager = {
    loadDevices,
    renderDevices,
    getDevices: () => devicesData,
    setFilter: (filter) => {
        currentFilter = filter;
        renderDevices();
    },
    setSearch: (query) => {
        searchQuery = query;
        renderDevices();
    }
};
