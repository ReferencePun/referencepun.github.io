// dissolution.js - Enhanced Dissolution animation effects

const Dissolution = {
    container: null,
    isAnimating: false,
    
    // Configuration
    config: {
        particleCount: 120,
        burnDuration: 4000,
        ashDuration: 5000,
        phoenixDelay: 3000
    },
    
    // Start the dissolution effect
    start() {
        if (this.isAnimating) return;
        
        console.log('Starting dissolution animation');
        this.isAnimating = true;
        this.container = document.getElementById('dissolution-container');
        this.container.classList.remove('hidden');
        this.container.classList.add('active');
        
        // Create multiple burn effects for better coverage
        this.createBurnEffect();
        this.createFireCrawl();
        
        // Create ash particles after a delay
        setTimeout(() => {
            this.createAshParticles();
        }, 1500);
        
        // Create phoenix elements after delay
        setTimeout(() => {
            this.createPhoenixElements();
        }, this.config.phoenixDelay);
    },
    
    // Create burning edge effect
    createBurnEffect() {
        // Create main burn overlay
        const burnOverlay = document.createElement('div');
        burnOverlay.className = 'burn-overlay';
        
        // Create animated burn edges using CSS gradients
        burnOverlay.style.background = `
            radial-gradient(circle at 20% 30%, transparent 20%, rgba(255, 100, 0, 0.4) 40%, transparent 60%),
            radial-gradient(circle at 80% 70%, transparent 20%, rgba(255, 50, 0, 0.4) 40%, transparent 60%),
            radial-gradient(circle at 50% 50%, transparent 30%, rgba(200, 50, 0, 0.3) 60%, transparent 80%),
            linear-gradient(45deg, transparent 40%, rgba(255, 80, 0, 0.2) 50%, transparent 60%)
        `;
        
        this.container.appendChild(burnOverlay);
        
        // Create spreading burn spots
        let burnCounter = 0;
        const maxBurnSpots = 50;
        
        const burnAnimation = setInterval(() => {
            if (burnCounter >= maxBurnSpots) {
                clearInterval(burnAnimation);
                return;
            }
            
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 100;
            const randomSize = Math.random() * 40 + 30;
            const intensity = Math.random() * 0.6 + 0.4;
            
            const burnSpot = document.createElement('div');
            burnSpot.style.cssText = `
                position: absolute;
                left: ${randomX}%;
                top: ${randomY}%;
                width: ${randomSize}px;
                height: ${randomSize}px;
                background: radial-gradient(circle, 
                    rgba(255, 200, 0, ${intensity}) 0%, 
                    rgba(255, 100, 0, ${intensity * 0.8}) 30%, 
                    rgba(200, 50, 0, ${intensity * 0.6}) 60%, 
                    transparent 100%);
                animation: expandBurn 2s ease-out forwards;
                pointer-events: none;
                border-radius: 50%;
            `;
            
            this.container.appendChild(burnSpot);
            
            // Remove after animation
            setTimeout(() => {
                if (burnSpot.parentNode) {
                    burnSpot.remove();
                }
            }, 2000);
            
            burnCounter++;
        }, 80);
        
        // Stop burn animation after duration
        setTimeout(() => {
            clearInterval(burnAnimation);
        }, this.config.burnDuration);
    },
    
    // Create fire crawling from edges
    createFireCrawl() {
        // Create fire crawling from different edges
        const edges = [
            { startX: 0, startY: 50, endX: 30, endY: 40 },      // Left edge
            { startX: 100, startY: 30, endX: 70, endY: 45 },   // Right edge
            { startX: 50, startY: 0, endX: 45, endY: 25 },     // Top edge
            { startX: 70, startY: 100, endX: 60, endY: 75 }    // Bottom edge
        ];
        
        edges.forEach((edge, index) => {
            setTimeout(() => {
                this.createCrawlingFire(edge.startX, edge.startY, edge.endX, edge.endY);
            }, index * 300);
        });
    },
    
    // Create fire that crawls across the page
    createCrawlingFire(startX, startY, endX, endY) {
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const progress = i / 14;
                const x = startX + (endX - startX) * progress;
                const y = startY + (endY - startY) * progress;
                
                const flame = document.createElement('div');
                flame.style.cssText = `
                    position: absolute;
                    left: ${x}%;
                    top: ${y}%;
                    width: ${Math.random() * 20 + 15}px;
                    height: ${Math.random() * 25 + 20}px;
                    background: radial-gradient(ellipse at bottom, 
                        rgba(255, 200, 0, 0.9) 0%, 
                        rgba(255, 100, 0, 0.7) 40%, 
                        rgba(255, 50, 0, 0.5) 70%, 
                        transparent 100%);
                    animation: flicker 1.5s ease-in-out forwards;
                    pointer-events: none;
                    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                `;
                
                this.container.appendChild(flame);
                
                // Remove after animation
                setTimeout(() => {
                    if (flame.parentNode) {
                        flame.remove();
                    }
                }, 1500);
            }, i * 100);
        }
    },
    
    // Create falling ash particles
    createAshParticles() {
        for (let i = 0; i < this.config.particleCount; i++) {
            setTimeout(() => {
                const ash = document.createElement('div');
                ash.className = 'ash-particle';
                
                // Random starting position across the page
                const startX = Math.random() * 100;
                const startY = Math.random() * 40; // Start from upper portion
                
                // Random properties for variety
                const size = Math.random() * 8 + 3;
                const duration = Math.random() * 3 + 2;
                const delay = Math.random() * 1;
                const drift = (Math.random() - 0.5) * 150; // Horizontal drift
                const opacity = Math.random() * 0.6 + 0.3;
                
                ash.style.cssText = `
                    position: absolute;
                    left: ${startX}%;
                    top: ${startY}%;
                    width: ${size}px;
                    height: ${size}px;
                    background: ${Math.random() > 0.5 ? '#333' : '#666'};
                    border-radius: ${Math.random() > 0.3 ? '50%' : '0'};
                    opacity: ${opacity};
                    animation: ashFall${i} ${duration}s ease-in forwards;
                    animation-delay: ${delay}s;
                    pointer-events: none;
                `;
                
                // Create custom fall animation with drift
                const styleSheet = document.createElement('style');
                styleSheet.textContent = `
                    @keyframes ashFall${i} {
                        0% {
                            transform: translateY(0) translateX(0) rotate(0deg);
                            opacity: ${opacity};
                        }
                        50% {
                            opacity: ${opacity * 0.8};
                        }
                        100% {
                            transform: translateY(${window.innerHeight + 100}px) translateX(${drift}px) rotate(${Math.random() * 720}deg);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(styleSheet);
                
                this.container.appendChild(ash);
                
                // Remove particle and stylesheet after animation
                setTimeout(() => {
                    if (ash.parentNode) {
                        ash.remove();
                    }
                    if (styleSheet.parentNode) {
                        styleSheet.remove();
                    }
                }, (duration + delay) * 1000 + 500);
            }, i * 40); // Stagger particle creation
        }
    },
    
    // Create phoenix/emerging elements
    createPhoenixElements() {
        // Create glowing embers that rise from the ashes
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const ember = document.createElement('div');
                ember.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * 100}%;
                    bottom: ${Math.random() * 20}%;
                    width: ${Math.random() * 6 + 3}px;
                    height: ${Math.random() * 6 + 3}px;
                    background: radial-gradient(circle, 
                        rgba(255, 200, 0, 0.9) 0%, 
                        rgba(255, 100, 0, 0.7) 40%, 
                        rgba(255, 50, 0, 0.5) 70%, 
                        transparent 100%);
                    border-radius: 50%;
                    opacity: 0;
                    animation: emberRise ${Math.random() * 3 + 2}s ease-out forwards;
                    animation-delay: ${Math.random() * 1}s;
                    pointer-events: none;
                    box-shadow: 0 0 ${Math.random() * 10 + 5}px rgba(255, 100, 0, 0.5);
                `;
                
                this.container.appendChild(ember);
                
                // Remove after animation
                setTimeout(() => {
                    if (ember.parentNode) {
                        ember.remove();
                    }
                }, 5000);
            }, i * 150);
        }
        
        // Create expanding energy waves
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const wave = document.createElement('div');
                wave.style.cssText = `
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 100, 0, 0.6);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    animation: expandWave 2s ease-out forwards;
                    pointer-events: none;
                `;
                
                this.container.appendChild(wave);
                
                setTimeout(() => {
                    if (wave.parentNode) {
                        wave.remove();
                    }
                }, 2000);
            }, i * 400);
        }
    },
    
    // Clean up after dissolution
    cleanup() {
        if (this.container) {
            this.container.innerHTML = '';
            this.container.classList.remove('active');
            this.container.classList.add('hidden');
        }
        this.isAnimating = false;
        console.log('Dissolution cleanup complete');
    }
};

// Add enhanced CSS animations
const dissolutionStyles = document.createElement('style');
dissolutionStyles.textContent = `
    @keyframes expandBurn {
        0% {
            transform: scale(0.5);
            opacity: 0.8;
        }
        50% {
            transform: scale(2);
            opacity: 0.6;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes flicker {
        0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.9;
        }
        25% {
            transform: scale(1.2) rotate(5deg);
            opacity: 0.7;
        }
        50% {
            transform: scale(0.9) rotate(-3deg);
            opacity: 0.8;
        }
        75% {
            transform: scale(1.1) rotate(2deg);
            opacity: 0.6;
        }
        100% {
            transform: scale(0.7) rotate(0deg);
            opacity: 0;
        }
    }
    
    @keyframes emberRise {
        0% {
            transform: translateY(0) scale(1);
            opacity: 0;
        }
        20% {
            opacity: 1;
        }
        80% {
            opacity: 0.8;
        }
        100% {
            transform: translateY(-300px) scale(0.3);
            opacity: 0;
        }
    }
    
    @keyframes expandWave {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
            border-width: 2px;
        }
        50% {
            opacity: 0.3;
            border-width: 1px;
        }
        100% {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
            border-width: 0px;
        }
    }
`;
document.head.appendChild(dissolutionStyles);