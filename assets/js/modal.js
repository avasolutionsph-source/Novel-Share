/* ============================================
   Modal Utility System for NovelShare
   ============================================ */

const ModalSystem = {
  // Modal types with default icons
  types: {
    success: {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>`,
      color: '#10b981'
    },
    error: {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>`,
      color: '#ef4444'
    },
    warning: {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>`,
      color: '#f59e0b'
    },
    info: {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>`,
      color: '#3b82f6'
    },
    confirm: {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>`,
      color: '#667eea'
    }
  },

  // Active modal reference
  activeModal: null,

  // Create modal HTML
  createModal(options) {
    const {
      type = 'info',
      title = 'Alert',
      message = '',
      confirmText = 'OK',
      cancelText = 'Cancel',
      showCancel = false,
      onConfirm = null,
      onCancel = null,
      customIcon = null
    } = options;

    const typeConfig = this.types[type] || this.types.info;
    const icon = customIcon || typeConfig.icon;
    const color = typeConfig.color;

    const modalHTML = `
      <div class="modal-overlay" id="dynamicModal">
        <div class="modal">
          <div class="modal-icon" style="background: ${color}15; color: ${color}">
            ${icon}
          </div>
          <h3 class="modal-title">${title}</h3>
          <p class="modal-message">${message}</p>
          <div class="modal-actions">
            ${showCancel ? `<button class="modal-cancel" id="modalCancelBtn">${cancelText}</button>` : ''}
            <button class="modal-confirm" id="modalConfirmBtn" style="background: ${color}">${confirmText}</button>
          </div>
        </div>
      </div>
    `;

    return { html: modalHTML, onConfirm, onCancel };
  },

  // Show modal
  show(options) {
    // Close any existing modal
    this.close();

    const { html, onConfirm, onCancel } = this.createModal(options);

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', html);

    const overlay = document.getElementById('dynamicModal');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');

    this.activeModal = overlay;

    // Add event listeners
    confirmBtn?.addEventListener('click', () => {
      if (onConfirm) onConfirm();
      this.close();
    });

    cancelBtn?.addEventListener('click', () => {
      if (onCancel) onCancel();
      this.close();
    });

    // Close on overlay click
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        if (onCancel) onCancel();
        this.close();
      }
    });

    // Close on Escape key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        if (onCancel) onCancel();
        this.close();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Animate in
    requestAnimationFrame(() => {
      overlay?.classList.add('show');
    });

    return this;
  },

  // Close modal
  close() {
    if (this.activeModal) {
      this.activeModal.classList.remove('show');
      setTimeout(() => {
        this.activeModal?.remove();
        this.activeModal = null;
      }, 200);
    }
    // Also remove any existing modals
    document.querySelectorAll('#dynamicModal').forEach(el => el.remove());
  },

  // Convenience methods
  success(title, message, onConfirm) {
    return this.show({
      type: 'success',
      title,
      message,
      confirmText: 'OK',
      onConfirm
    });
  },

  error(title, message, onConfirm) {
    return this.show({
      type: 'error',
      title,
      message,
      confirmText: 'OK',
      onConfirm
    });
  },

  warning(title, message, onConfirm) {
    return this.show({
      type: 'warning',
      title,
      message,
      confirmText: 'OK',
      onConfirm
    });
  },

  info(title, message, onConfirm) {
    return this.show({
      type: 'info',
      title,
      message,
      confirmText: 'OK',
      onConfirm
    });
  },

  confirm(title, message, onConfirm, onCancel) {
    return this.show({
      type: 'confirm',
      title,
      message,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm,
      onCancel
    });
  },

  // Delete confirmation
  confirmDelete(itemName, onConfirm, onCancel) {
    return this.show({
      type: 'error',
      title: 'Delete ' + itemName + '?',
      message: `Are you sure you want to delete this ${itemName.toLowerCase()}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm,
      onCancel
    });
  },

  // Unsaved changes confirmation
  confirmUnsavedChanges(onConfirm, onCancel) {
    return this.show({
      type: 'warning',
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.',
      confirmText: 'Leave',
      cancelText: 'Stay',
      showCancel: true,
      onConfirm,
      onCancel
    });
  }
};

// Add modal CSS if not already present
const modalStyles = `
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
  }

  .modal-overlay.show {
    opacity: 1;
    visibility: visible;
  }

  .modal {
    background: white;
    border-radius: 16px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    transform: scale(0.9);
    transition: transform 0.2s;
  }

  .modal-overlay.show .modal {
    transform: scale(1);
  }

  .modal-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .modal-icon svg {
    width: 32px;
    height: 32px;
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 12px;
  }

  .modal-message {
    font-size: 0.95rem;
    color: #6b7280;
    line-height: 1.5;
    margin: 0 0 24px;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .modal-cancel,
  .modal-confirm {
    padding: 12px 24px;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
  }

  .modal-cancel {
    background: #f3f4f6;
    color: #1a1a2e;
    border: none;
  }

  .modal-cancel:hover {
    background: #e5e7eb;
  }

  .modal-confirm {
    background: #667eea;
    color: white;
    border: none;
  }

  .modal-confirm:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }
`;

// Inject styles
if (!document.getElementById('modal-system-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'modal-system-styles';
  styleEl.textContent = modalStyles;
  document.head.appendChild(styleEl);
}

// Export for use
window.ModalSystem = ModalSystem;
