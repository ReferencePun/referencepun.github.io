/**
 * Landscapes page JavaScript
 * Handles category selection and gallery display
 */

// Landscape image categories and data
const landscapeCategories = {
    'mountains': [
        {
            src: 'images/landscapes/mountains/mountain1.jpg',
            alt: 'Mountain Landscape 1',
            caption: 'Alpine Sunrise'
        },
        {
            src: 'images/landscapes/mountains/mountain2.jpg',
            alt: 'Mountain Landscape 2',
            caption: 'Misty Peaks'
        },
        {
            src: 'images/landscapes/mountains/mountain3.jpg',
            alt: 'Mountain Landscape 3',
            caption: 'Mountain Valley'
        },
        {
            src: 'images/landscapes/mountains/mountain4.jpg',
            alt: 'Mountain Landscape 4',
            caption: 'Snow-capped Range'
        }
    ],
    'water': [
        {
            src: 'images/landscapes/water/water1.jpg',
            alt: 'Water Landscape 1',
            caption: 'Calm Lake'
        },
        {
            src: 'images/landscapes/water/water2.jpg',
            alt: 'Water Landscape 2',
            caption: 'Ocean Sunset'
        },
        {
            src: 'images/landscapes/water/water3.jpg',
            alt: 'Water Landscape 3',
            caption: 'Waterfall'
        },
        {
            src: 'images/landscapes/water/water4.jpg',
            alt: 'Water Landscape 4',
            caption: 'River Flow'
        }
    ],
    'forest': [
        {
            src: 'images/landscapes/forest/forest1.jpg',
            alt: 'Forest Landscape 1',
            caption: 'Ancient Woods'
        },
        {
            src: 'images/landscapes/forest/forest2.jpg',
            alt: 'Forest Landscape 2',
            caption: 'Misty Forest'
        },
        {
            src: 'images/landscapes/forest/forest3.jpg',
            alt: 'Forest Landscape 3',
            caption: 'Forest Path'
        },
        {
            src: 'images/landscapes/forest/forest4.jpg',
            alt: 'Forest Landscape 4',
            caption: 'Sunlight Through Trees'
        }
    ],
    'desert': [
        {
            src: 'images/landscapes/desert/desert1.jpg',
            alt: 'Desert Landscape 1',
            caption: 'Sand Dunes'
        },
        {
            src: 'images/landscapes/desert/desert2.jpg',
            alt: 'Desert Landscape 2',
            caption: 'Desert Sunset'
        },
        {
            src: 'images/landscapes/desert/desert3.jpg',
            alt: 'Desert Landscape 3',
            caption: 'Rock Formations'
        },
        {
            src: 'images/landscapes/desert/desert4.jpg',
            alt: 'Desert Landscape 4',
            caption: 'Desert Plants'
        }
    ]
};

// Track current category and lightbox state
let currentCategory = null;
let currentLightboxIndex = 0;
let currentGalleryImages = [];

document.addEventListener('DOMContentLoaded', function() {
    // Set up category link clicks
    initCategoryLinks();
    
    // Set up lightbox
    initLightbox();
});

/**
 * Initialize category link click events
 */
function initCategoryLinks() {
    const categoryLinks = document.querySelectorAll('.category-link');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const category = this.dataset.category;
            if (category && landscapeCategories[category]) {
                showGallery(category);
            }
        });
    });
}

/**
 * Shows the gallery for the selected category
 * @param {string} category - Category name
 */
function showGallery(category) {
    // Update current category
    currentCategory = category;
    
    // Update current gallery images
    currentGalleryImages = landscapeCategories[category];
    
    // Get gallery container
    const galleryContainer = document.getElementById('landscape-gallery');
    
    // Clear existing gallery
    galleryContainer.innerHTML = '';
    
    // Add images to gallery
    currentGalleryImages.forEach((image, index) => {
        const galleryItem = createGalleryItem(image, index);
        galleryContainer.appendChild(galleryItem);
    });
    
    // Scroll to gallery
    galleryContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Creates a gallery item element
 * @param {Object} image - Image data
 * @param {number} index - Image index for lightbox
 * @returns {HTMLElement} - Gallery item element
 */
function createGalleryItem(image, index) {
    // Create gallery item container
    const item = document.createElement('div');
    item.className = 'portfolio-item';
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
    
    return item;
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
        if (!lightbox.classList.contains('active')) return;
        
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
    
    if (!lightbox || !lightboxImg || !lightboxCaption || !currentGalleryImages.length) return;
    
    // Set current index
    currentLightboxIndex = index;
    
    // Get image data
    const image = currentGalleryImages[index];
    
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
    if (!currentGalleryImages.length) return;
    
    // Calculate new index
    let newIndex;
    
    if (direction === 'prev') {
        newIndex = (currentLightboxIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    } else {
        newIndex = (currentLightboxIndex + 1) % currentGalleryImages.length;
    }
    
    // Open lightbox with new index
    openLightbox(newIndex);
}