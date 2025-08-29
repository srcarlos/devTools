// DevTools Dashboard
// API endpoints para la nueva app devTools independiente
const API_BASE = '/api/monitor';
const LOGS_ENDPOINT = `${API_BASE}/logs`;
const STATS_ENDPOINT = `${API_BASE}/stats`;
const DASHBOARD_ENDPOINT = `${API_BASE}/dashboard`;
const CLEAR_ENDPOINT = `${API_BASE}/logs`;
const HEALTH_ENDPOINT = '/api/healthcheck/health';

const AUTO_INTERVAL_MS = 5000;

// State management
let currentLogs = [];
let autoUpdateInterval = null;
let isAutoUpdate = false;
let chart = null;

// DOM elements
const tbody = document.getElementById('logs-body');
const lastUpdateElement = document.getElementById('last-update');
const backendStatusElement = document.getElementById('backend-status');
const totalLogsElement = document.getElementById('total-logs');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  initializeEventListeners();
  initializeChart();
  loadDashboard();
});

function initializeEventListeners() {
  // Refresh button
  document.getElementById('refresh').addEventListener('click', loadDashboard);
  
  // Auto-update toggle
  document.getElementById('auto-update').addEventListener('click', toggleAutoUpdate);
  
  // Clear logs
  document.getElementById('clear').addEventListener('click', clearLogs);
  
  // Health check
  document.getElementById('healthcheck').addEventListener('click', checkHealth);
  
  // Stats toggle
  document.getElementById('stats').addEventListener('click', toggleStats);
  
  // Connection test
  document.getElementById('connection-test').addEventListener('click', testConnection);
  
  // Filter application
  document.getElementById('apply-filters').addEventListener('click', applyFilters);
  
  // Modal close
  document.getElementById('rd-modal-close').addEventListener('click', closeModal);
  document.getElementById('rd-modal-overlay').addEventListener('click', closeModal);
}

function initializeChart() {
  const ctx = document.getElementById('requests-chart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Requests per minute',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

async function loadDashboard() {
  try {
    showLoading();
    
    const response = await fetch(DASHBOARD_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (result.success) {
      currentLogs = result.data.logs || [];
      updateLogsTable(currentLogs);
      updateStats(result.data.stats);
      updateChart(result.data.logs);
      updateBackendStatus(true);
      updateLastRefresh();
    } else {
      throw new Error(result.error || 'Failed to load dashboard');
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showError('Error cargando dashboard: ' + error.message);
    updateBackendStatus(false);
  } finally {
    hideLoading();
  }
}

function updateLogsTable(logs) {
  if (!logs || logs.length === 0) {
    tbody.innerHTML = '<tr class="help-row"><td colspan="7">No hay logs disponibles</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map(log => createLogRow(log)).join('');
  updateTotalLogs(logs.length);
}

function createLogRow(log) {
  const time = new Date(log.timestamp).toLocaleTimeString();
  const statusClass = getStatusClass(log.status);
  
  return `
    <tr class="log-row" onclick="showLogDetails('${log.id}')">
      <td>${time}</td>
      <td><span class="method method-${log.method.toLowerCase()}">${log.method}</span></td>
      <td class="url-cell" title="${log.url}">${truncateUrl(log.url)}</td>
      <td><span class="status ${statusClass}">${log.status}</span></td>
      <td>${log.responseTime}ms</td>
      <td>${log.ip || '-'}</td>
      <td><span class="source-badge">${log.source || 'unknown'}</span></td>
    </tr>
  `;
}

function getStatusClass(status) {
  if (status >= 200 && status < 300) return 'status-success';
  if (status >= 400 && status < 500) return 'status-client-error';
  if (status >= 500) return 'status-server-error';
  return 'status-info';
}

function truncateUrl(url) {
  return url.length > 50 ? url.substring(0, 47) + '...' : url;
}

function updateStats(stats) {
  if (!stats) return;
  
  document.getElementById('stat-total').textContent = stats.total || 0;
  
  // Update status counts
  document.getElementById('stat-success').textContent = stats.byStatus?.['2xx'] || 0;
  document.getElementById('stat-client-errors').textContent = stats.byStatus?.['4xx'] || 0;
  document.getElementById('stat-server-errors').textContent = stats.byStatus?.['5xx'] || 0;
  
  // Update average response time
  document.getElementById('stat-avg-time').textContent = 
    stats.avgResponseTime ? Math.round(stats.avgResponseTime) + 'ms' : '0ms';
  
  // Update recent errors
  const errorsContainer = document.getElementById('recent-errors-list');
  if (stats.recentErrors && stats.recentErrors.length > 0) {
    errorsContainer.innerHTML = stats.recentErrors.slice(0, 5).map(error => 
      `<p class="error-item">${error.method} ${error.url} - ${error.status}</p>`
    ).join('');
  } else {
    errorsContainer.innerHTML = '<p>No recent errors</p>';
  }
}

function updateChart(logs) {
  if (!chart || !logs) return;
  
  // Group logs by time buckets (every 5 minutes)
  const buckets = {};
  const now = new Date();
  
  logs.forEach(log => {
    const logTime = new Date(log.timestamp);
    const bucketKey = Math.floor(logTime.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000);
    buckets[bucketKey] = (buckets[bucketKey] || 0) + 1;
  });
  
  // Convert to chart data
  const sortedBuckets = Object.keys(buckets).sort();
  const labels = sortedBuckets.map(bucket => 
    new Date(parseInt(bucket)).toLocaleTimeString()
  );
  const data = sortedBuckets.map(bucket => buckets[bucket]);
  
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

function toggleAutoUpdate() {
  const button = document.getElementById('auto-update');
  
  if (isAutoUpdate) {
    clearInterval(autoUpdateInterval);
    isAutoUpdate = false;
    button.classList.remove('active');
  } else {
    autoUpdateInterval = setInterval(loadDashboard, AUTO_INTERVAL_MS);
    isAutoUpdate = true;
    button.classList.add('active');
  }
}

function toggleStats() {
  const statsSection = document.getElementById('stats-section');
  const button = document.getElementById('stats');
  
  if (statsSection.style.display === 'none') {
    statsSection.style.display = 'block';
    button.classList.add('active');
  } else {
    statsSection.style.display = 'none';
    button.classList.remove('active');
  }
}

async function clearLogs() {
  if (!confirm('¿Estás seguro de que quieres limpiar todos los logs?')) {
    return;
  }
  
  try {
    const response = await fetch(CLEAR_ENDPOINT, { method: 'DELETE' });
    const result = await response.json();
    
    if (result.success) {
      showSuccess('Logs limpiados exitosamente');
      loadDashboard();
    } else {
      throw new Error(result.error || 'Failed to clear logs');
    }
  } catch (error) {
    console.error('Error clearing logs:', error);
    showError('Error limpiando logs: ' + error.message);
  }
}

async function checkHealth() {
  try {
    const response = await fetch(HEALTH_ENDPOINT);
    const result = await response.json();
    
    if (result.success) {
      showSuccess('Health check OK: ' + result.data.status);
    } else {
      showError('Health check failed');
    }
  } catch (error) {
    console.error('Health check error:', error);
    showError('Health check error: ' + error.message);
  }
}

async function testConnection() {
  try {
    showLoading();
    const response = await fetch(HEALTH_ENDPOINT);
    
    if (response.ok) {
      showSuccess('Conexión OK');
      updateBackendStatus(true);
    } else {
      throw new Error('Connection failed');
    }
  } catch (error) {
    showError('Error de conexión: ' + error.message);
    updateBackendStatus(false);
  } finally {
    hideLoading();
  }
}

async function applyFilters() {
  const method = document.getElementById('method-filter').value;
  const url = document.getElementById('url-filter').value;
  const status = document.getElementById('status-filter').value;
  const source = document.getElementById('source-filter').value;
  
  const params = new URLSearchParams();
  if (method) params.append('method', method);
  if (url) params.append('url', url);
  if (status) params.append('status', status);
  if (source) params.append('source', source);
  
  try {
    const response = await fetch(`${LOGS_ENDPOINT}?${params}`);
    const result = await response.json();
    
    if (result.success) {
      updateLogsTable(result.data);
    } else {
      throw new Error(result.error || 'Failed to apply filters');
    }
  } catch (error) {
    console.error('Error applying filters:', error);
    showError('Error aplicando filtros: ' + error.message);
  }
}

function showLogDetails(logId) {
  const log = currentLogs.find(l => l.id === logId);
  if (!log) return;
  
  document.getElementById('rd-modal-title').textContent = 
    `${log.method} ${log.url}`;
  
  document.getElementById('rd-meta-text').textContent = 
    `${log.status} - ${log.responseTime}ms - ${new Date(log.timestamp).toLocaleString()}`;
  
  document.getElementById('rd-request-headers').textContent = 
    JSON.stringify(log.requestHeaders || {}, null, 2);
  
  document.getElementById('rd-request-body').textContent = 
    JSON.stringify(log.requestBody || 'No body', null, 2);
  
  document.getElementById('rd-response-headers').textContent = 
    JSON.stringify(log.responseHeaders || {}, null, 2);
  
  document.getElementById('rd-response-body').textContent = 
    JSON.stringify(log.responseBody || 'No body', null, 2);
  
  document.getElementById('request-modal').setAttribute('aria-hidden', 'false');
}

function closeModal() {
  document.getElementById('request-modal').setAttribute('aria-hidden', 'true');
}

function updateBackendStatus(isOnline) {
  const element = backendStatusElement;
  if (isOnline) {
    element.textContent = 'Backend: Conectado';
    element.className = 'status-badge online';
  } else {
    element.textContent = 'Backend: Desconectado';
    element.className = 'status-badge offline';
  }
}

function updateTotalLogs(count) {
  totalLogsElement.textContent = `Logs: ${count}`;
}

function updateLastRefresh() {
  lastUpdateElement.textContent = 
    `Última actualización: ${new Date().toLocaleTimeString()}`;
}

// Utility functions
function showLoading() {
  // Implementation depends on your UI framework
  console.log('Loading...');
}

function hideLoading() {
  console.log('Loading complete');
}

function showSuccess(message) {
  console.log('Success:', message);
  // You can implement toast notifications here
}

function showError(message) {
  console.error('Error:', message);
  // You can implement toast notifications here
}
