// meditation-transcendence.js - Patience-based enlightenment system

class MeditationTranscendence {
    constructor() {
        this.startTime = null;
        this.isActive = false;
        this.lastActivity = Date.now();
        this.meditationTimer = null;
        this.transformationPhase = 0;
        this.activityThreshold = 100; // milliseconds of stillness required
        
        // Bind methods
        this.onUserActivity = this.onUserActivity.bind(this);
        this.checkMeditation = this.checkMeditation.bind(this);
        this.updateTransformation = this.updateTransformation.bind(this);
    }

    // Start meditation detection when exploration view is active
    startDetection() {
        if (this.isActive) return;
        
        console.log('🧘‍♀️ Meditation transcendence detection started');
        this.isActive = true;
        this.startTime = Date.now();
        this.lastActivity = Date.now();
        this.transformationPhase = 0;
        
        // Add activity listeners
        document.addEventListener('mousemove', this.onUserActivity);
        document.addEventListener('click', this.onUserActivity);
        document.addEventListener('keypress', this.onUserActivity);
        document.addEventListener('scroll', this.onUserActivity);
        document.addEventListener('touchstart', this.onUserActivity);
        document.addEventListener('touchmove', this.onUserActivity);
        
        // Start checking meditation state
        this.meditationTimer = setInterval(this.checkMeditation, 1000);
        
        // Add CSS for transformation phases
        this.addTransformationStyles();
    }

    // Stop meditation detection
    stopDetection() {
        if (!this.isActive) return;
        
        console.log('🧘‍♀️ Meditation transcendence detection stopped');
        this.isActive = false;
        
        // Remove activity listeners
        document.removeEventListener('mousemove', this.onUserActivity);
        document.removeEventListener('click', this.onUserActivity);
        document.removeEventListener('keypress', this.onUserActivity);
        document.removeEventListener('scroll', this.onUserActivity);
        document.removeEventListener('touchstart', this.onUserActivity);
        document.removeEventListener('touchmove', this.onUserActivity);
        
        // Clear timer
        if (this.meditationTimer) {
            clearInterval(this.meditationTimer);
            this.meditationTimer = null;
        }
        
        // Reset transformation
        this.resetTransformation();
    }

    // Track user activity
    onUserActivity(event) {
        // Filter out very small mouse movements (cursor drift)
        if (event.type === 'mousemove') {
            const movement = Math.abs(event.movementX) + Math.abs(event.movementY);
            if (movement < 2) return; // Ignore tiny movements
        }
        
        this.lastActivity = Date.now();
        
        // Reset transformation if significant activity
        if (this.transformationPhase > 0) {
            console.log('🏃‍♂️ Activity detected, resetting meditation');
            this.resetTransformation();
        }
    }

    // Check meditation state every second
    checkMeditation() {
        if (!this.isActive) return;
        
        const now = Date.now();
        const timeSinceActivity = now - this.lastActivity;
        const totalMeditationTime = (now - this.startTime) / 1000; // seconds
        
        // Only count as meditation if no activity for threshold
        if (timeSinceActivity >= this.activityThreshold) {
            const stillnessTime = timeSinceActivity / 1000; // seconds
            
            console.log(`🧘‍♀️ Stillness: ${stillnessTime.toFixed(1)}s | Total: ${totalMeditationTime.toFixed(1)}s`);
            
            // Phase transitions based on stillness duration
            if (stillnessTime >= 60 && this.transformationPhase < 5) {
                this.triggerTranscendence();
            } else if (stillnessTime >= 45 && this.transformationPhase < 4) {
                this.setTransformationPhase(4); // Threshold phase
            } else if (stillnessTime >= 30 && this.transformationPhase < 3) {
                this.setTransformationPhase(3); // Opening phase
            } else if (stillnessTime >= 15 && this.transformationPhase < 2) {
                this.setTransformationPhase(2); // Deepening phase
            } else if (stillnessTime >= 5 && this.transformationPhase < 1) {
                this.setTransformationPhase(1); // Settling phase
            }
        }
    }

    // Set transformation phase
    setTransformationPhase(phase) {
        if (phase === this.transformationPhase) return;
        
        console.log(`✨ Meditation phase: ${phase}`);
        this.transformationPhase = phase;
        
        const explorationView = document.getElementById('exploration-view');
        if (!explorationView) return;
        
        // Remove previous phase classes
        for (let i = 0; i <= 5; i++) {
            explorationView.classList.remove(`meditation-phase-${i}`);
        }
        
        // Add current phase class
        explorationView.classList.add(`meditation-phase-${phase}`);
        
        this.updateTransformation();
    }

    // Update visual transformation based on phase
    updateTransformation() {
        const explorationView = document.getElementById('exploration-view');
        if (!explorationView) return;
        
        const hubTitle = explorationView.querySelector('.hub-title h1');
        const navButtons = explorationView.querySelectorAll('.nav-button');
        
        switch (this.transformationPhase) {
            case 1: // Settling (0-15s)
                this.createAmbientParticles('settling');
                break;
                
            case 2: // Deepening (15-30s)
                this.createAmbientParticles('deepening');
                if (hubTitle) {
                    hubTitle.style.animation = 'breathingText 8s ease-in-out infinite';
                }
                break;
                
            case 3: // Opening (30-45s)
                this.createSacredGeometry();
                navButtons.forEach(btn => {
                    btn.style.animationDuration = '6s'; // Slow down animations
                });
                break;
                
            case 4: // Threshold (45-60s)
                this.enhanceSacredGeometry();
                navButtons.forEach(btn => {
                    btn.style.opacity = '0.6';
                    btn.style.transform = 'scale(0.9)';
                });
                break;
        }
    }

    // Trigger final transcendence
    triggerTranscendence() {
        console.log('🌟 TRANSCENDENCE ACHIEVED - transitioning to enhanced magazine');
        
        this.setTransformationPhase(5);
        this.stopDetection();
        
        // Create transcendence portal effect
        this.createTranscendencePortal();
        
        // Transition to enhanced magazine after portal animation
        setTimeout(() => {
            this.transitionToEnhancedMagazine();
        }, 3000);
    }

    // Create transcendence portal effect
    createTranscendencePortal() {
        const explorationView = document.getElementById('exploration-view');
        if (!explorationView) return;
        
        const portal = document.createElement('div');
        portal.className = 'transcendence-portal';
        portal.innerHTML = `
            <div class="portal-ring"></div>
            <div class="portal-ring"></div>
            <div class="portal-ring"></div>
            <div class="portal-light"></div>
        `;
        
        explorationView.appendChild(portal);
        
        // Animate portal appearance
        setTimeout(() => {
            portal.classList.add('active');
        }, 100);
    }

    // Transition to enhanced magazine
    transitionToEnhancedMagazine() {
        console.log('📖 Transitioning to enhanced magazine');
        
        const explorationView = document.getElementById('exploration-view');
        const magazineView = document.getElementById('magazine-view');
        
        if (!explorationView || !magazineView) {
            console.error('Views not found for transcendence transition');
            return;
        }
        
        // IMMEDIATELY clear magazine content to prevent flash of old pages
        const flipbook = document.getElementById('flipbook');
        if (flipbook) {
            flipbook.innerHTML = ''; // Clear immediately
            console.log('🧹 Cleared old magazine content immediately');
        }
        
        // Fade out exploration view
        explorationView.style.opacity = '0';
        
        setTimeout(() => {
            // Hide exploration view
            explorationView.classList.remove('active');
            explorationView.style.display = 'none';
            
            // Show enhanced magazine view
            magazineView.classList.add('active', 'enhanced');
            magazineView.style.display = 'flex';
            magazineView.style.opacity = '0';
            
            // Initialize enhanced magazine
            setTimeout(() => {
                this.initializeEnhancedMagazine();
                // Magazine opacity will be controlled by initializeEnhancedMagazine
            }, 100);
        }, 1000);
    }

    // Initialize enhanced magazine with breathing animations - FIXED VERSION
    initializeEnhancedMagazine() {
        console.log('✨ FIXED: Initializing enhanced magazine experience');
        
        const magazineView = document.getElementById('magazine-view');
        const explorationView = document.getElementById('exploration-view');
        let flipbook = document.getElementById('flipbook');
        
        // 1. Hide exploration view
        if (explorationView) {
            explorationView.classList.remove('active');
            explorationView.style.display = 'none';
            console.log('✅ Exploration view hidden');
        }
        
        // 2. Show magazine view but keep it hidden initially
        if (magazineView) {
            magazineView.classList.add('active', 'enhanced');
            magazineView.style.display = 'flex';
            magazineView.style.opacity = '0'; // Keep hidden until flipbook is ready
            console.log('✅ Magazine view prepared (hidden until ready)');
        }
        
        // 3. Destroy existing pageFlip and stop dissolution detection
        if (window.pageFlip) {
            window.pageFlip.destroy();
            window.pageFlip = null;
            console.log('✅ Old pageFlip destroyed');
        }
        
        // 4. DISABLE dissolution trigger for enhanced magazine
        window.isEnhancedMode = true;
        console.log('✅ Enhanced mode enabled - dissolution trigger disabled');
        
        // 5. RECREATE flipbook element if missing
        if (!flipbook) {
            console.log('🔧 Flipbook missing - recreating...');
            flipbook = document.createElement('div');
            flipbook.id = 'flipbook';
            flipbook.className = 'flipbook-container';
            magazineView.appendChild(flipbook);
            console.log('✅ Flipbook element recreated');
        }
        
        // 6. Replace flipbook content with enhanced pages (HIDDEN until ready)
        flipbook.innerHTML = `
            <div class="page">
                <div class="page-content">
                    <img src="assets/magazine/page-13.jpg" alt="Page 13" onload="console.log('✅ Page 13 loaded')" onerror="console.error('❌ Page 13 failed to load')">
                </div>
            </div>
            
            <div class="page">
                <div class="page-content">
                    <img src="assets/magazine/page-14.jpg" alt="Page 14" onload="console.log('✅ Page 14 loaded')" onerror="console.error('❌ Page 14 failed to load')">
                </div>
            </div>
            
            <div class="page">
                <div class="page-content">
                    <img src="assets/magazine/page-15.jpg" alt="Page 15" onload="console.log('✅ Page 15 loaded')" onerror="console.error('❌ Page 15 failed to load')">
                </div>
            </div>
            
            <div class="page">
                <div class="page-content">
                    <img src="assets/magazine/page-16.jpg" alt="Page 16" onload="console.log('✅ Page 16 loaded')" onerror="console.error('❌ Page 16 failed to load')">
                </div>
            </div>
            
            <div class="page back-cover-final">
                <div class="page-content">
                    <img src="assets/magazine/backcover.jpg" alt="Back Cover - Journey Complete" onload="console.log('✅ Back cover loaded')" onerror="console.error('❌ Back cover failed to load')">
                </div>
            </div>
            
            <!-- Blank page after back cover for smooth animation (matches front cover treatment) -->
            <div class="page background-page-end">
                <div class="page-content background-content-end">
                    <!-- This page will be invisible and match your website background, just like the front -->
                </div>
            </div>
        `;
        
        // HIDE flipbook immediately to prevent flash of side-by-side pages
        flipbook.style.opacity = '0';
        flipbook.style.visibility = 'hidden';
        console.log('✅ Flipbook HTML replaced + hidden to prevent flash');
        
        // 7. Wait for images to load, then initialize pageFlip
        setTimeout(() => {
            // Calculate dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const aspectRatio = 2480 / 3508;
            
            let bookHeight = Math.min(viewportHeight * 0.85, 800);
            let bookWidth = bookHeight * aspectRatio;
            
            if (bookWidth > viewportWidth * 0.45) {
                bookWidth = viewportWidth * 0.45;
                bookHeight = bookWidth / aspectRatio;
            }
            
            console.log(`📏 Enhanced magazine dimensions: ${bookWidth}x${bookHeight}`);
            
            // Create new pageFlip instance
            try {
                window.pageFlip = new St.PageFlip(flipbook, {
                    width: bookWidth,
                    height: bookHeight,
                    size: "fixed",
                    showCover: false,
                    drawShadow: true,
                    maxShadowOpacity: 0.4,
                    flippingTime: 1000,
                    usePortrait: true,
                    startZIndex: 0,
                    autoSize: false,
                    startPage: 0,
                    clickEventForward: true,
                    mobileScrollSupport: true,
                    useMouseEvents: true,
                    swipeDistance: 50,
                    showPageCorners: false,
                    disableFlipByClick: false
                });
                
                // Load pages
                const pages = flipbook.querySelectorAll('.page');
                console.log(`📚 Loading ${pages.length} enhanced pages`);
                window.pageFlip.loadFromHTML(pages);
                
                // Add enhanced styling
                flipbook.classList.add('enhanced-mode');
                
                // SHOW both magazine view and flipbook smoothly once ready
                setTimeout(() => {
                    // Show magazine view
                    if (magazineView) {
                        magazineView.style.opacity = '1';
                        magazineView.style.transition = 'opacity 0.5s ease';
                    }
                    
                    // Show flipbook
                    flipbook.style.opacity = '1';
                    flipbook.style.visibility = 'visible';
                    flipbook.style.transition = 'opacity 0.5s ease';
                    console.log('✨ Enhanced magazine revealed smoothly - no flash!');
                }, 500);
                
                console.log('✅ Enhanced magazine created successfully!');
                console.log('📖 You should now see pages 13-16 and back cover');
                console.log('🔒 Dissolution trigger disabled for enhanced mode');
                
                // Debug final state
                setTimeout(() => {
                    if (window.pageFlip) {
                        console.log(`📊 Final state - Current page: ${window.pageFlip.getCurrentPageIndex()}, Total: ${window.pageFlip.getPageCount()}`);
                    }
                }, 1000);
                
            } catch (error) {
                console.error('❌ Error creating enhanced pageFlip:', error);
            }
            
        }, 1000); // Reduced wait time since we're controlling visibility carefully
    }

    // Reset transformation to initial state
    resetTransformation() {
        this.transformationPhase = 0;
        this.lastActivity = Date.now();
        
        const explorationView = document.getElementById('exploration-view');
        if (!explorationView) return;
        
        // Remove all transformation classes
        for (let i = 0; i <= 5; i++) {
            explorationView.classList.remove(`meditation-phase-${i}`);
        }
        
        // Reset styles
        const hubTitle = explorationView.querySelector('.hub-title h1');
        const navButtons = explorationView.querySelectorAll('.nav-button');
        
        if (hubTitle) {
            hubTitle.style.animation = 'gentlePulse 4s ease-in-out infinite';
        }
        
        navButtons.forEach(btn => {
            btn.style.opacity = '';
            btn.style.transform = '';
            btn.style.animationDuration = '';
        });
        
        // Remove particles and geometry
        const particles = explorationView.querySelectorAll('.meditation-particle, .sacred-geometry');
        particles.forEach(p => p.remove());
    }

    // Create ambient particles for different phases
    createAmbientParticles(phase) {
        const explorationView = document.getElementById('exploration-view');
        if (!explorationView) return;
        
        const particleCount = phase === 'settling' ? 10 : 20;
        const speed = phase === 'settling' ? 'slow' : 'very-slow';
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = `meditation-particle ${speed}`;
            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: rgba(100, 200, 255, 0.4);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: meditationFloat${i} ${Math.random() * 10 + 10}s ease-in-out infinite;
                pointer-events: none;
                z-index: 1;
            `;
            
            explorationView.appendChild(particle);
            
            // Remove after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 15000);
        }
    }

    // Create sacred geometry patterns
    createSacredGeometry() {
        const explorationView = document.getElementById('exploration-view');
        if (!explorationView) return;
        
        const geometry = document.createElement('div');
        geometry.className = 'sacred-geometry';
        geometry.innerHTML = `
            <div class="geometry-circle"></div>
            <div class="geometry-circle"></div>
            <div class="geometry-circle"></div>
        `;
        
        explorationView.appendChild(geometry);
    }

    // Enhance sacred geometry for threshold phase
    enhanceSacredGeometry() {
        const geometry = document.querySelector('.sacred-geometry');
        if (geometry) {
            geometry.classList.add('enhanced');
        }
    }

    // Add CSS for transformation effects
    addTransformationStyles() {
        if (document.getElementById('meditation-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'meditation-styles';
        styles.textContent = `
            /* Meditation Phase Transitions */
            .exploration-view.meditation-phase-1 {
                transition: all 2s ease;
            }
            
            .exploration-view.meditation-phase-2 {
                background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
                transition: all 3s ease;
            }
            
            .exploration-view.meditation-phase-3 {
                background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
                transition: all 3s ease;
            }
            
            .exploration-view.meditation-phase-4 {
                background: linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 100%);
                transition: all 3s ease;
            }
            
            .exploration-view.meditation-phase-5 {
                background: radial-gradient(circle at center, #ffffff 0%, #e8f0ff 100%);
                transition: all 2s ease;
            }
            
            /* Breathing text animation */
            @keyframes breathingText {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.02); opacity: 1; }
            }
            
            /* Sacred geometry */
            .sacred-geometry {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 300px;
                height: 300px;
                pointer-events: none;
                opacity: 0;
                animation: fadeInGeometry 3s ease forwards;
            }
            
            .geometry-circle {
                position: absolute;
                border: 1px solid rgba(100, 150, 255, 0.2);
                border-radius: 50%;
                animation: rotateGeometry 30s linear infinite;
            }
            
            .geometry-circle:nth-child(1) {
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
            }
            
            .geometry-circle:nth-child(2) {
                width: 70%;
                height: 70%;
                top: 15%;
                left: 15%;
                animation-direction: reverse;
                animation-duration: 45s;
            }
            
            .geometry-circle:nth-child(3) {
                width: 40%;
                height: 40%;
                top: 30%;
                left: 30%;
                animation-duration: 60s;
            }
            
            .sacred-geometry.enhanced .geometry-circle {
                border-color: rgba(100, 150, 255, 0.4);
                box-shadow: 0 0 20px rgba(100, 150, 255, 0.2);
            }
            
            @keyframes fadeInGeometry {
                to { opacity: 1; }
            }
            
            @keyframes rotateGeometry {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            /* Transcendence portal */
            .transcendence-portal {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 400px;
                height: 400px;
                pointer-events: none;
                opacity: 0;
                transition: opacity 2s ease;
            }
            
            .transcendence-portal.active {
                opacity: 1;
            }
            
            .portal-ring {
                position: absolute;
                border: 2px solid rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                animation: expandPortal 3s ease-out forwards;
            }
            
            .portal-ring:nth-child(1) {
                width: 100px;
                height: 100px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation-delay: 0s;
            }
            
            .portal-ring:nth-child(2) {
                width: 150px;
                height: 150px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation-delay: 0.5s;
            }
            
            .portal-ring:nth-child(3) {
                width: 200px;
                height: 200px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation-delay: 1s;
            }
            
            .portal-light {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
                border-radius: 50%;
                animation: pulseLight 2s ease-in-out infinite;
                animation-delay: 1.5s;
            }
            
            @keyframes expandPortal {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                70% {
                    transform: translate(-50%, -50%) scale(1.2);
                    opacity: 0.8;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0.6;
                }
            }
            
            @keyframes pulseLight {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
            }
            
            /* Enhanced magazine mode */
            .magazine-view.enhanced .page-content img {
                animation: subtleBreathing 6s ease-in-out infinite;
            }
            
            @keyframes subtleBreathing {
                0%, 100% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(1.005); filter: brightness(1.02); }
            }
            
            /* Meditation particles */
            @keyframes meditationFloat0 { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-20px) translateX(10px); } }
            @keyframes meditationFloat1 { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-15px) translateX(-8px); } }
            @keyframes meditationFloat2 { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-25px) translateX(12px); } }
            @keyframes meditationFloat3 { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-18px) translateX(-5px); } }
            @keyframes meditationFloat4 { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-22px) translateX(8px); } }
        `;
        
        document.head.appendChild(styles);
    }
}

// Create global instance
const meditationTranscendence = new MeditationTranscendence();

// Export for external use
window.MeditationTranscendence = meditationTranscendence;

console.log('🧘‍♀️ Meditation Transcendence system loaded');
console.log('💫 Enlightenment awaits those with patience...');