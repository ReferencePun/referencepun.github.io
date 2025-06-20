// magazine-flip.js - DEBUG VERSION to fix blank page issue

let pageFlip = null;
let isOnLastPageFlag = false;

// Initialize the magazine when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing magazine...');
    initializeMagazine();
});

function initializeMagazine() {
    console.log('📖 Starting magazine initialization...');
    const flipbookElement = document.getElementById('flipbook');
    
    if (!flipbookElement) {
        console.error('❌ Flipbook element not found!');
        return;
    }
    
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
    
    console.log(`📏 Book dimensions: ${bookWidth}x${bookHeight}`);
    
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
    const pages = document.querySelectorAll('.page');
    console.log(`📄 Found ${pages.length} pages`);
    pageFlip.loadFromHTML(pages);
    
    // Event listeners
    pageFlip.on('flip', handlePageFlip);
    pageFlip.on('changeState', handleStateChange);
    
    // Set up the dissolution trigger after initialization
    pageFlip.on('init', (e) => {
        console.log('✅ Book initialized', e);
        setupDissolutionTrigger();
        checkIfOnLastPage(); // Check initial state
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyPress);
    
    // Hide loader
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.remove('active');
            console.log('📱 Loader hidden');
        }
    }, 500);
    
    console.log('✅ Magazine initialization complete');
}

// Handle page flip events
function handlePageFlip(event) {
    console.log('📖 Page flipped to:', event.data);
    checkIfOnLastPage();
}

// Handle state changes
function handleStateChange(event) {
    console.log('🔄 Book state:', event.data);
    checkIfOnLastPage();
}

// Check if we're on the last page and update flag
function checkIfOnLastPage() {
    if (!pageFlip) return;
    
    const currentPageIndex = pageFlip.getCurrentPageIndex();
    const totalPages = pageFlip.getPageCount();
    
    console.log(`📍 Current page index: ${currentPageIndex}, Total pages: ${totalPages}`);
    
    // In spread mode, we're on the last page if we're viewing the final spread
    const onLastPage = currentPageIndex >= totalPages - 2;
    
    if (onLastPage !== isOnLastPageFlag) {
        isOnLastPageFlag = onLastPage;
        console.log(`🏁 Last page status changed: ${isOnLastPageFlag}`);
        
        if (isOnLastPageFlag) {
            console.log('🎯 Now on last page - dissolution enabled');
        } else {
            console.log('⏪ Not on last page - dissolution disabled');
        }
    }
}

// Set up global click listener for dissolution
function setupDissolutionTrigger() {
    console.log('🎯 Setting up global dissolution trigger');
    
    // Add a global click listener to the entire flipbook
    const flipbookContainer = document.getElementById('flipbook');
    
    if (flipbookContainer) {
        flipbookContainer.addEventListener('click', function(event) {
            console.log(`🖱️ Flipbook clicked, last page flag: ${isOnLastPageFlag}`);
            
            if (isOnLastPageFlag) {
                console.log('🔥 Click detected on last page - triggering dissolution');
                event.preventDefault();
                event.stopPropagation();
                triggerDissolution();
            }
        }, true); // Use capture phase to catch before StPageFlip
        
        console.log('✅ Global click listener added to flipbook');
    }
    
    // Alternative: Add click listener to the body as a fallback
    document.body.addEventListener('click', function(event) {
        if (isOnLastPageFlag) {
            console.log('🔥 Body click detected on last page - triggering dissolution');
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
                console.log('⌨️ Keyboard dissolution trigger');
                triggerDissolution();
            }
            break;
        case 'd':
            // Debug key
            debugDissolution();
            break;
        case 't':
            // Test exploration view key
            testExplorationView();
            break;
    }
}

// Trigger the dissolution effect
function triggerDissolution() {
    console.log('🔥 Triggering dissolution...');
    
    // Prevent multiple triggers
    if (Dissolution && Dissolution.isAnimating) {
        console.log('⚠️ Dissolution already in progress');
        return;
    }
    
    // Start dissolution animation
    if (typeof Dissolution !== 'undefined') {
        console.log('🎬 Starting dissolution animation');
        Dissolution.start();
    } else {
        console.error('❌ Dissolution object not found');
        // Fallback - just transition to exploration
        setTimeout(() => {
            transitionToExploration();
        }, 1000);
    }
    
    // Add dissolving class to book
    const bookElement = document.querySelector('.stf__parent');
    if (bookElement) {
        bookElement.classList.add('dissolving');
        console.log('✅ Added dissolving class to book');
    } else {
        console.warn('⚠️ Book element not found for dissolving class');
    }
    
    // After dissolution completes, transition to exploration
    setTimeout(() => {
        console.log('⏰ Dissolution complete, transitioning to exploration');
        transitionToExploration();
    }, 4000);
}

// Transition to exploration view
function transitionToExploration() {
    console.log('🌟 Starting transition to exploration view');
    
    const magazineView = document.getElementById('magazine-view');
    const explorationView = document.getElementById('exploration-view');
    
    if (!magazineView) {
        console.error('❌ Magazine view not found');
        return;
    }
    
    if (!explorationView) {
        console.error('❌ Exploration view not found');
        return;
    }
    
    console.log('📱 Both views found, proceeding with transition');
    
    // Fade out magazine
    magazineView.style.opacity = '0';
    console.log('👻 Magazine view fading out');
    
    setTimeout(() => {
        // Hide magazine view
        magazineView.classList.remove('active');
        magazineView.style.display = 'none';
        console.log('📖 Magazine view hidden');
        
        // Destroy page flip instance
        if (pageFlip) {
            pageFlip.destroy();
            pageFlip = null;
            console.log('📚 PageFlip destroyed');
        }
        
        // Clean up dissolution
        if (typeof Dissolution !== 'undefined') {
            Dissolution.cleanup();
            console.log('🧹 Dissolution cleaned up');
        }
        
        // Show exploration view
        explorationView.classList.add('active');
        explorationView.style.opacity = '0';
        explorationView.style.display = 'flex';
        console.log('🌟 Exploration view shown');
        
        // Initialize exploration interface
        if (window.ExplorationInterface && window.ExplorationInterface.initializeFromDissolution) {
            window.ExplorationInterface.initializeFromDissolution();
            console.log('🎯 Exploration interface initialized');
        } else {
            console.warn('⚠️ ExplorationInterface not found or missing initializeFromDissolution');
        }
        
        // Fade in exploration
        setTimeout(() => {
            explorationView.style.opacity = '1';
            console.log('✨ Exploration view fully visible');
            
            // Additional debug: check if content is actually there
            const hubTitle = explorationView.querySelector('.hub-title h1');
            if (hubTitle) {
                console.log(`📝 Hub title found: "${hubTitle.textContent}"`);
            } else {
                console.error('❌ Hub title not found in exploration view');
            }
            
            const navButtons = explorationView.querySelectorAll('.nav-button');
            console.log(`🎮 Found ${navButtons.length} navigation buttons`);
            
        }, 100);
    }, 1000);
}

// Test function to manually trigger exploration view
function testExplorationView() {
    console.log('🧪 Manual test of exploration view');
    transitionToExploration();
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
    
    // Fade out exploration
    explorationView.style.opacity = '0';
    
    setTimeout(() => {
        // Hide exploration view
        explorationView.classList.remove('active');
        explorationView.style.display = 'none';
        
        // Show magazine view
        magazineView.classList.add('active');
        magazineView.style.display = 'flex';
        magazineView.style.opacity = '0';
        
        // Reinitialize magazine
        setTimeout(() => {
            initializeMagazine();
            magazineView.style.opacity = '1';
            console.log('📖 Magazine reinitialized');
        }, 100);
    }, 1000);
}

// Handle window resize
window.addEventListener('resize', () => {
    if (pageFlip) {
        // Note: StPageFlip doesn't support dynamic resize
        // Would need to destroy and recreate the instance
        console.log('🔄 Window resized - may need to refresh page for proper sizing');
    }
});

// Debug function - call this in console to check state
function debugDissolution() {
    console.log('=== 🔍 DISSOLUTION DEBUG ===');
    console.log('Current page index:', pageFlip ? pageFlip.getCurrentPageIndex() : 'No pageFlip');
    console.log('Total pages:', pageFlip ? pageFlip.getPageCount() : 'No pageFlip');
    console.log('Last page flag:', isOnLastPageFlag);
    console.log('Dissolution object exists:', typeof Dissolution !== 'undefined');
    console.log('Exploration interface exists:', typeof window.ExplorationInterface !== 'undefined');
    
    // Check DOM elements
    const magazineView = document.getElementById('magazine-view');
    const explorationView = document.getElementById('exploration-view');
    console.log('Magazine view exists:', !!magazineView);
    console.log('Exploration view exists:', !!explorationView);
    
    if (explorationView) {
        console.log('Exploration view classes:', explorationView.className);
        console.log('Exploration view style:', explorationView.style.cssText);
        console.log('Exploration view display:', window.getComputedStyle(explorationView).display);
        console.log('Exploration view opacity:', window.getComputedStyle(explorationView).opacity);
    }
    
    console.log('=========================');
}

// Manual trigger for testing - call this in console
function testDissolution() {
    console.log('🧪 Manual dissolution test triggered');
    triggerDissolution();
}

// Make functions available globally for testing
window.debugDissolution = debugDissolution;
window.testDissolution = testDissolution;
window.testExplorationView = testExplorationView;
window.returnToMagazine = returnToMagazine;

console.log('🎯 Magazine flip module loaded with debug features');
console.log('🔧 Debug commands: debugDissolution(), testDissolution(), testExplorationView()');
console.log('⌨️ Debug keys: D (debug), T (test exploration view)');