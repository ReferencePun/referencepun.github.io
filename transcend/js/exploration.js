// exploration.js - Non-linear navigation interface logic

// Initialize exploration interface when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupExplorationInterface();
});

function setupExplorationInterface() {
    console.log('Setting up exploration interface...');
    
    // Set up button click handlers
    setupNavigationButtons();
    
    // Set up keyboard navigation
    setupKeyboardNavigation();
    
    // Set up notification handling
    setupNotificationHandling();
    
    // Add ambient particles for atmosphere
    createAmbientParticles();
    setInterval(createAmbientParticles, 10000);
    
    console.log('✨ Exploration interface ready');
}

function setupNavigationButtons() {
    const buttons = document.querySelectorAll('.nav-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Create ripple effect
            createRippleEffect(this, e);
            
            // Get section data
            const section = this.dataset.section;
            console.log(`🎯 Section clicked: ${section}`);
            
            // Show section information (for demo)
            showSectionInfo(section);
            
            // In future: this will trigger dynamic content loading
            // dynamicMagazine.transitionToSection(section, sectionInfo[section].transitionGif);
        });
        
        // Add hover sound effect placeholder
        button.addEventListener('mouseenter', function() {
            // Future: Play hover sound
            console.log(`🎵 Hover sound: ${this.dataset.section}`);
        });
    });
}

function createRippleEffect(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.remove();
        }
    }, 600);
}

function showSectionInfo(section) {
    const info = sectionInfo[section];
    const notification = document.getElementById('notification');
    const title = document.getElementById('notificationTitle');
    const description = document.getElementById('notificationDescription');
    
    if (!notification || !title || !description) {
        console.warn('Notification elements not found');
        return;
    }
    
    title.textContent = info.title;
    description.textContent = info.description;
    notification.style.borderColor = info.color;
    notification.style.color = info.color;
    notification.classList.add('show');
    
    console.log(`📱 Showing info for: ${info.title}`);
}

function closeNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.remove('show');
        console.log('📱 Notification closed');
    }
}

function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Escape':
                closeNotification();
                break;
            case '1':
                simulateButtonClick('memories');
                break;
            case '2':
                simulateButtonClick('dreams');
                break;
            case '3':
                simulateButtonClick('future');
                break;
            case '4':
                simulateButtonClick('essence');
                break;
            case '5':
                simulateButtonClick('connection');
                break;
            case 'r':
            case 'R':
                returnToMagazine();
                break;
        }
    });
    
    console.log('⌨️ Keyboard navigation: 1-5 for sections, R for return, ESC to close');
}

function simulateButtonClick(section) {
    const button = document.querySelector(`[data-section="${section}"]`);
    if (button) {
        button.click();
    }
}

function setupNotificationHandling() {
    const notification = document.getElementById('notification');
    
    if (notification) {
        // Close when clicking outside
        notification.addEventListener('click', function(e) {
            if (e.target === this) {
                closeNotification();
            }
        });
        
        // Close button handler
        const closeButton = notification.querySelector('button');
        if (closeButton) {
            closeButton.addEventListener('click', closeNotification);
        }
    }
}

function returnToMagazine() {
    console.log('🔄 Returning to magazine...');
    
    // Future implementation: reverse dissolution animation
    // For now, just show alert
    
    // In the future, this would trigger:
    // 1. Reverse dissolution animation
    // 2. Fade out exploration view
    // 3. Reinitialize magazine view
    // 4. StPageFlip back to last page
}

function createAmbientParticles() {
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 2px;
                height: 2px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle${i} ${Math.random() * 3 + 2}s ease-in-out infinite;
                pointer-events: none;
                z-index: 5;
            `;
            
            // Create unique animation for each particle
            const styleSheet = document.createElement('style');
            styleSheet.textContent = `
                @keyframes twinkle${i} {
                    0%, 100% { 
                        opacity: 0; 
                        transform: scale(0.5) translateY(0px); 
                    }
                    50% { 
                        opacity: 0.6; 
                        transform: scale(1) translateY(${Math.random() * 20 - 10}px); 
                    }
                }
            `;
            document.head.appendChild(styleSheet);
            
            document.body.appendChild(particle);
            
            // Remove particle and stylesheet after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
                if (styleSheet.parentNode) {
                    styleSheet.remove();
                }
            }, 5000);
        }, i * 100);
    }
}

// Utility function to check if exploration view is active
function isExplorationActive() {
    const explorationView = document.getElementById('exploration-view');
    return explorationView && explorationView.classList.contains('active');
}

// Function to handle transition from magazine dissolution
function initializeExplorationFromDissolution() {
    console.log('🌟 Initializing exploration from dissolution...');
    
    // Add any special initialization needed when coming from dissolution
    // This could include:
    // - Special entrance animations
    // - Audio initialization
    // - Preloading next sections
    
    const hubTitle = document.querySelector('.hub-title h1');
    if (hubTitle) {
        hubTitle.style.animation = 'none';
        hubTitle.offsetHeight; // Trigger reflow
        hubTitle.style.animation = 'gentlePulse 4s ease-in-out infinite';
    }
}

// Enhanced return to magazine function for future integration
function enhancedReturnToMagazine() {
    console.log('🔄 Enhanced return to magazine...');
    
    const explorationView = document.getElementById('exploration-view');
    const magazineView = document.getElementById('magazine-view');
    
    if (!explorationView || !magazineView) {
        console.warn('Views not found for transition');
        return;
    }
    
    // Future implementation:
    // 1. Fade out exploration with reverse particle effects
    // 2. Recreate magazine view with StPageFlip
    // 3. Reverse dissolution animation (phoenix to magazine)
    // 4. Resume magazine at last page
    
    alert('Enhanced return feature - coming soon with reverse dissolution!');
}

// Export functions for external use
window.ExplorationInterface = {
    showSectionInfo,
    closeNotification,
    returnToMagazine: enhancedReturnToMagazine,
    initializeFromDissolution: initializeExplorationFromDissolution,
    isActive: isExplorationActive
};

console.log('🎨 Exploration interface module loaded');
console.log('🎯 Available sections:', Object.keys(sectionInfo));
console.log('⌨️ Keyboard shortcuts: 1-5 (sections), R (return), ESC (close)');