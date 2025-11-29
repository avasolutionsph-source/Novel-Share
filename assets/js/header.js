// ============================================
// Shared Header Component for NovelShare
// ============================================

const HeaderComponent = {
  // Get current page name for active state
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    return page || 'home';
  },

  // Check if nav item should be active
  isActive(navPage) {
    const current = this.getCurrentPage();

    // Write section pages
    const writePages = ['author-dashboard', 'add-novel', 'add-chapter', 'edit-novel', 'edit-chapter'];
    if (navPage === 'author-dashboard' && writePages.includes(current)) {
      return true;
    }

    return current === navPage;
  },

  // Generate header HTML
  render() {
    const currentPage = this.getCurrentPage();

    return `
      <header class="top-bar">
        <a class="logo" href="home.html" aria-label="NovelShare Home">
          <div class="logo-icon">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <path d="M32 12c-4.8-3.3-10.4-4.4-16-4.4a6.6 6.6 0 0 0-6.6 6.6v28.2c0 1.1.9 2 2 2H18c4.7 0 9.3 1.5 13.2 4.2 3.9-2.7 8.5-4.2 13.2-4.2h6.6c1.1 0 2-.9 2-2V14.2A6.6 6.6 0 0 0 48 7.6C42.4 7.6 36.8 8.7 32 12Zm0 6.9c4.3-2.6 9.2-3.9 14.2-3.9 1.1 0 2 .9 2 2v24.1h-4.6c-4.5 0-8.9 1.1-12.8 3.2v-25.4Zm-4 25.4c-3.9-2.1-8.3-3.2-12.8-3.2H10.6V17c0-1.1.9-2 2-2 5 0 9.9 1.3 14.2 3.9v25.4Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-name">NovelShare</span>
            <span class="logo-tagline">READ • WRITE • SHARE</span>
          </div>
        </a>

        <nav class="nav-pills" aria-label="Main navigation">
          <a class="pill${this.isActive('library') ? ' active' : ''}" href="library.html">
            <span class="pill-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/>
              </svg>
            </span>
            Library
          </a>
          <a class="pill${this.isActive('browse') ? ' active' : ''}" href="browse.html">
            <span class="pill-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            Browse
          </a>
          <a class="pill${this.isActive('search') ? ' active' : ''}" href="search.html">
            <span class="pill-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            Search
          </a>
          <a class="pill${this.isActive('author-dashboard') ? ' active' : ''}" href="author-dashboard.html">
            <span class="pill-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
            </span>
            Write
          </a>
        </nav>

        <div class="profile-actions">
          <div class="notification-wrapper">
            <button class="bell-btn" id="headerNotificationBtn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span class="notification-badge" id="headerNotifBadge" style="display: none;">0</span>
            </button>
            <div class="notification-dropdown" id="headerNotificationDropdown">
              <div class="notification-header">
                <h4>Notifications</h4>
                <button id="headerMarkAllRead">Mark all read</button>
              </div>
              <div class="notification-list" id="headerNotificationList">
                <div class="notification-empty">No notifications</div>
              </div>
            </div>
          </div>

          <div class="profile-wrapper">
            <a href="profile.html" class="profile" id="headerProfileBtn">
              <div class="avatar" id="headerAvatar">U</div>
              <span class="username" id="headerUsername">user</span>
            </a>
            <div class="profile-dropdown" id="headerProfileDropdown">
              <div class="profile-dropdown-header">
                <div class="avatar-lg" id="headerAvatarLg">U</div>
                <div class="name" id="headerName">User</div>
                <div class="email" id="headerEmail">user@example.com</div>
              </div>
              <div class="profile-dropdown-menu">
                <a href="profile.html">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
                  </svg>
                  My Profile
                </a>
                <a href="author-dashboard.html">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  My Works
                </a>
                <a href="#" id="headerLogoutBtn" class="logout">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                  </svg>
                  Log Out
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
    `;
  },

  // Initialize header functionality
  init() {
    // Initialize dropdowns
    this.initDropdowns();

    // Update user info if logged in
    this.updateUserInfo();

    // Setup logout handler
    this.setupLogout();
  },

  // Initialize dropdown behavior
  initDropdowns() {
    const notifBtn = document.getElementById('headerNotificationBtn');
    const notifDropdown = document.getElementById('headerNotificationDropdown');
    const profileBtn = document.getElementById('headerProfileBtn');
    const profileDropdown = document.getElementById('headerProfileDropdown');

    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
        if (profileDropdown) profileDropdown.classList.remove('show');
      });
    }

    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
        if (notifDropdown) notifDropdown.classList.remove('show');
      });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn?.contains(e.target)) {
        notifDropdown.classList.remove('show');
      }
      if (profileDropdown && !profileDropdown.contains(e.target) && !profileBtn?.contains(e.target)) {
        profileDropdown.classList.remove('show');
      }
    });

    // Mark all read button
    const markAllBtn = document.getElementById('headerMarkAllRead');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        const badge = document.getElementById('headerNotifBadge');
        if (badge) {
          badge.style.display = 'none';
          badge.textContent = '0';
        }
        const items = document.querySelectorAll('.notification-item.unread');
        items.forEach(item => item.classList.remove('unread'));
      });
    }
  },

  // Update user info from auth state
  async updateUserInfo() {
    try {
      if (typeof SupabaseAuth !== 'undefined') {
        const user = await SupabaseAuth.getCurrentUser();
        if (user) {
          const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
          const initial = username.charAt(0).toUpperCase();

          const avatarEl = document.getElementById('headerAvatar');
          const avatarLgEl = document.getElementById('headerAvatarLg');
          const usernameEl = document.getElementById('headerUsername');
          const nameEl = document.getElementById('headerName');
          const emailEl = document.getElementById('headerEmail');

          if (avatarEl) avatarEl.textContent = initial;
          if (avatarLgEl) avatarLgEl.textContent = initial;
          if (usernameEl) usernameEl.textContent = username;
          if (nameEl) nameEl.textContent = username;
          if (emailEl) emailEl.textContent = user.email || '';
        }
      }
    } catch (error) {
      console.log('Header: User not logged in or error fetching user');
    }
  },

  // Setup logout handler
  setupLogout() {
    const logoutBtn = document.getElementById('headerLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          if (typeof SupabaseAuth !== 'undefined') {
            await SupabaseAuth.signOut();
          }
          localStorage.removeItem('novelshare_user');
          window.location.href = 'login.html';
        } catch (error) {
          console.error('Logout error:', error);
          window.location.href = 'login.html';
        }
      });
    }
  },

  // Mount header to container
  mount(containerId = 'app-header') {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = this.render();
      this.init();
    } else {
      // If no container, insert at beginning of .page
      const page = document.querySelector('.page');
      if (page) {
        page.insertAdjacentHTML('afterbegin', this.render());
        this.init();
      }
    }
  }
};

// Auto-mount if container exists
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app-header');
  if (container) {
    HeaderComponent.mount('app-header');
  }
});

// Export for use
window.HeaderComponent = HeaderComponent;
