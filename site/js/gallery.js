/* ============================================
   MRÓWKI COLORING — Gallery & Lightbox
   ============================================ */

class GalleryController {
  constructor() {
    this.lightbox = null;
    this.lightboxImg = null;
    this.currentFilter = 'all';
    this.items = [];
    this.currentIndex = 0;
  }

  init() {
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImg = document.getElementById('lightbox-img');
    if (!this.lightbox) return;

    this.bindEvents();
    this.bindFilters();
  }

  refresh() {
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImg = document.getElementById('lightbox-img');
    if (!this.lightbox) return;

    this.items = Array.from(document.querySelectorAll('.gallery-item'));
    this.bindEvents();
    this.bindFilters();
  }

  bindEvents() {
    this.items = Array.from(document.querySelectorAll('.gallery-item'));

    this.items.forEach((item, index) => {
      item.addEventListener('click', () => {
        this.open(index);
      });
    });

    // Close lightbox
    const closeBtn = this.lightbox?.querySelector('.lightbox-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    this.lightbox?.addEventListener('click', (e) => {
      if (e.target === this.lightbox) this.close();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox?.classList.contains('active')) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }

  bindFilters() {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        this.filterGallery(filter);
      });
    });
  }

  filterGallery(filter) {
    this.currentFilter = filter;
    const items = document.querySelectorAll('.gallery-item');
    
    items.forEach(item => {
      const category = item.dataset.category;
      if (filter === 'all' || category === filter) {
        item.style.display = '';
        item.style.animation = 'page-enter 0.5s ease forwards';
      } else {
        item.style.display = 'none';
      }
    });
  }

  open(index) {
    const visibleItems = this.items.filter(item => item.style.display !== 'none');
    this.currentIndex = index;
    const img = visibleItems[index]?.querySelector('img');
    if (!img || !this.lightboxImg) return;
    
    this.lightboxImg.src = img.src;
    this.lightboxImg.alt = img.alt;
    this.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.lightbox) return;
    this.lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  prev() {
    const visibleItems = this.items.filter(item => item.style.display !== 'none');
    this.currentIndex = (this.currentIndex - 1 + visibleItems.length) % visibleItems.length;
    const img = visibleItems[this.currentIndex]?.querySelector('img');
    if (img && this.lightboxImg) {
      this.lightboxImg.src = img.src;
    }
  }

  next() {
    const visibleItems = this.items.filter(item => item.style.display !== 'none');
    this.currentIndex = (this.currentIndex + 1) % visibleItems.length;
    const img = visibleItems[this.currentIndex]?.querySelector('img');
    if (img && this.lightboxImg) {
      this.lightboxImg.src = img.src;
    }
  }
}

window.GalleryController = GalleryController;
