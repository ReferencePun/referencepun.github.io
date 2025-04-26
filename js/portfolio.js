/**
 * Portfolio page JavaScript
 * Handles image loading, grid layout, and lightbox functionality
 */

// Portfolio images data - replace with your actual images
const portfolioImages = [
    {
        src: 'images/portfolio/FH200006_2l1ahp2.jpg',
        alt: 'Portrait Test',
        caption: 'Portrait Study',
        type: 'vertical'
    },
    {
        src: 'images/portfolio/F1060142.jpg',
        alt: 'Portrait 2',
        caption: 'Portrait Study',
        type: 'vertical'
    },
    {
        src: 'images/portfolio/F1010033l.jpg',
        alt: 'Portrait 3',
        caption: 'Portrait Study',
        type: 'horizontal'
    },
    {
        src: 'images/portfolio/000078000020lfix.jpg',
        alt: 'Portrait 4',
        caption: 'Portrait Study',
        type: 'square'
    },
    {
        src: 'images/portfolio/F1030015_2B2.jpg',
        alt: 'Portrait 5',
        caption: 'Portrait Study',
        type: 'vertical'
    },
    {
        src: 'images/portfolio/F1030027.jpg',
        alt: 'Portrait 6',
        caption: 'Portrait Study',
        type: 'horizontal'
    },
    {
        src: 'images/portfolio/F1040012fix1.jpg',
        alt: 'Portrait 7',
        caption: 'Portrait Study',
        type: 'square'
    },
    {
        src: 'images/portfolio/F1040208.jpg',
        alt: 'Portrait 8',
        caption: 'Portrait Study',
        type: 'horizontal'
    },
    {
        src: 'images/portfolio/FH100009l0lhp2.jpg',
        alt: 'Portrait 9',
        caption: 'Portrait Study',
        type: 'vertical'
    }
    // Add more images as needed
];

// Track lightbox state
let currentLightboxIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    
    if (portfolioGrid) {
        // Load portfolio images
        loadPortfolioImages();
        
        // Setup lightbox
        initLightbox();
    }
    
    // Setup mobile menu toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const nav = document.querySelector('nav');
    
    if (mobileMenu && nav) {
        mobileMenu.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }
    
    // Set current year in footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});

/**
 * Loads portfolio images into the grid
 */
function loadPortfolioImages() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    
    // Clear any existing items
    portfolioGrid.innerHTML = '';
    
    // Add images to the grid
    portfolioImages.forEach((image, index) => {
        const imageElement = createImageElement(image, index);
        portfolioGrid.appendChild(imageElement);
    });
    
    // Apply masonry layout
    applyMasonryLayout();
}

/**
 * Creates a portfolio item element
 * @param {Object} image - Image data
 * @param {number} index - Image index for lightbox
 * @returns {HTMLElement} - Portfolio item element
 */
function createImageElement(image, index) {
    // Create portfolio item container
    const item = document.createElement('div');
    item.className = `portfolio-item ${image.type}`;
    item.dataset.index = index;
    
    // Create image element
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.alt;
    
    // Create caption element
    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.textContent = image.caption;
    
    // Add click event for lightbox
    item.addEventListener('click', function() {
        openLightbox(index);
    });
    
    // Append elements to item
    item.appendChild(img);
    item.appendChild(caption);
    
    // When image loads, update the masonry layout
    img.onload = function() {
        applyMasonryLayout();
    };
    
    return item;
}

/**
 * Applies the masonry layout to the portfolio grid
 */
function applyMasonryLayout() {
    const grid = document.getElementById('portfolio-grid');
    const items = document.querySelectorAll('.portfolio-item');
    
    if (!grid || items.length === 0) return;
    
    // Reset any previous styles
    items.forEach(item => {
        item.style.gridRowEnd = '';
    });
    
    // Apply the masonry layout
    items.forEach(item => {
        const height = item.getBoundingClientRect().height;
        const rowSpan = Math.ceil(height / 10); // 10px is our grid-auto-rows value
        item.style.gridRowEnd = `span ${rowSpan}`;
    });
}

/**
 * Initializes the lightbox functionality
 */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    // Close lightbox when clicked outside of content
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // Close button click
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }
    
    // Previous button click
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navigateLightbox('prev');
        });
    }
    
    // Next button click
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navigateLightbox('next');
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox('prev');
        } else if (e.key === 'ArrowRight') {
            navigateLightbox('next');
        }
    });
}

/**
 * Opens the lightbox with the specified image
 * @param {number} index - Index of the image to display
 */
function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    if (!lightbox || !lightboxImg || !lightboxCaption) return;
    
    // Set current index
    currentLightboxIndex = index;
    
    // Get image data
    const image = portfolioImages[index];
    
    // Set image and caption
    lightboxImg.src = image.src;
    lightboxImg.alt = image.alt;
    lightboxCaption.textContent = image.caption;
    
    // Show lightbox
    lightbox.classList.add('active');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

/**
 * Closes the lightbox
 */
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    
    if (!lightbox) return;
    
    // Hide lightbox
    lightbox.classList.remove('active');
    
    // Allow body scrolling
    document.body.style.overflow = '';
}

/**
 * Navigates to the previous or next image in the lightbox
 * @param {string} direction - Navigation direction ('prev' or 'next')
 */
function navigateLightbox(direction) {
    // Calculate new index
    let newIndex;
    
    if (direction === 'prev') {
        newIndex = (currentLightboxIndex - 1 + portfolioImages.length) % portfolioImages.length;
    } else {
        newIndex = (currentLightboxIndex + 1) % portfolioImages.length;
    }
    
    // Open lightbox with new index
    openLightbox(newIndex);
}

// Handle window resize
window.addEventListener('resize', applyMasonryLayout);

// Apply masonry layout when all images are loaded
window.addEventListener('load', applyMasonryLayout);