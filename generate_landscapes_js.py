import os
import json

def create_landscapes_js():
    # Base directory for landscapes
    base_dir = 'images/landscapes'
    
    # Categories to include
    categories = ['old', 'flowers', 'new']
    
    # Dictionary to hold all image data
    landscape_categories = {}
    
    # Loop through each category
    for category in categories:
        category_path = os.path.join(base_dir, category)
        
        # Skip if directory doesn't exist
        if not os.path.exists(category_path):
            print(f"Warning: Directory {category_path} not found. Creating empty category.")
            landscape_categories[category] = []
            continue
        
        # List all image files in the directory
        image_files = [f for f in os.listdir(category_path) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')) 
                      and not f.startswith('.')]
        
        # Sort files to ensure consistent order
        image_files.sort()
        
        # Create image data for each file
        category_images = []
        for i, filename in enumerate(image_files):
            # Skip thumbnail.jpg for use as category thumbnail
            if filename == 'thumbnail.jpg':
                continue
                
            image_data = {
                'src': f'images/landscapes/{category}/{filename}',
                'alt': f'{category.capitalize()} Landscape {i+1}',
                'caption': f'{category.capitalize()} Landscape'
            }
            category_images.append(image_data)
        
        # Add images to category
        landscape_categories[category] = category_images
    
    # Create JavaScript code
    js_code = """/**
 * Landscapes page JavaScript
 * Handles category selection and gallery display
 * Auto-generated from actual image files
 */

// Landscape image categories and data
const landscapeCategories = {
"""
    
    # Add each category of images
    for i, (category, images) in enumerate(landscape_categories.items()):
        js_code += f"    '{category}': [\n"
        
        # Add each image in the category
        for j, image in enumerate(images):
            js_code += f"        {{\n"
            js_code += f"            src: '{image['src']}',\n"
            js_code += f"            alt: '{image['alt']}',\n"
            js_code += f"            caption: '{image['caption']}'\n"
            js_code += f"        }}"
            
            # Add comma if not the last image
            if j < len(images) - 1:
                js_code += ","
                
            js_code += "\n"
        
        js_code += "    ]"
        
        # Add comma if not the last category
        if i < len(landscape_categories) - 1:
            js_code += ","
            
        js_code += "\n"
    
    # Close the categories object
    js_code += "};\n\n"
    
    # Add the rest of the landscapes.js file's content
    js_code += """
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
"""
    
    # Write the JavaScript file
    with open('js/landscapes.js', 'w') as f:
        f.write(js_code)
    
    print(f"Generated landscapes.js with {sum(len(images) for images in landscape_categories.values())} images across {len(categories)} categories.")

if __name__ == "__main__":
    # Check if directory structure exists
    if not os.path.exists('js'):
        os.makedirs('js')
        
    create_landscapes_js()