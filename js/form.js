/* ============================================
   MRÓWKI COLORING — Contact Form Handler
   ============================================ */

class FormController {
  constructor() {
    this.form = null;
  }

  init() {
    this.form = document.getElementById('contact-form');
    if (!this.form) return;
    this.bindEvents();
  }

  refresh() {
    this.form = document.getElementById('contact-form');
    if (!this.form) return;
    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Float label effect
    this.form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });
      input.addEventListener('blur', () => {
        if (!input.value) {
          input.parentElement.classList.remove('focused');
        }
      });
    });
  }

  handleSubmit() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());

    // Validate
    if (!data.name || !data.phone) {
      this.showMessage('Proszę wypełnić wymagane pola', 'error');
      return;
    }

    // Show success (in production, send to server)
    this.showMessage('Dziękujemy! Skontaktujemy się wkrótce.', 'success');
    this.form.reset();

    // Log for CRM integration
    console.log('Form submission:', data);
  }

  showMessage(text, type = 'success') {
    // Remove existing message
    const existing = this.form.querySelector('.form-message');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = `form-message form-message--${type}`;
    msg.textContent = text;
    msg.style.cssText = `
      padding: 1rem 1.5rem;
      border-radius: 12px;
      margin-top: 1rem;
      font-size: 0.9rem;
      font-weight: 500;
      animation: page-enter 0.3s ease forwards;
      ${type === 'success' 
        ? 'background: rgba(46, 160, 67, 0.1); border: 1px solid rgba(46, 160, 67, 0.3); color: #2ea043;'
        : 'background: rgba(248, 81, 73, 0.1); border: 1px solid rgba(248, 81, 73, 0.3); color: #f85149;'
      }
    `;

    this.form.appendChild(msg);

    setTimeout(() => {
      msg.style.transition = 'opacity 0.3s ease';
      msg.style.opacity = '0';
      setTimeout(() => msg.remove(), 300);
    }, 4000);
  }
}

window.FormController = FormController;
