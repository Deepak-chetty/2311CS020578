// State Management
let state = {
  notifications: []
};

// DOM Elements
const refreshBtn = document.getElementById('refresh-btn');
const retryBtn = document.getElementById('retry-btn');

// UI States
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const emptyState = document.getElementById('empty-state');
const notificationsGrid = document.getElementById('notifications-grid');

// Helper: Format timestamp
function formatTimestamp(timestampStr) {
  if (!timestampStr) return '';
  try {
    const date = new Date(timestampStr.replace(' ', 'T'));
    if (isNaN(date.getTime())) return timestampStr;

    const options = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString(undefined, options);
  } catch (e) {
    return timestampStr;
  }
}

// Show/Hide States
function showState(stateName) {
  loadingState.classList.toggle('hidden', stateName !== 'loading');
  errorState.classList.toggle('hidden', stateName !== 'error');
  emptyState.classList.toggle('hidden', stateName !== 'empty');
  notificationsGrid.classList.toggle('hidden', stateName !== 'data');
}

// Fetch Notifications from Proxy API
async function fetchNotifications() {
  showState('loading');
  try {
    const response = await fetch('/api/notifications');
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    state.notifications = data.notifications || [];
    render();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    errorMessage.textContent = error.message || 'Something went wrong while connecting to the server.';
    showState('error');
  }
}

// Render the application
function render() {
  const notifications = [...state.notifications];

  // Sort by date newest first by default
  notifications.sort((a, b) => {
    const timeA = new Date((a.Timestamp || '').replace(' ', 'T')).getTime();
    const timeB = new Date((b.Timestamp || '').replace(' ', 'T')).getTime();
    return timeB - timeA;
  });

  if (notifications.length === 0) {
    showState('empty');
    return;
  }

  showState('data');
  notificationsGrid.innerHTML = '';

  notifications.forEach(notification => {
    const card = document.createElement('div');
    const typeClass = `type-${(notification.Type || 'default').toLowerCase()}`;
    card.className = `notification-card ${typeClass}`;
    const formattedTime = formatTimestamp(notification.Timestamp);

    card.innerHTML = `
      <div class="card-details">
        <div class="card-header-row">
          <span class="type-badge">${notification.Type || 'Notification'}</span>
          <span class="card-timestamp">${formattedTime}</span>
        </div>
        <div class="card-message">${notification.Message || ''}</div>
        <div class="card-footer-row">
          <span class="card-id">ID: ${notification.ID || 'N/A'}</span>
        </div>
      </div>
    `;
    
    notificationsGrid.appendChild(card);
  });
}

// Event Listeners Setup
function initEvents() {
  refreshBtn.addEventListener('click', () => {
    fetchNotifications();
  });

  retryBtn.addEventListener('click', () => {
    fetchNotifications();
  });
}

// Initialization on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  fetchNotifications();
});
