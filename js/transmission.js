/**
 * Transmission Magazine functionality
 * Handles magazine viewing with FlipHTML5 embeds
 */

document.addEventListener('DOMContentLoaded', function() {
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
});

/**
 * Opens a magazine in a modal with the specified embed URL
 * @param {string} embedUrl - The source URL for the embed iframe
 */
function openMagazine(embedUrl) {
    const modal = document.getElementById('magazine-modal');
    const embedContainer = document.getElementById('embed-container');
    
    if (!modal || !embedContainer) return;
    
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
    const modal = document.getElementById('magazine-modal');
    const embedContainer = document.getElementById('embed-container');
    
    if (!modal) return;
    
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