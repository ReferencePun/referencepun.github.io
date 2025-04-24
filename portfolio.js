/**
 * Portfolio page JavaScript with Netlify CMS integration
 * Loads portfolio images from CMS-generated JSON
 */

// Track lightbox state
let currentLightboxIndex = 0;
let portfolioImages = [];
let currentPage = 1;
const imagesPerPage = 9;

document.addEventListener('DOMContentLoaded', function() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    
    if (portfolioGrid) {
        // Fetch portfolio data from CMS-generated JSON
        fetchPortfolioImages()
            .then(images => {
                portfolioImages = images;
                renderPortfolioGrid();
                
                // Set up infinite scroll
                window.addEventListener('scroll', handleInfiniteScroll);
                
                // Setup lightbox
                initLightbox();
            })
            .catch(error => {
                console.error('Error loading portfolio images:', error);
                portfolioGrid.innerHTML = '<p class="error-message">Could not load images. Please try again later.</p>';
            });
    }
});

/**
 * Fetches portfolio images from CMS-generated JSON
 * @returns {Promise<Array>} Array of portfolio image objects
 */
async function fetchPortfolioImages() {
    try {
        // In production, this would be a real API endpoint or JSON file
        // For now, we'll use a simulated response
        
        // This would be replaced by actual fetch:
        // const response = await fetch('/api/portfolio.json');
        // const data = await response.json();
        
        // Simulated data during development
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        title: 'Portrait Study 1',
                        image: '/images/uploads/portrait1.jpg',
                        caption: 'Portrait Study',
                        type: 'vertical',
                        date: '2023-04-15'
                    },
                    {
                        title: 'Portrait Study 2',
                        image: '/images/uploads/portrait2.jpg',
                        caption: 'Portrait Study',
                        type: 'vertical',
                        date: '2023-05-20'
                    },
                    {
                        title: 'Portrait Study 3',
                        image: '/images/uploads/portrait3.jpg',
                        caption: 'Portrait Study',
                        type: 'horizontal',
                        date: '2023-06-08'
                    },
                    {
                        title: 'Portrait Study 4',
                        image: '/images/uploads/portrait4.jpg',
                        caption: 'Portrait Study',
                        type: 'square',
                        date: '2023-07-12'
                    },
                    // Add more images to simulate a large portfolio
                    // These would be dynamically generated from the CMS in production
                ]);
            }, 300);
        });
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        return [];
    }
}

/**
 * Renders the portfolio grid with images
 */
function renderPortfolioGrid() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    
    if (!portfolioGrid || !portfolioImages.length) return;
    
    // Calculate which images to show based on current page
    const startIndex = 0;
    const endIndex = currentPage * imagesPerPage;
    const imagesToShow = portfolioImages.slice(startIndex, endIndex);
    
    // Clear existing grid
    portfolioGrid.innerHTML = '';
    
    // Add images to the grid
    imagesToShow.forEach((image, index) => {
        const imageElement = createImageElement(image, index);
        portfolioGrid.appendChild(imageElement);
    });
}

/**
 * Creates a portfolio item element
 * @param {Object} image - Image data from CMS
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
    img.src = image.image; // Use the image path from CMS
    img.alt = image.title || '';
    
    // Create caption element
    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.textContent = image.caption || image.title || '';
    
    // Add click event for lightbox
    item.addEventListener('click', function() {
        openLightbox(index);
    });
    
    // Append elements to item
    item.appendChild(img);
    item.appendChild(caption);
    
    // Detect actual image orientation once loaded if not specified
    img.onload = function() {
        if (!image.type) {
            const orientation = this.naturalWidth > this.naturalHeight ? 'horizontal' : 
                              this.naturalWidth < this.naturalHeight ? 'vertical' : 'square';
            
            item.classList.remove('horizontal', 'vertical', 'square');
            item.classList.add(orientation);
        }
    };
    
    return item;
}

/**
 * Handles infinite scroll detection
 */
function handleInfiniteScroll() {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Load more when user scrolls to bottom of page
    if (scrollY + viewportHeight >= documentHeight - 300) {
        // Only load more if we have more images
        if (currentPage * imagesPerPage < portfolioImages.length) {
            currentPage++;
            renderPortfolioGrid();
        }
    }
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
        const lightbox = document.getElementById('lightbox');
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
    
    if (!lightbox || !lightboxImg || !lightboxCaption || !portfolioImages[index]) return;
    
    // Set current index
    currentLightboxIndex = index;
    
    // Get image data
    const image = portfolioImages[index];
    
    // Set image and caption
    lightboxImg.src = image.image;
    lightboxImg.alt = image.title || '';
    lightboxCaption.textContent = image.caption || image.title || '';
    
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