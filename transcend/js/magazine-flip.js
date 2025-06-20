// magazine-flip.js - Complete updated version with exploration integration

let pageFlip = null;
let isOnLastPageFlag = false;

// Initialize enhanced mode flag
window.isEnhancedMode = false;

// Initialize the magazine when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeMagazine();
});

function initializeMagazine() {
    const flipbookElement = document.getElementById('flipbook');
    
    // Calculate dimensions based on viewport and maintain aspect ratio
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Magazine aspect ratio (2480 x 3508 = 0.707)
    const aspectRatio = 2480 / 3508;
    
    // Calculate book dimensions (single page)
    let bookHeight = Math.min(viewportHeight * 0.85, 800);
    let bookWidth = bookHeight * aspectRatio;
    
    // Check if width is too large for viewport
    if (bookWidth > viewportWidth * 0.45) {
        bookWidth = viewportWidth * 0.45;
        bookHeight = bookWidth / aspectRatio;
    }
    
    // Initialize StPageFlip with consistent soft animations
    pageFlip = new St.PageFlip(flipbookElement, {
        width: bookWidth,
        height: bookHeight,
        size: "fixed",
        
        // SOLUTION: Keep consistent soft animations throughout
        showCover: false, // Ensures consistent soft animations
        
        // Enable shadows for page visibility on white background
        drawShadow: true,
        maxShadowOpacity: 0.4, // Higher shadow intensity for white background
        
        flippingTime: 1000,
        usePortrait: true,
        startZIndex: 0,
        autoSize: false,
        
        // Start with cover
        startPage: 0,
        
        // Enable click forwarding for buttons/links
        clickEventForward: true,
        
        // Mobile support
        mobileScrollSupport: true,
        
        // Use mouse control
        useMouseEvents: true,
        swipeDistance: 50,
        
        // Disable page corner for cleaner look
        showPageCorners: false,
        disableFlipByClick: false
    });
    
    // Load pages
    pageFlip.loadFromHTML(document.querySelectorAll('.page'));
    
    // Event listeners
    pageFlip.on('flip', handlePageFlip);
    pageFlip.on('changeState', handleStateChange);
    
    // Set up the dissolution trigger after initialization
    pageFlip.on('init', (e) => {
        console.log('Book initialized', e);
        setupDissolutionTrigger();
        checkIfOnLastPage(); // Check initial state
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyPress);
    
    // Hide loader
    setTimeout(() => {
        document.getElementById('loader').classList.remove('active');
    }, 500);
}

// Handle page flip events
function handlePageFlip(event) {
    console.log('Page flipped to:', event.data);
    checkIfOnLastPage();
}

// Handle state changes
function handleStateChange(event) {
    console.log('Book state:', event.data);
    checkIfOnLastPage();
}

// Check if we're on the last page and update flag
function checkIfOnLastPage() {
    if (!pageFlip) return;
    
    const currentPageIndex = pageFlip.getCurrentPageIndex();
    const totalPages = pageFlip.getPageCount();
    
    console.log('Current page index:', currentPageIndex, 'Total pages:', totalPages);
    
    // In spread mode, we're on the last page if we're viewing the final spread
    const onLastPage = currentPageIndex >= totalPages - 2;
    
    if (onLastPage !== isOnLastPageFlag) {
        isOnLastPageFlag = onLastPage;
        console.log('Last page status changed:', isOnLastPageFlag);
        
        if (isOnLastPageFlag) {
            console.log('Now on last page - dissolution enabled');
        } else {
            console.log('Not on last page - dissolution disabled');
        }
    }
}

// Set up global click listener for dissolution
function setupDissolutionTrigger() {
    console.log('Setting up global dissolution trigger');
    
    // Add a global click listener to the entire flipbook
    const flipbookContainer = document.getElementById('flipbook');
    
    if (flipbookContainer) {
        flipbookContainer.addEventListener('click', function(event) {
            // CHECK: Don't trigger dissolution in enhanced mode
            if (window.isEnhancedMode) {
                console.log('🔒 Enhanced mode active - dissolution trigger disabled');
                return;
            }
            
            console.log('Flipbook clicked, last page flag:', isOnLastPageFlag);
            
            if (isOnLastPageFlag) {
                console.log('Click detected on last page - triggering dissolution');
                event.preventDefault();
                event.stopPropagation();
                triggerDissolution();
            }
        }, true); // Use capture phase to catch before StPageFlip
        
        console.log('Global click listener added to flipbook');
    }
    
    // Alternative: Add click listener to the body as a fallback
    document.body.addEventListener('click', function(event) {
        // CHECK: Don't trigger dissolution in enhanced mode
        if (window.isEnhancedMode) {
            return;
        }
        
        if (isOnLastPageFlag) {
            console.log('Body click detected on last page - triggering dissolution');
            event.preventDefault();
            event.stopPropagation();
            triggerDissolution();
        }
    });
}

// Keyboard navigation
function handleKeyPress(event) {
    if (!pageFlip) return;
    
    // Don't handle keyboard if exploration view is active
    if (window.ExplorationInterface && window.ExplorationInterface.isActive()) {
        return;
    }
    
    switch(event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            pageFlip.flipPrev();
            break;
        case 'ArrowRight':
            event.preventDefault();
            pageFlip.flipNext();
            break;
        case 'Enter':
        case ' ':
            // Trigger dissolution with spacebar or enter if on last page
            if (isOnLastPageFlag) {
                event.preventDefault();
                console.log('Keyboard dissolution trigger');
                triggerDissolution();
            }
            break;
        case 'd':
            // Debug key
            debugDissolution();
            break;
    }
}

// Trigger the dissolution effect
function triggerDissolution() {
    console.log('Triggering dissolution...');
    
    // Prevent dissolution in enhanced mode
    if (window.isEnhancedMode) {
        console.log('🔒 Cannot trigger dissolution - enhanced mode active');
        return;
    }
    
    // Prevent multiple triggers
    if (Dissolution && Dissolution.isAnimating) {
        console.log('Dissolution already in progress');
        return;
    }
    
    // Start dissolution animation
    if (typeof Dissolution !== 'undefined') {
        Dissolution.start();
    } else {
        console.error('Dissolution object not found');
        // Fallback - just transition to exploration
        setTimeout(() => {
            transitionToExploration();
        }, 1000);
    }
    
    // Add dissolving class to book
    const bookElement = document.querySelector('.stf__parent');
    if (bookElement) {
        bookElement.classList.add('dissolving');
    }
    
    // After dissolution completes, transition to exploration
    setTimeout(() => {
        transitionToExploration();
    }, 4000);
}

// Transition to exploration view
function transitionToExploration() {
    const magazineView = document.getElementById('magazine-view');
    const explorationView = document.getElementById('exploration-view');
    
    console.log('Transitioning to exploration view');
    
    // Fade out magazine
    magazineView.style.opacity = '0';
    
    setTimeout(() => {
        // Hide magazine view
        magazineView.classList.remove('active');
        magazineView.style.display = 'none';
        
        // Destroy page flip instance
        if (pageFlip) {
            pageFlip.destroy();
            pageFlip = null;
        }
        
        // Clean up dissolution
        if (typeof Dissolution !== 'undefined') {
            Dissolution.cleanup();
        }
        
        // Show exploration view
        explorationView.classList.add('active');
        explorationView.style.opacity = '0';
        explorationView.style.display = 'flex';
        
        // Initialize exploration interface
        if (window.ExplorationInterface && window.ExplorationInterface.initializeFromDissolution) {
            window.ExplorationInterface.initializeFromDissolution();
        }
        
        // Fade in exploration
        setTimeout(() => {
            explorationView.style.opacity = '1';
        }, 100);
    }, 1000);
}

// Enhanced return to magazine function
function returnToMagazine() {
    console.log('🔄 Returning to magazine from exploration...');
    
    const magazineView = document.getElementById('magazine-view');
    const explorationView = document.getElementById('exploration-view');
    
    if (!magazineView || !explorationView) {
        console.warn('Views not found for return transition');
        return;
    }
    
    // Reset enhanced mode flag
    window.isEnhancedMode = false;
    console.log('🔓 Enhanced mode reset - dissolution trigger re-enabled');
    
    // Fade out exploration
    explorationView.style.opacity = '0';
    
    setTimeout(() => {
        // Hide exploration view
        explorationView.classList.remove('active');
        explorationView.style.display = 'none';
        
        // Show magazine view
        magazineView.classList.add('active');
        magazineView.classList.remove('enhanced'); // Remove enhanced class
        magazineView.style.display = 'flex';
        magazineView.style.opacity = '0';
        
        // Reinitialize original magazine
        setTimeout(() => {
            initializeMagazine();
            magazineView.style.opacity = '1';
            console.log('📖 Original magazine reinitialized');
        }, 100);
    }, 1000);
}

// Handle window resize
window.addEventListener('resize', () => {
    if (pageFlip) {
        // Note: StPageFlip doesn't support dynamic resize
        // Would need to destroy and recreate the instance
        console.log('Window resized - may need to refresh page for proper sizing');
    }
});

// Debug function - call this in console to check state
function debugDissolution() {
    console.log('=== DISSOLUTION DEBUG ===');
    console.log('Current page index:', pageFlip ? pageFlip.getCurrentPageIndex() : 'No pageFlip');
    console.log('Total pages:', pageFlip ? pageFlip.getPageCount() : 'No pageFlip');
    console.log('Last page flag:', isOnLastPageFlag);
    console.log('Dissolution object exists:', typeof Dissolution !== 'undefined');
    console.log('Exploration interface exists:', typeof window.ExplorationInterface !== 'undefined');
    console.log('=========================');
}

// Manual trigger for testing - call this in console
function testDissolution() {
    console.log('Manual dissolution test triggered');
    triggerDissolution();
}

// Make return function available globally for exploration interface
window.returnToMagazine = returnToMagazine;

// Make initializeMagazine available globally for enhanced magazine
window.initializeMagazine = initializeMagazine;