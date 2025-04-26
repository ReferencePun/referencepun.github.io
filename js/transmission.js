/**
 * Transmission Magazine functionality
 * Handles magazine viewing with FlipHTML5 embeds
 */

// Log to confirm script is loaded
console.log('Magazine JavaScript loaded successfully');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Set current year in footer if present
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Initialize click events for magazine covers
    initMagazineCovers();
});

/**
 * Initialize click events for magazine covers
 */
function initMagazineCovers() {
    console.log('Initializing magazine covers');
    
    // Get all magazine covers with onclick attribute
    const magazineCovers = document.querySelectorAll('.magazine-cover');
    console.log(`Found ${magazineCovers.length} magazine covers`);
    
    // Add event listeners to each cover
    magazineCovers.forEach(cover => {
        cover.addEventListener('click', function(event) {
            // Prevent the default action
            event.preventDefault();
            
            // Get the URL from the onclick attribute or data attribute
            const embedUrl = this.getAttribute('data-url') || this.onclick?.toString().match(/'(https:\/\/[^']+)'/)?.[1];
            
            if (embedUrl) {
                console.log(`Opening magazine: ${embedUrl}`);
                openMagazine(embedUrl);
            } else {
                console.error('No URL found for this magazine cover');
            }
        });
        
        // Remove the inline onclick to prevent double execution
        cover.removeAttribute('onclick');
    });
}

/**
 * Opens a magazine in a modal with the specified embed URL
 * @param {string} embedUrl - The source URL for the embed iframe
 */
function openMagazine(embedUrl) {
    console.log(`openMagazine called with URL: ${embedUrl}`);
    
    const modal = document.getElementById('magazine-modal');
    const embedContainer = document.getElementById('embed-container');
    
    if (!modal || !embedContainer) {
        console.error('Modal or embed container not found:', {
            modalExists: !!modal,
            containerExists: !!embedContainer
        });
        return;
    }
    
    console.log('Creating iframe content');
    
    // Create the iframe with a direct link option
    embedContainer.innerHTML = `
        <iframe 
            src="${embedUrl}" 
            seamless="seamless" 
            scrolling="no" 
            frameborder="0" 
            allowtransparency="true" 
            allowfullscreen="true"
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            id="magazine-iframe">
        </iframe>
        <div class="navigation-overlay" id="nav-overlay">
            <div class="nav-instructions">
                Use FlipHTML5 controls or <a href="${embedUrl}" target="_blank" style="color: blue; text-decoration: underline;">open in a new window</a>
            </div>
        </div>
    `;
    
    // Display the modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Add keyboard navigation for closing the modal
    window.addEventListener('keydown', handleKeyNavigation);
}

/**
 * Handle keyboard navigation
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyNavigation(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}

/**
 * Closes the magazine modal
 */
function closeModal() {
    console.log('Closing modal');
    
    const modal = document.getElementById('magazine-modal');
    const embedContainer = document.getElementById('embed-container');
    
    if (!modal) {
        console.error('Modal not found when trying to close');
        return;
    }
    
    // Hide the modal
    modal.style.display = 'none';
    
    // Clear the embed (stops any audio/video)
    if (embedContainer) {
        embedContainer.innerHTML = '';
    }
    
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
    
    // Remove event listener
    window.removeEventListener('keydown', handleKeyNavigation);
}

// Close modal when clicking outside content
window.onclick = function(event) {
    const modal = document.getElementById('magazine-modal');
    if (event.target == modal) {
        closeModal();
    }
};