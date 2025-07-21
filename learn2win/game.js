// Constants to replace magic numbers 
const GAME_CONFIG = {
    BOARD_SPACES: 40,
    MAX_CONSECUTIVE_ROLLS: 3,
    MASTERY_REQUIREMENT: 2,
    MAX_RECENT_QUESTIONS: 15,
    TOTAL_CATEGORIES: 9,
    DICE_SIDES: 6,
    GHOST_TURN_DELAY: 800,
    ANIMATION_DURATION: 800,
    RESIZE_DEBOUNCE: 250,
    MAX_TOKENS: 9
};

// Linux Mastery Categories - 9 categories with new color scheme
const masteryCategories = {
    'file-operations': { name: 'File Operations', icon: '📁', color: '#D72638', commands: ['ls', 'cd', 'pwd', 'find', 'cp', 'mv', 'rm', 'touch', 'mkdir', 'cat'] },
    'archives': { name: 'Archives', icon: '📦', color: '#F68E2E', commands: ['tar', 'zip', 'gzip', 'unzip', 'bzip2'] },
    'permissions': { name: 'Permissions', icon: '🔒', color: '#FFB300', commands: ['chmod', 'chown', 'sudo', 'umask', 'su'] },
    'text-processing': { name: 'Text Processing', icon: '📝', color: '#FFEB3B', commands: ['grep', 'sed', 'awk', 'head', 'tail', 'sort', 'uniq', 'less'] },
    'shell': { name: 'Shell & Scripting', icon: '🐚', color: '#B2FF59', commands: ['bash', 'export', 'echo', 'alias', 'history'] },
    'system': { name: 'System Monitoring', icon: '📊', color: '#00A86B', commands: ['ps', 'top', 'free', 'df', 'du', 'dmesg'] },
    'users': { name: 'User Management', icon: '👥', color: '#00B2A9', commands: ['useradd', 'passwd', 'id', 'groups', 'usermod'] },
    'networking': { name: 'Networking', icon: '🌐', color: '#3F51B5', commands: ['ping', 'ssh', 'wget', 'curl', 'netstat', 'ifconfig'] },
    'linux-foundations': { name: 'Linux Foundations', icon: '🐧', color: '#CBAACB', commands: ['man', 'apt', 'yum', 'dpkg', 'rpm'] }
};

// Audio file mapping
const AUDIO_FILES = {
    'intro': 'audio/01-intro.mp3',
    'file-operations': 'audio/02-file-operations.mp3',
    'archives': 'audio/03-archives.mp3',
    'permissions': 'audio/04-permissions.mp3',
    'text-processing': 'audio/05-text-processing.mp3',
    'shell': 'audio/06-shell.mp3',
    'system': 'audio/07-system.mp3',
    'users': 'audio/08-users.mp3',
    'networking': 'audio/09-networking.mp3',
    'linux-foundations': 'audio/10-linux-foundations.mp3'
};

// Color order for the rainbow pattern
const colorOrder = ['file-operations', 'archives', 'permissions', 'text-processing', 'shell', 'system', 'users', 'networking', 'linux-foundations'];

// Board configuration - 40 spaces total with even distribution
const boardSpaces = [];

// Generate board spaces with repeating pattern
let colorIndex = 0;
for (let i = 0; i < GAME_CONFIG.BOARD_SPACES; i++) {
    if (i === 0 || i === 10 || i === 20 || i === 30) {
        // Corner squares
        boardSpaces.push({ type: 'corner', name: '', command: 'corner', color: '#FF6F61' });
    } else {
        // Regular mastery squares
        const category = colorOrder[colorIndex % 9];
        boardSpaces.push({ type: 'mastery', name: '', command: category, category: category });
        colorIndex++;
    }
}

// Game state
let gameState = {
    currentPlayer: 'player',
    turnPhase: 'ROLL',
    playerPosition: 0,
    ghostPosition: 0,
    playerTokens: new Set(),
    ghostTokens: new Set(),
    playerConsecutiveRolls: 0,
    ghostConsecutiveRolls: 0,
    currentChallenge: null,
    diceValue: 0,
    gameActive: true,
    questionsAnswered: 0,
    recentlyAskedQuestions: [], // Track recently asked questions
    finalChallenge: false,
    ghostDifficulty: 'medium', // Ghost difficulty setting
    playerCorrectAnswers: {'file-operations':0,'archives':0,'permissions':0,'text-processing':0,'shell':0,'system':0,'users':0,'networking':0,'linux-foundations':0},
    ghostCorrectAnswers: {'file-operations':0,'archives':0,'permissions':0,'text-processing':0,'shell':0,'system':0,'users':0,'networking':0,'linux-foundations':0},
    wrongAnswers: [], // Track wrong answers for flash cards
    cardDifficulty: {} // Track difficulty of flash cards
};

// Terminal Challenge System
let currentTerminalChallenge = null;
let terminalAnswerShown = false;
let terminalPracticeMode = null;

// Flash Card System
let flashCardDeck = [];
let currentFlashCardIndex = 0;
let flashCardFlipped = false;
let flashCardReverseMode = false;

// Ghost turn timeout management
let ghostTurnTimeout = null;
let resizeTimeout = null;

// Body scroll lock functions
function lockBodyScroll() {
    document.body.classList.add('modal-open');
}

function unlockBodyScroll() {
    document.body.classList.remove('modal-open');
}

// Initialize game - FIXED
function initGame() {
    // Hide all modals on init
    document.getElementById('win-modal').style.display = 'none';
    document.getElementById('start-modal').style.display = 'none';
    document.getElementById('challenge-section').classList.remove('visible');
    
    createBoard();
    createMasteryGrid();
    updateUI();
    positionPlayerPieces();

    // Check if content is loaded
    if (typeof completeLinuxContent === 'undefined') {
        showNotification("⚠️ Please make sure complete-linux-content.js is loaded!", true);
        return;
    }

    // Check if terminal challenges are loaded
    if (typeof TERMINAL_CHALLENGES === 'undefined') {
        showNotification("⚠️ Please make sure complete-terminal-challenges.js is loaded!", true);
        return;
    }

    // Create dynamic content after DOM is ready
    setTimeout(() => {
        createAudioCategoryButtons();
        createFlashCardCategoryOptions();
    }, 100);

    // Show start modal after everything is initialized
    setTimeout(() => {
        document.getElementById('start-modal').style.display = 'flex';
        lockBodyScroll();
    }, 200);
}

// Start game with selected difficulty
function startGameWithDifficulty(difficulty) {
    gameState.ghostDifficulty = difficulty;

    // Update ghost name based on difficulty
    const ghostNames = {
        'easy': '🤖 LinuxBot Jr.',
        'medium': '🤖 LinuxBot',
        'hard': '🤖 LinuxBot Pro'
    };
    document.getElementById('ghost-name').textContent = ghostNames[difficulty];

    // Hide modal and start game
    document.getElementById('start-modal').style.display = 'none';
    unlockBodyScroll();
    showNotification(`Game started! Ghost difficulty: ${difficulty.toUpperCase()}`);

    console.log(`Game initialized with ${completeLinuxContent.challenges.length} questions available`);
}

// Create mastery grid
function createMasteryGrid() {
    const grid = document.getElementById('mastery-grid');
    grid.innerHTML = '';

    Object.entries(masteryCategories).forEach(([key, category]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'mastery-category';
        categoryDiv.id = `mastery-${key}`;
        categoryDiv.style.borderColor = category.color;
        categoryDiv.style.backgroundColor = category.color + '20'; // 20 = transparency

        categoryDiv.innerHTML = `
            <div class="mastery-icon">${category.icon}</div>
            <div class="mastery-name">${category.name}</div>
            <div class="mastery-progress" id="progress-${key}">0/2</div>
            <div class="mastery-token">✓</div>
        `;

        grid.appendChild(categoryDiv);
    });
}

// Create board spaces
function createBoard() {
    const board = document.getElementById('game-board');

    boardSpaces.forEach((space, index) => {
        const spaceElement = document.createElement('div');
        spaceElement.className = `board-space ${space.type}-space`;
        spaceElement.setAttribute('data-index', index);
        spaceElement.setAttribute('data-command', space.command || '');

        // Apply colors
        if (space.type === 'corner') {
            spaceElement.style.backgroundColor = space.color;
            spaceElement.style.borderColor = space.color;
            // Add icon for corners
            if (index === 0) spaceElement.textContent = '🏠';
            else if (index === 10) spaceElement.textContent = '🎯';
            else if (index === 20) spaceElement.textContent = '🎲';
            else if (index === 30) spaceElement.textContent = '⚡';
        } else if (space.type === 'mastery' && space.category) {
            const category = masteryCategories[space.category];
            if (category) {
                spaceElement.style.backgroundColor = category.color + 'CC'; // CC = 80% opacity
                spaceElement.style.borderColor = category.color;
            }
        }

        board.appendChild(spaceElement);
    });

    // Position spaces after creation
    positionBoardSpaces();
}

// Position board spaces dynamically
function positionBoardSpaces() {
    const board = document.getElementById('game-board');
    const boardRect = board.getBoundingClientRect();
    
    // Get the computed size of a space
    const testSpace = document.querySelector('.board-space');
    if (!testSpace) return;
    
    const spaceStyle = window.getComputedStyle(testSpace);
    const spaceWidth = parseFloat(spaceStyle.width);
    const spaceHeight = parseFloat(spaceStyle.height);
    
    // Calculate space size as percentage of board
    const spaceWidthPercent = spaceWidth / boardRect.width;
    const spaceHeightPercent = spaceHeight / boardRect.height;
    
    // Set margins to prevent edge overlap
    const marginPercent = 0.04; // 4% margin
    const maxPercent = 0.96 - spaceWidthPercent; // Account for space size
    
    boardSpaces.forEach((space, index) => {
        const spaceElement = document.querySelector(`[data-index="${index}"]`);
        if (!spaceElement) return;
        
        const position = calculateSpacePosition(index, marginPercent, maxPercent);
        
        spaceElement.style.left = (position.x * 100) + '%';
        spaceElement.style.top = (position.y * 100) + '%';
    });
}

// Calculate space position as percentage
function calculateSpacePosition(index, marginPercent, maxPercent) {
    const intervals = 10;
    const availableDistance = maxPercent - marginPercent;

    if (index < 11) {
        // Top row (0-10): 11 spaces
        return {
            x: marginPercent + (index * availableDistance / intervals),
            y: marginPercent
        };
    } else if (index < 20) {
        // Right side (11-19): 9 spaces (corners already counted)
        const sideIndex = index - 10;
        return {
            x: maxPercent,
            y: marginPercent + (sideIndex * availableDistance / intervals)
        };
    } else if (index < 31) {
        // Bottom row (20-30): 11 spaces (right to left)
        const sideIndex = index - 20;
        return {
            x: maxPercent - (sideIndex * availableDistance / intervals),
            y: maxPercent
        };
    } else {
        // Left side (31-39): 9 spaces (corners already counted, bottom to top)
        const sideIndex = index - 30;
        return {
            x: marginPercent,
            y: maxPercent - (sideIndex * availableDistance / intervals)
        };
    }
}

// Position player pieces on board
function positionPlayerPieces() {
    positionPiece('player-piece', gameState.playerPosition);
    positionPiece('ghost-piece', gameState.ghostPosition);
}

// Position a piece on the board
function positionPiece(pieceId, spaceIndex) {
    const piece = document.getElementById(pieceId);
    const space = document.querySelector(`[data-index="${spaceIndex}"]`);

    if (space) {
        const spaceRect = space.getBoundingClientRect();
        const boardRect = document.getElementById('game-board').getBoundingClientRect();
        const board = document.getElementById('game-board');

        // Calculate percentages
        const xPercent = ((spaceRect.left - boardRect.left + spaceRect.width / 2) / boardRect.width * 100);
        const yPercent = ((spaceRect.top - boardRect.top + spaceRect.height / 2) / boardRect.height * 100);

        // Offset for piece size (2% radius)
        piece.style.left = (xPercent - 2) + '%';
        piece.style.top = (yPercent - 2) + '%';
    }
}

// Show notification instead of alert
function showNotification(message, isError = false) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : ''}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Update UI
function updateUI() {
    // Calculate mastery progress (capped at 2 per category)
    const playerMasteryCount = Object.values(gameState.playerCorrectAnswers).reduce((sum, count) => sum + Math.min(count, GAME_CONFIG.MASTERY_REQUIREMENT), 0);
    const ghostMasteryCount = Object.values(gameState.ghostCorrectAnswers).reduce((sum, count) => sum + Math.min(count, GAME_CONFIG.MASTERY_REQUIREMENT), 0);
    const playerProgress = Math.round((playerMasteryCount / (GAME_CONFIG.TOTAL_CATEGORIES * GAME_CONFIG.MASTERY_REQUIREMENT)) * 100);
    const ghostProgress = Math.round((ghostMasteryCount / (GAME_CONFIG.TOTAL_CATEGORIES * GAME_CONFIG.MASTERY_REQUIREMENT)) * 100);

    document.getElementById('player-progress').textContent = playerProgress + '%';
    document.getElementById('ghost-progress').textContent = ghostProgress + '%';
    document.getElementById('player-tokens').textContent = gameState.playerTokens.size;
    document.getElementById('ghost-tokens').textContent = gameState.ghostTokens.size;

    // Update consecutive rolls
    const playerRollsLeft = GAME_CONFIG.MAX_CONSECUTIVE_ROLLS - gameState.playerConsecutiveRolls;
    const ghostRollsLeft = GAME_CONFIG.MAX_CONSECUTIVE_ROLLS - gameState.ghostConsecutiveRolls;
    document.getElementById('player-rolls').textContent = `Rolls left: ${playerRollsLeft}`;
    document.getElementById('ghost-rolls').textContent = `Rolls left: ${ghostRollsLeft}`;

    // Update active player indicators
    document.getElementById('player-card').classList.toggle('active', gameState.currentPlayer === 'player');
    document.getElementById('ghost-card').classList.toggle('active', gameState.currentPlayer === 'ghost');

    // Update turn indicator and controls
    const indicator = document.getElementById('turn-indicator');
    const dice = document.getElementById('dice');

    if (gameState.currentPlayer === 'player') {
        if (gameState.finalChallenge) {
            indicator.textContent = 'Final Challenge - Answer to Win!';
        } else {
            indicator.textContent = gameState.turnPhase === 'ROLL' ? 'Your Turn - Roll the Dice!' : 'Answer the Question!';
        }
        indicator.className = 'turn-indicator player-turn';
        dice.classList.toggle('disabled', gameState.turnPhase !== 'ROLL' || gameState.playerConsecutiveRolls >= GAME_CONFIG.MAX_CONSECUTIVE_ROLLS);
    } else {
        indicator.textContent = 'Ghost Turn - Thinking...';
        indicator.className = 'turn-indicator ghost-turn';
        dice.classList.add('disabled');
    }

    // Update mastery tokens
    updateMasteryDisplay();
}

// Update mastery display
function updateMasteryDisplay() {
    Object.keys(masteryCategories).forEach(key => {
        const element = document.getElementById(`mastery-${key}`);
        const progressElement = document.getElementById(`progress-${key}`);
        const correctAnswers = gameState.playerCorrectAnswers[key];

        // Update progress text
        if (gameState.playerTokens.has(key)) {
            progressElement.textContent = '2/2 ✓';
            element.classList.add('earned');
        } else {
            // Cap display at 2 even if we have more (from double progress)
            const displayProgress = Math.min(correctAnswers, GAME_CONFIG.MASTERY_REQUIREMENT);
            progressElement.textContent = `${displayProgress}/${GAME_CONFIG.MASTERY_REQUIREMENT}`;
            element.classList.remove('earned');
        }
    });
}

// Roll dice
function rollDice() {
    if (gameState.turnPhase !== 'ROLL' || gameState.currentPlayer !== 'player' || gameState.playerConsecutiveRolls >= GAME_CONFIG.MAX_CONSECUTIVE_ROLLS) {
        return;
    }

    const dice = document.getElementById('dice');
    dice.classList.add('rolling');
    gameState.turnPhase = 'QUESTION';
    updateUI();

    setTimeout(() => {
        const roll = Math.floor(Math.random() * GAME_CONFIG.DICE_SIDES) + 1;
        gameState.diceValue = roll;
        dice.textContent = roll;
        dice.classList.remove('rolling');

        // Show question for CURRENT position, don't move yet
        handleSpaceEffect('player', gameState.playerPosition);
    }, GAME_CONFIG.ANIMATION_DURATION);
}

// Move player - FIXED ghost win condition
function movePlayer(player, spaces) {
    const isPlayer = player === 'player';
    const currentPos = isPlayer ? gameState.playerPosition : gameState.ghostPosition;
    let newPos = (currentPos + spaces) % boardSpaces.length;

    // Handle passing HOME (position 0)
    if (currentPos + spaces >= boardSpaces.length) {
        // Passed HOME
        if (isPlayer) {
            showNotification("🎉 Passed HOME!");
        } else {
            showNotification("🤖 LinuxBot passed HOME!");
        }
    }

    // Check for collision and handle bump-back
    const otherPlayerPos = isPlayer ? gameState.ghostPosition : gameState.playerPosition;
    if (newPos === otherPlayerPos) {
        // Collision detected! Bump the other player back
        const bumpBackPos = (otherPlayerPos - spaces + boardSpaces.length) % boardSpaces.length;

        if (isPlayer) {
            gameState.ghostPosition = bumpBackPos;
            showNotification(`💥 Collision! LinuxBot bumped back ${spaces} spaces!`);
        } else {
            gameState.playerPosition = bumpBackPos;
            showNotification(`💥 LinuxBot collision! You were bumped back ${spaces} spaces!`);
        }
    }

    // Update moving player's position
    if (isPlayer) {
        gameState.playerPosition = newPos;
    } else {
        gameState.ghostPosition = newPos;
    }

    positionPlayerPieces();
    updateUI();

    // After movement, check for win conditions
    setTimeout(() => {
        // Check for player win - UPDATED to allow passing HOME
        if (isPlayer && gameState.playerTokens.size === GAME_CONFIG.MAX_TOKENS) {
            // Check if we're ON home or PASSED home
            if (newPos === 0 || (currentPos > newPos && currentPos + spaces >= boardSpaces.length)) {
                // Move to HOME position for the final challenge
                gameState.playerPosition = 0;
                positionPlayerPieces();
                
                setTimeout(() => {
                    attemptFinalChallenge();
                }, 500);
                return;
            }
        }

        // Check for ghost win
        if (!isPlayer && gameState.ghostTokens.size === GAME_CONFIG.MAX_TOKENS && newPos === 0) {
            // Game should end immediately
            gameState.gameActive = false;
            
            setTimeout(() => {
                showNotification("🤖 LinuxBot wins! All tokens collected and returned to HOME!");
                
                // Show loss modal after notification
                setTimeout(() => {
                    showGhostWinModal();
                }, 1000);
            }, 500);
            return; // Stop any further actions
        }

        // Only continue if game is still active
        if (gameState.gameActive) {
            // Continue turn if consecutive rolls available
            const consecutiveRolls = isPlayer ? gameState.playerConsecutiveRolls : gameState.ghostConsecutiveRolls;

            if (consecutiveRolls < GAME_CONFIG.MAX_CONSECUTIVE_ROLLS) {
                gameState.turnPhase = 'ROLL';
                updateUI();

                if (!isPlayer) {
                    // Auto-continue ghost turn
                    setTimeout(() => ghostTurn(), GAME_CONFIG.GHOST_TURN_DELAY);
                }
            } else {
                endTurn();
            }
        }
    }, 1000);
}

// Add function to show ghost win modal
function showGhostWinModal() {
    // Hide any existing modals
    document.getElementById('challenge-section').classList.remove('visible');
    document.getElementById('win-modal').style.display = 'none';
    
    gameState.gameActive = false;
    
    // Check if there are wrong answers to review
    if (gameState.wrongAnswers.length > 0) {
        // Show review INSTEAD of loss modal
        showGameReviewForLoss();
    } else {
        // No wrong answers, show loss modal directly
        showLossModalDirectly();
    }
}

// Review function for loss
function showGameReviewForLoss() {
    // Create review modal
    const reviewModal = document.createElement('div');
    reviewModal.className = 'review-modal';
    reviewModal.id = 'loss-review-modal';
    
    reviewModal.innerHTML = `
        <div class="review-content">
            <h2>😔 LinuxBot Won This Time!</h2>
            <p>You got ${gameState.wrongAnswers.length} questions wrong. Would you like to review them to improve for next time?</p>
            <div class="review-buttons">
                <button class="review-btn primary" onclick="startReviewFlashCards()">
                    📚 Review & Learn
                </button>
                <button class="review-btn secondary" onclick="skipToLossModal()">
                    🔄 Try Again Now
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(reviewModal);
    
    // Show with animation
    setTimeout(() => {
        reviewModal.classList.add('show');
    }, 10);
}

// Helper function to show loss modal
function showLossModalDirectly() {
    let lossModal = document.getElementById('loss-modal');
    
    if (!lossModal) {
        lossModal = document.createElement('div');
        lossModal.className = 'win-modal';
        lossModal.id = 'loss-modal';
        lossModal.style.display = 'none';
        document.body.appendChild(lossModal);
    }
    
    lossModal.innerHTML = `
        <div class="win-content">
            <div class="win-title" style="color: #ff6b35;">🤖 LinuxBot Wins! 🤖</div>
            <p style="font-size: 1.2em; margin-bottom: 30px;">
                LinuxBot mastered all Linux commands and returned home first!<br>
                Better luck next time!
            </p>
            <button class="control-btn" onclick="newGame()">Try Again</button>
        </div>
    `;
    
    lossModal.style.display = 'flex';
    lockBodyScroll();
}

// Skip functions to go directly to win/loss modals:
function skipToWinModal() {
    closeReview();
    document.getElementById('win-modal').style.display = 'flex';
    lockBodyScroll();
}

function skipToLossModal() {
    closeReview();
    showLossModalDirectly();
}

// Handle space effects
function handleSpaceEffect(player, position) {
    const space = boardSpaces[position];
    const isPlayer = player === 'player';

    if (space.type === 'corner') {
        // Corner squares - special effects
        if (position === 0) {
            // HOME space
            const result = getQuestionForStrugglingCategory(player);
            if (result.question) {
                const categoryName = result.category ? masteryCategories[result.category].name : 'Practice';
                showChallenge(result.question, isPlayer, `HOME - ${categoryName}`, result.category);
            } else {
                endTurn();
            }
        } else if (position === 10) {
            // Top-right corner - Challenge
            handleChallengeSpace(player);
        } else if (position === 20) {
            // Bottom-right corner - Wild
            handleWildSpace(player);
        } else if (position === 30) {
            // Bottom-left corner - Power
            handlePowerSpace(player);  // THIS MIGHT BE MISSING!
        }
    } else if (space.type === 'mastery') {
        // Regular mastery squares
        const result = getQuestionForCategory(space.category);
        if (result.question) {
            const categoryName = masteryCategories[space.category].name;
            showChallenge(result.question, isPlayer, categoryName, space.category);
        } else {
            if (isPlayer) {
                showNotification(`No questions available for ${masteryCategories[space.category].name}. Skipping turn.`);
            }
            endTurn();
        }
    } else {
        endTurn();
    }
}

// Handle power space
function handlePowerSpace(player) {
    const isPlayer = player === 'player';
    const bonusEffects = [
        { type: 'extraRoll', message: '⚡ Power Up! Take an extra turn!' },
        { type: 'progress', message: '⚡ Power Up! Free mastery progress!' }
    ];

    const effect = bonusEffects[Math.floor(Math.random() * bonusEffects.length)];

    if (effect.type === 'extraRoll') {
        // Don't count this as a roll
        if (isPlayer) {
            showNotification(effect.message);  // THIS SHOULD SHOW THE NOTIFICATION
            gameState.playerConsecutiveRolls = Math.max(0, gameState.playerConsecutiveRolls - 1);
        } else {
            showNotification(`🤖 LinuxBot: ${effect.message}`);
            gameState.ghostConsecutiveRolls = Math.max(0, gameState.ghostConsecutiveRolls - 1);
        }
        
        // Move the player forward with their dice roll
        movePlayer(player, gameState.diceValue);
        
    } else if (effect.type === 'progress') {
        // Add progress to a struggling category
        const correctAnswers = isPlayer ? gameState.playerCorrectAnswers : gameState.ghostCorrectAnswers;
        const tokens = isPlayer ? gameState.playerTokens : gameState.ghostTokens;

        // Find categories with lowest progress
        let lowestProgress = GAME_CONFIG.MASTERY_REQUIREMENT;
        let strugglingCategories = [];

        Object.entries(correctAnswers).forEach(([category, count]) => {
            if (!tokens.has(category) && count < GAME_CONFIG.MASTERY_REQUIREMENT) {
                if (count < lowestProgress) {
                    lowestProgress = count;
                    strugglingCategories = [category];
                } else if (count === lowestProgress) {
                    strugglingCategories.push(category);
                }
            }
        });

        if (strugglingCategories.length > 0) {
            const randomCategory = strugglingCategories[Math.floor(Math.random() * strugglingCategories.length)];
            correctAnswers[randomCategory]++;
            checkForMastery(player, randomCategory);
            if (isPlayer) {
                showNotification(`${effect.message} Progress in ${masteryCategories[randomCategory].name}!`);
            } else {
                showNotification(`🤖 LinuxBot: ${effect.message} Progress in ${masteryCategories[randomCategory].name}!`);
            }
        } else {
            // All categories mastered, just show the power up message
            if (isPlayer) {
                showNotification("⚡ Power Up! (All categories already mastered)");
            }
        }
        
        // Move the player forward
        movePlayer(player, gameState.diceValue);
    }
}

// Handle challenge space
function handleChallengeSpace(player) {
    // Question from struggling category, but worth 2 progress!
    const result = getQuestionForStrugglingCategory(player);
    if (result.question) {
        const categoryName = result.category ? masteryCategories[result.category].name : 'Challenge';
        // Mark this as a double-progress challenge
        result.question.doubleProgress = true;
        showChallenge(result.question, player === 'player', `CHALLENGE - ${categoryName} (2x Progress!)`, result.category);
    } else {
        endTurn();
    }
}

// Handle wild space
function handleWildSpace(player) {
    const isPlayer = player === 'player';
    const effects = [
        { name: "Random Mastery", mastery: true },
        { name: "Double Move", doubleMove: true },
        { name: "Free Token Progress", progress: true }
    ];

    const effect = effects[Math.floor(Math.random() * effects.length)];

    if (effect.mastery) {
        // Question from struggling category
        const result = getQuestionForStrugglingCategory(player);
        if (result.question) {
            const categoryName = result.category ? masteryCategories[result.category].name : 'Wild Card';
            showChallenge(result.question, isPlayer, `Wild - ${categoryName}`, result.category);
        } else {
            endTurn();
        }
    } else if (effect.doubleMove) {
        if (isPlayer) {
            showNotification("🎲 Wild! Double movement!");
        } else {
            showNotification("🤖 LinuxBot: Wild! Double movement!");
        }
        gameState[isPlayer ? 'playerConsecutiveRolls' : 'ghostConsecutiveRolls']++;
        movePlayer(player, gameState.diceValue * 2);
    } else if (effect.progress) {
        // Add progress to a struggling category
        const correctAnswers = isPlayer ? gameState.playerCorrectAnswers : gameState.ghostCorrectAnswers;
        const tokens = isPlayer ? gameState.playerTokens : gameState.ghostTokens;

        // Find categories with lowest progress
        let lowestProgress = GAME_CONFIG.MASTERY_REQUIREMENT;
        let strugglingCategories = [];

        Object.entries(correctAnswers).forEach(([category, count]) => {
            if (!tokens.has(category) && count < GAME_CONFIG.MASTERY_REQUIREMENT) {
                if (count < lowestProgress) {
                    lowestProgress = count;
                    strugglingCategories = [category];
                } else if (count === lowestProgress) {
                    strugglingCategories.push(category);
                }
            }
        });

        if (strugglingCategories.length > 0) {
            const randomCategory = strugglingCategories[Math.floor(Math.random() * strugglingCategories.length)];
            correctAnswers[randomCategory]++;
            checkForMastery(player, randomCategory);
            if (isPlayer) {
                showNotification(`🎲 Wild! Progress in ${masteryCategories[randomCategory].name}!`);
            } else {
                showNotification(`🤖 LinuxBot: Wild! Progress in ${masteryCategories[randomCategory].name}!`);
            }
        }
        gameState[isPlayer ? 'playerConsecutiveRolls' : 'ghostConsecutiveRolls']++;
        movePlayer(player, gameState.diceValue);
    }
}

// Get question for a player's struggling category
function getQuestionForStrugglingCategory(player) {
    const correctAnswers = player === 'player' ? gameState.playerCorrectAnswers : gameState.ghostCorrectAnswers;
    const tokens = player === 'player' ? gameState.playerTokens : gameState.ghostTokens;

    // Find categories with the lowest progress that aren't yet mastered
    let lowestProgress = GAME_CONFIG.MASTERY_REQUIREMENT;
    let strugglingCategories = [];

    Object.entries(correctAnswers).forEach(([category, count]) => {
        if (!tokens.has(category)) {
            if (count < lowestProgress) {
                lowestProgress = count;
                strugglingCategories = [category];
            } else if (count === lowestProgress) {
                strugglingCategories.push(category);
            }
        }
    });

    // If all categories are mastered, get a truly random question
    if (strugglingCategories.length === 0) {
        const randomCategoryKey = colorOrder[Math.floor(Math.random() * colorOrder.length)];
            return getQuestionForCategory(randomCategoryKey);
    }

    // Pick a random category from the list of struggling ones
    const targetCategory = strugglingCategories[Math.floor(Math.random() * strugglingCategories.length)];
    return getQuestionForCategory(targetCategory);
}

// Get question for a specific category - IMPROVED RANDOMIZATION
function getQuestionForCategory(category) {
    if (!completeLinuxContent || !completeLinuxContent.challenges) {
        console.log("No content loaded!");
        return { question: null, category: null };
    }

    const categoryCommands = masteryCategories[category]?.commands || [];

    // Get questions for this category
    let potentialQuestions = completeLinuxContent.challenges.filter(q => {
        const hasCommand = categoryCommands.some(cmd =>
            q.question.toLowerCase().includes(cmd) ||
            q.explanation.toLowerCase().includes(cmd) ||
            (q.relatedCard && q.relatedCard.toLowerCase() === cmd.toLowerCase())
        );

        if (category === 'linux-foundations' && !hasCommand) {
            const otherCategories = Object.keys(masteryCategories).filter(c => c !== 'linux-foundations');
            const belongsElsewhere = otherCategories.some(otherCat => {
                const otherCommands = masteryCategories[otherCat].commands;
                return otherCommands.some(cmd =>
                    q.question.toLowerCase().includes(cmd) ||
                    q.explanation.toLowerCase().includes(cmd)
                );
            });
            if (!belongsElsewhere) return true;
        }

        return hasCommand;
    });

    // Better randomization - shuffle the array first
    potentialQuestions = potentialQuestions.sort(() => Math.random() - 0.5);

    // Filter out recently asked questions
    let filteredQuestions = potentialQuestions.filter(q =>
        !gameState.recentlyAskedQuestions.includes(q.question)
    );

    // If we've asked more than half the questions, reduce the recent questions list
    if (filteredQuestions.length < 3 && potentialQuestions.length > 6) {
        gameState.recentlyAskedQuestions = gameState.recentlyAskedQuestions.slice(-5);
        filteredQuestions = potentialQuestions.filter(q =>
            !gameState.recentlyAskedQuestions.includes(q.question)
        );
    }

    if (filteredQuestions.length === 0 && potentialQuestions.length > 0) {
        filteredQuestions = potentialQuestions;
    }

    if (filteredQuestions.length === 0) {
        console.error(`No questions found for category: ${category}. Using random question as fallback.`);
        return { question: getRandomQuestion(), category: null };
    }

    // Use better randomization
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    const question = filteredQuestions[randomIndex];
    return { question, category };
}

// Get random question (as a fallback)
function getRandomQuestion() {
    if (!completeLinuxContent || !completeLinuxContent.challenges) {
        return null;
    }

    // Filter out recently asked questions
    let filteredQuestions = completeLinuxContent.challenges.filter(q =>
        !gameState.recentlyAskedQuestions.includes(q.question)
    );

    if (filteredQuestions.length === 0) {
        console.warn("All questions have been asked recently. Resetting pool to allow repeats.");
        filteredQuestions = completeLinuxContent.challenges;
    }

    return filteredQuestions.length > 0 ? filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)] : null;
}

// Show challenge - UPDATED with smooth transition
function showChallenge(question, isPlayer, commandName, category) {
    // Track recently asked questions
    if (question) {
        gameState.recentlyAskedQuestions.unshift(question.question);
        if (gameState.recentlyAskedQuestions.length > GAME_CONFIG.MAX_RECENT_QUESTIONS) {
            gameState.recentlyAskedQuestions.pop();
        }
    } else {
        console.error("showChallenge was called with no question!");
        if (isPlayer) {
            showNotification("No questions available for this space!", true);
        }
        endTurn();
        return;
    }

    gameState.currentChallenge = { question, isPlayer, commandName, category };
    gameState.turnPhase = 'QUESTION';

    if (!isPlayer) {
        // Ghost answers automatically
        setTimeout(() => {
            ghostAnswerQuestion();
        }, GAME_CONFIG.GHOST_TURN_DELAY + Math.random() * 700);
        return;
    }

    // Show challenge UI for player with smooth transition
    const challengeSection = document.getElementById('challenge-section');
    
    // Setup content first
    let title = `${commandName.toUpperCase()}`;
    if (category && masteryCategories[category]) {
        title = commandName.includes('CHALLENGE') || commandName.includes('HOME') || commandName.includes('Wild')
            ? `${commandName.toUpperCase()}`
            : `${masteryCategories[category].icon} ${commandName.toUpperCase()}`;
    }
    document.getElementById('challenge-title').textContent = title;

    const difficultyEl = document.getElementById('challenge-difficulty');
    if (question.doubleProgress) {
        difficultyEl.textContent = '2x Progress!';
        difficultyEl.className = 'challenge-difficulty difficulty-special';
        difficultyEl.style.display = 'block';
    } else {
        difficultyEl.style.display = 'none';
    }

    document.getElementById('challenge-question').textContent = question.question;

    const optionsContainer = document.getElementById('challenge-options');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => playerAnswerQuestion(index);
        optionsContainer.appendChild(btn);
    });

    // Show with smooth transition
    challengeSection.classList.add('visible');
    lockBodyScroll();

    updateUI();
}

// Check for mastery token earned
function checkForMastery(player, category) {
    const isPlayer = player === 'player';
    const correctAnswers = isPlayer ? gameState.playerCorrectAnswers[category] : gameState.ghostCorrectAnswers[category];
    const tokens = isPlayer ? gameState.playerTokens : gameState.ghostTokens;

    console.log(`${player} got ${category} question correct. Total: ${correctAnswers}/${GAME_CONFIG.MASTERY_REQUIREMENT}`);

    // Need 2 or more correct answers in a category to earn mastery
    if (correctAnswers >= GAME_CONFIG.MASTERY_REQUIREMENT && !tokens.has(category)) {
        tokens.add(category);
        const categoryName = masteryCategories[category].name;

        if (isPlayer) {
            showNotification(`🏆 Mastery Token Earned: ${categoryName}! (${tokens.size}/${GAME_CONFIG.MAX_TOKENS})`);
        } else {
            showNotification(`🤖 LinuxBot earned ${categoryName} mastery! (${tokens.size}/${GAME_CONFIG.MAX_TOKENS})`);
        }

        console.log(`${player} earned ${category} mastery token!`);
    }
}

// Player answers question
function playerAnswerQuestion(selectedIndex) {
    const challenge = gameState.currentChallenge;
    const buttons = document.querySelectorAll('.option-btn');

    // Check if this is a multi-select question
    const isMultiSelect = Array.isArray(challenge.question.correct);

    if (isMultiSelect) {
        // Handle multi-select questions
        handleMultiSelectAnswer(selectedIndex, buttons);
    } else {
        // Handle single-select questions
        buttons.forEach(btn => btn.disabled = true);

        const isCorrect = selectedIndex === challenge.question.correct;

        if (isCorrect) {
            buttons[selectedIndex].classList.add('correct');
            gameState.questionsAnswered++;

            // Track correct answers by category and check for mastery ONLY if not a retry
            if (challenge.category && !challenge.isRetry) {
                // Double progress for challenge squares!
                const progressAmount = challenge.question.doubleProgress ? 2 : 1;
                gameState.playerCorrectAnswers[challenge.category] += progressAmount;
                checkForMastery('player', challenge.category);

                if (progressAmount === 2) {
                    showNotification(`✅ Correct! Double progress in ${masteryCategories[challenge.category].name}!`);
                } else {
                    showNotification(`✅ Correct!`);
                }
            } else {
                showNotification(`✅ Correct!`);
            }

            gameState.playerConsecutiveRolls++;
            challenge.shouldMove = true;
            challenge.isCorrect = true;

        } else {
            buttons[selectedIndex].classList.add('incorrect');
            // Don't highlight correct answer yet if retry available

            // Track wrong answer for flash cards
            if (challenge.category) {
                gameState.wrongAnswers.push({
                    question: challenge.question,
                    category: challenge.category,
                    timestamp: Date.now()
                });
            }

            // Check if player has tokens and offer retry
            if (gameState.playerTokens.size > 0) {
                // Show retry option WITHOUT revealing answer
                showRetryOption();
                return; // Don't show explanation yet
            }

            // Only show correct answer if no retry available
            buttons[challenge.question.correct].classList.add('correct');

            // End turn on wrong answer
            gameState.playerConsecutiveRolls = GAME_CONFIG.MAX_CONSECUTIVE_ROLLS; // Force end turn
            challenge.shouldMove = false;
            challenge.isCorrect = false;
        }

        // Show explanation
        setTimeout(() => {
            showExplanation(isCorrect, challenge.question.explanation);
        }, 1000);
    }

    updateUI();
}

// Handle multi-select question answers
function handleMultiSelectAnswer(selectedIndex, buttons) {
    const challenge = gameState.currentChallenge;
    const correctAnswers = challenge.question.correct;

    // Initialize selected array if not exists
    if (!challenge.selectedAnswers) {
        challenge.selectedAnswers = [];
    }

    // Toggle selection
    if (challenge.selectedAnswers.includes(selectedIndex)) {
        // Deselect
        challenge.selectedAnswers = challenge.selectedAnswers.filter(i => i !== selectedIndex);
        buttons[selectedIndex].classList.remove('selected');
    } else {
        // Select
        challenge.selectedAnswers.push(selectedIndex);
        buttons[selectedIndex].classList.add('selected');
    }

    // Check if we have selected enough answers
    if (challenge.selectedAnswers.length >= correctAnswers.length) {
        // Check if all selected are correct
        const allCorrect = challenge.selectedAnswers.every(index => correctAnswers.includes(index)) &&
                            challenge.selectedAnswers.length === correctAnswers.length;

        // Disable all buttons and show results
        buttons.forEach(btn => btn.disabled = true);

        if (allCorrect) {
            // Highlight correct answers
            buttons.forEach((btn, index) => {
                if (correctAnswers.includes(index)) {
                    btn.classList.add('correct');
                }
            });

            gameState.questionsAnswered++;

            // Track correct answers by category and check for mastery ONLY if not a retry
            if (challenge.category && !challenge.isRetry) {
                const progressAmount = challenge.question.doubleProgress ? 2 : 1;
                gameState.playerCorrectAnswers[challenge.category] += progressAmount;
                checkForMastery('player', challenge.category);
                if (progressAmount === 2) {
                    showNotification(`✅ Correct! Double progress in ${masteryCategories[challenge.category].name}!`);
                } else {
                    showNotification(`✅ Correct!`);
                }
            } else {
                showNotification(`✅ Correct!`);
            }

            gameState.playerConsecutiveRolls++;
            challenge.shouldMove = true;
            challenge.isCorrect = true;
        } else {
            // Wrong answer
            gameState.playerConsecutiveRolls = GAME_CONFIG.MAX_CONSECUTIVE_ROLLS; // Force end turn
            challenge.shouldMove = false;
            challenge.isCorrect = false;

            // Track wrong answer for flash cards
            if (challenge.category) {
                gameState.wrongAnswers.push({
                    question: challenge.question,
                    category: challenge.category,
                    timestamp: Date.now()
                });
            }

            // Check if player has tokens for retry
            if (gameState.playerTokens.size > 0) {
                // Don't show correct answers yet
                showRetryOption();
                return;
            }

            // Only highlight correct/incorrect answers if no retry available
            buttons.forEach((btn, index) => {
                if (correctAnswers.includes(index)) {
                    btn.classList.add('correct');
                } else if (challenge.selectedAnswers.includes(index)) {
                    btn.classList.add('incorrect');
                }
            });
        }

        // Show explanation
        setTimeout(() => {
            showExplanation(allCorrect, challenge.question.explanation);
        }, 1000);
    }
}

// Ghost answers question - UPDATED
function ghostAnswerQuestion() {
    const challenge = gameState.currentChallenge;

    // Base accuracy by difficulty level
    const difficultySettings = {
        easy: {
            baseAccuracy: 0.60,
            specialtyBonus: 0.10,
            learningRate: 0.01,
            variance: 0.15
        },
        medium: {
            baseAccuracy: 0.75,
            specialtyBonus: 0.05,
            learningRate: 0.02,
            variance: 0.10
        },
        hard: {
            baseAccuracy: 0.85,
            specialtyBonus: 0.05,
            learningRate: 0.03,
            variance: 0.05
        }
    };

    const settings = difficultySettings[gameState.ghostDifficulty];
    let accuracy = settings.baseAccuracy;

    // Ghost specialties
    const ghostSpecialties = {
        easy: ['file-operations'],
        medium: ['file-operations', 'system', 'permissions'],
        hard: ['file-operations', 'system', 'permissions', 'text-processing', 'shell']
    };

    if (challenge.category && ghostSpecialties[gameState.ghostDifficulty].includes(challenge.category)) {
        accuracy += settings.specialtyBonus;
    }

    // Learning effect
    if(challenge.category){
        const learningBonus = Math.min(
            gameState.ghostCorrectAnswers[challenge.category] * settings.learningRate,
            0.1
        );
        accuracy += learningBonus;
    }

    // Add variance
    accuracy += (Math.random() - 0.5) * settings.variance;

    // Cap accuracy
    accuracy = Math.min(Math.max(accuracy, 0.3), 0.95);

    const isCorrect = Math.random() < accuracy;

    if (isCorrect) {
        // Track correct answers by category and check for mastery
        if (challenge.category) {
            const progressAmount = challenge.question.doubleProgress ? 2 : 1;
            gameState.ghostCorrectAnswers[challenge.category] += progressAmount;
            checkForMastery('ghost', challenge.category);

            if (progressAmount === 2) {
                showNotification(`🤖 LinuxBot answered correctly! Double progress in ${masteryCategories[challenge.category].name}!`);
            } else {
                showNotification("🤖 LinuxBot answered correctly!");
            }
        } else {
            showNotification("🤖 LinuxBot answered correctly!");
        }

        // Continue turn
        gameState.ghostConsecutiveRolls++;
        challenge.shouldMove = true;
        challenge.isCorrect = true;
    } else {
        gameState.ghostConsecutiveRolls = GAME_CONFIG.MAX_CONSECUTIVE_ROLLS; // Force end turn
        challenge.shouldMove = false;
        challenge.isCorrect = false;

        // More specific failure messages
        const failMessages = [
            "❌ LinuxBot got confused by that one!",
            "❌ LinuxBot second-guessed itself!",
            "❌ LinuxBot overthought it!",
            "❌ LinuxBot misremembered!"
        ];
        showNotification(failMessages[Math.floor(Math.random() * failMessages.length)]);
    }

    updateUI();

    setTimeout(() => {
        // Move ghost if correct, then check for win
        if (challenge.shouldMove && challenge.isCorrect) {
            movePlayer('ghost', gameState.diceValue);
        } else {
            // Continue or end turn based on consecutive rolls and correctness
            if (gameState.ghostConsecutiveRolls < GAME_CONFIG.MAX_CONSECUTIVE_ROLLS && challenge.isCorrect) {
                gameState.turnPhase = 'ROLL';
                setTimeout(() => ghostTurn(), GAME_CONFIG.GHOST_TURN_DELAY);
            } else {
                endTurn();
            }
        }
    }, 1200);
}

// Show retry option when player gets wrong answer
function showRetryOption() {
    // Find which token would be used
    const tokenArray = Array.from(gameState.playerTokens);
    
    // Sort tokens by how many correct answers in each category (descending)
    tokenArray.sort((a, b) => {
        return gameState.playerCorrectAnswers[b] - gameState.playerCorrectAnswers[a];
    });
    
    const tokenToUse = tokenArray[0];

    // Store the chosen token in the current challenge state
    if (gameState.currentChallenge) {
        gameState.currentChallenge.tokenToUseForRetry = tokenToUse;
    }
    
    // Update retry section text
    document.getElementById('retry-message').innerHTML = `You can spend your <strong>${masteryCategories[tokenToUse].name}</strong> mastery token to try again, or continue with no movement.`;
    document.getElementById('retry-section').style.display = 'block';
}

// Use a token to retry the question
function useRetryToken() {
    // Use the token that was pre-determined and shown to the player
    const removedToken = gameState.currentChallenge?.tokenToUseForRetry;

    // Validate token still exists
    if (!removedToken || !gameState.playerTokens.has(removedToken)) {
        console.error("Retry failed: Token no longer available");
        showNotification("Token no longer available. Skipping retry.", true);
        skipRetry();
        return;
    }
    
    gameState.playerTokens.delete(removedToken);
    
    // Mark this as a retry to prevent mastery progress
    gameState.currentChallenge.isRetry = true;
    
    // Also clear any double progress flag
    if (gameState.currentChallenge.question) {
        gameState.currentChallenge.question.doubleProgress = false;
    }
    
    // Reset multi-select answers if applicable
    if (gameState.currentChallenge.selectedAnswers) {
        gameState.currentChallenge.selectedAnswers = [];
    }
    
    showNotification(`🎯 Used ${masteryCategories[removedToken].name} token for retry!`);
    
    // Reset the question
    document.getElementById('retry-section').style.display = 'none';
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('incorrect', 'correct', 'selected');
    });
    
    updateUI();
}

// Skip retry and end turn
function skipRetry() {
    document.getElementById('retry-section').style.display = 'none';
    const challenge = gameState.currentChallenge;
    const buttons = document.querySelectorAll('.option-btn');

    // Now show the correct answer(s)
    if (Array.isArray(challenge.question.correct)) {
        // Multi-select
        challenge.question.correct.forEach(index => {
            buttons[index].classList.add('correct');
        });
    } else {
        // Single-select
        buttons[challenge.question.correct].classList.add('correct');
    }

    // End turn on wrong answer
    gameState.playerConsecutiveRolls = GAME_CONFIG.MAX_CONSECUTIVE_ROLLS; // Force end turn
    challenge.shouldMove = false;
    challenge.isCorrect = false;

    // Show explanation
    setTimeout(() => {
        showExplanation(false, challenge.question.explanation);
    }, 500);
}

// Show explanation
function showExplanation(isCorrect, explanation) {
    const explanationSection = document.getElementById('explanation-section');
    const resultEl = document.getElementById('explanation-result');
    const textEl = document.getElementById('explanation-text');

    if (!explanationSection || !resultEl || !textEl) {
        console.error('Explanation elements not found');
        return;
    }

    resultEl.textContent = isCorrect ? '✅ Correct!' : '❌ Incorrect!';
    resultEl.className = `explanation-result ${isCorrect ? 'correct' : 'incorrect'}`;
    
    // Use textContent for safety (no HTML)
    textEl.textContent = explanation;

    explanationSection.classList.add('show');
}

// Continue game after explanation - UPDATED with smooth transition
function continueGame() {
    const challengeSection = document.getElementById('challenge-section');
    challengeSection.classList.remove('visible');
    document.getElementById('explanation-section').classList.remove('show');
    
    // Wait for transition before unlocking scroll
    setTimeout(() => {
        unlockBodyScroll();
    }, 300);

    const challenge = gameState.currentChallenge;

    // Check if this was the final challenge and player won
    if (gameState.finalChallenge) {
        if (challenge && challenge.isCorrect) {
            // Player won!
            setTimeout(() => {
                handlePlayerWin();
            }, 500);
            return;
        } else {
            // Failed final challenge - STAY ON HOME
            showNotification("❌ Final challenge failed! You must go around the board and pass HOME again for another attempt!");
            gameState.finalChallenge = false;
            
            // End turn
            endTurn();
            return;
        }
    }

    // Move player if they got it correct
    if (challenge && challenge.shouldMove && challenge.isCorrect) {
        movePlayer('player', gameState.diceValue);
        return; // Movement will handle next steps
    }

    // Check for player win (collect all tokens and return to HOME)
    if (gameState.playerTokens.size === GAME_CONFIG.MAX_TOKENS && gameState.playerPosition === 0 && !gameState.finalChallenge) {
        attemptFinalChallenge();
        return;
    }

    // Continue turn or end turn
    if (gameState.playerConsecutiveRolls < GAME_CONFIG.MAX_CONSECUTIVE_ROLLS && challenge && challenge.isCorrect) {
        gameState.turnPhase = 'ROLL';
        updateUI();
    } else {
        endTurn();
    }
}

// Handle player win
function handlePlayerWin() {
    gameState.gameActive = false;
    
    // Check if there are wrong answers to review
    if (gameState.wrongAnswers.length > 0) {
        // Show review INSTEAD of win modal
        showGameReviewForWin();
    } else {
        // No wrong answers, show win modal directly
        document.getElementById('win-modal').style.display = 'flex';
        lockBodyScroll();
    }
}

// Function for win review
function showGameReviewForWin() {
    // Create review modal
    const reviewModal = document.createElement('div');
    reviewModal.className = 'review-modal';
    reviewModal.id = 'win-review-modal';
    
    reviewModal.innerHTML = `
        <div class="review-content">
            <h2>🏆 Congratulations! You Won!</h2>
            <p>You got ${gameState.wrongAnswers.length} questions wrong during the game. Would you like to review them before celebrating?</p>
            <div class="review-buttons">
                <button class="review-btn primary" onclick="startReviewFlashCards()">
                    📚 Review Mistakes First
                </button>
                <button class="review-btn secondary" onclick="skipToWinModal()">
                    🎉 Celebrate Now!
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(reviewModal);
    
    // Show with animation
    setTimeout(() => {
        reviewModal.classList.add('show');
    }, 10);
}

// Start flash cards for wrong answers
function startReviewFlashCards() {
    closeReview();
    
    // Create flash cards from wrong answers
    flashCardDeck = [];
    gameState.wrongAnswers.forEach(wrong => {
        flashCardDeck.push({
            front: wrong.question.question,
            back: wrong.question.explanation,
            category: wrong.category
        });
    });
    
    // Shuffle deck
    flashCardDeck.sort(() => Math.random() - 0.5);
    
    currentFlashCardIndex = 0;
    document.getElementById('flashcard-modal').style.display = 'flex';
    lockBodyScroll();
    showCurrentFlashCard();
}

// Close review modal
function closeReview() {
    const winReviewModal = document.getElementById('win-review-modal');
    const lossReviewModal = document.getElementById('loss-review-modal');
    const oldReviewModal = document.querySelector('.review-modal');
    
    [winReviewModal, lossReviewModal, oldReviewModal].forEach(modal => {
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        }
    });
}

// Attempt final challenge
function attemptFinalChallenge() {
    console.log(`Player has ${gameState.playerTokens.size}/${GAME_CONFIG.MAX_TOKENS} tokens, attempting final challenge!`);
    gameState.finalChallenge = true;
    
    // Strategy 1: Find category with most wrong answers
    let worstCategory = null;
    let categoryWrongCounts = {};
    
    // Count wrong answers by category
    gameState.wrongAnswers.forEach(wrong => {
        if (wrong.category) {
            categoryWrongCounts[wrong.category] = (categoryWrongCounts[wrong.category] || 0) + 1;
        }
    });
    
    // Find the category with most wrong answers
    let maxWrong = 0;
    let tiedCategories = [];
    
    Object.entries(categoryWrongCounts).forEach(([category, count]) => {
        if (count > maxWrong) {
            maxWrong = count;
            worstCategory = category;
            tiedCategories = [category];
        } else if (count === maxWrong && count > 0) {
            tiedCategories.push(category);
        }
    });
    
    // If multiple categories tied for most wrong, pick randomly from them
    if (tiedCategories.length > 1) {
        worstCategory = tiedCategories[Math.floor(Math.random() * tiedCategories.length)];
    }
    
    let finalQuestion;
    let challengeDescription;
    
    if (worstCategory && maxWrong > 0) {
        // We have wrong answers - use the worst category
        const result = getQuestionForCategory(worstCategory);
        finalQuestion = result.question;
        challengeDescription = `${masteryCategories[worstCategory].name} (${maxWrong} wrong answer${maxWrong > 1 ? 's' : ''} during game)`;
    } else {
        // Strategy 2: No wrong answers at all - this player is really good!
        // Pick a random category for an extra challenge
        const allCategories = Object.keys(masteryCategories);
        const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
        const result = getQuestionForCategory(randomCategory);
        finalQuestion = result.question;
        worstCategory = randomCategory; // Set this for the showChallenge call
        challengeDescription = `${masteryCategories[randomCategory].name} (Perfect game - random category!)`;
    }
    
    showNotification(`🏆 FINAL CHALLENGE! Category: ${challengeDescription}`);
    
    setTimeout(() => {
        showChallenge(finalQuestion, true, 'FINAL CHALLENGE', worstCategory);
    }, 2000);
}

// End current turn - UPDATED
function endTurn() {
    if (!gameState.gameActive) {
        return; // Don't continue if game has ended
    }
    
    gameState.turnPhase = 'ROLL';
    gameState.playerConsecutiveRolls = 0;
    gameState.ghostConsecutiveRolls = 0;
    gameState.currentPlayer = gameState.currentPlayer === 'player' ? 'ghost' : 'player';
    gameState.finalChallenge = false;

    // Reset dice to original emoji
    document.getElementById('dice').textContent = '🎲';

    updateUI();

    // Auto-trigger ghost turn only if game is still active
    if (gameState.currentPlayer === 'ghost' && gameState.gameActive) {
        setTimeout(() => {
            ghostTurn();
        }, 600);
    }
}

// Ghost turn - with timeout management
function ghostTurn() {
    // Cancel any pending ghost turn
    if (ghostTurnTimeout) {
        clearTimeout(ghostTurnTimeout);
        ghostTurnTimeout = null;
    }
    
    if (gameState.currentPlayer !== 'ghost' || gameState.ghostConsecutiveRolls >= GAME_CONFIG.MAX_CONSECUTIVE_ROLLS || !gameState.gameActive) {
        if(gameState.gameActive) endTurn();
        return;
    }

    const dice = document.getElementById('dice');
    dice.classList.add('rolling');
    gameState.turnPhase = 'QUESTION';
    updateUI();

    ghostTurnTimeout = setTimeout(() => {
        const roll = Math.floor(Math.random() * GAME_CONFIG.DICE_SIDES) + 1;
        gameState.diceValue = roll;
        dice.textContent = roll;
        dice.classList.remove('rolling');

        handleSpaceEffect('ghost', gameState.ghostPosition);
    }, GAME_CONFIG.ANIMATION_DURATION);
}

function showGameRules() {
    const modal = document.getElementById('rules-modal');
    const rulesBody = document.querySelector('.rules-body');
    
    rulesBody.innerHTML = `
        <div class="rules-section">
            <h3>🎯 Game Objective</h3>
            <p>Master all 9 Linux command categories by answering questions correctly, then return to HOME with all mastery tokens to face the final challenge and become a Linux Master!</p>
        </div>

        <div class="rules-section">
            <h3>🎲 How to Play</h3>
            <ol>
                <li><strong>Roll the Dice:</strong> Click the dice to roll and move around the board</li>
                <li><strong>Answer Questions:</strong> Land on colored spaces to get Linux command questions from that category</li>
                <li><strong>Earn Mastery:</strong> Answer 2 questions correctly in each category to earn its mastery token</li>
                <li><strong>Race the Ghost:</strong> LinuxBot is also playing! Beat it to collect all tokens and return home first</li>
            </ol>
        </div>

        <div class="rules-section">
            <h3>🔄 Turn Mechanics</h3>
            <ul>
                <li>Answer correctly to keep rolling (up to 3 times per turn)</li>
                <li>Wrong answers end your turn immediately</li>
                <li>Spend mastery tokens to retry wrong answers</li>
                <li>Collide with LinuxBot to bump it backwards!</li>
            </ul>
        </div>

        <div class="rules-section">
            <h3>🤖 Ghost Difficulty</h3>
            <p>Choose LinuxBot's skill level at game start:</p>
            <ul>
                <li><strong>🟢 Easy:</strong> ~60% accuracy, good for beginners</li>
                <li><strong>🟡 Medium:</strong> ~75% accuracy, balanced challenge</li>
                <li><strong>🔴 Hard:</strong> ~85% accuracy, for Linux experts!</li>
            </ul>
        </div>

        <div class="rules-section">
            <h3>🎯 Special Spaces</h3>
            <ul>
                <li>
                    <strong>🏠 HOME (Start):</strong> 
                    <ul>
                        <li>Landing here gives you a question from your weakest category (fewest correct answers)</li>
                        <li>If all categories are equal, you get a random question</li>
                        <li>After collecting ALL 9 tokens, you can win by landing on OR passing HOME</li>
                    </ul>
                </li>
                <li>
                    <strong>🎯 Challenge (Top-Right Corner):</strong> 
                    <ul>
                        <li>Questions here are worth DOUBLE progress (2 points instead of 1)</li>
                        <li>One correct answer here can instantly complete a category's mastery requirement!</li>
                        <li>Questions come from your struggling categories</li>
                    </ul>
                </li>
                <li>
                    <strong>🎲 Wild (Bottom-Right Corner):</strong> 
                    <ul>
                        <li>Three possible random effects (equal chance):</li>
                        <li>1. <em>Random Mastery:</em> Get a question from a struggling category</li>
                        <li>2. <em>Double Move:</em> Move twice your dice roll (e.g., roll 4 = move 8 spaces)</li>
                        <li>3. <em>Free Progress:</em> Gain 1 progress point in your weakest category without answering</li>
                    </ul>
                </li>
                <li>
                    <strong>⚡ Power (Bottom-Left Corner):</strong> 
                    <ul>
                        <li>Two possible power-up effects (50/50 chance):</li>
                        <li>1. <em>Extra Roll:</em> Get an extra dice roll this turn (doesn't count toward your 3-roll limit)</li>
                        <li>2. <em>Free Progress:</em> Instantly gain 1 progress in a struggling category</li>
                    </ul>
                </li>
            </ul>
            <p style="margin-top: 15px; padding: 10px; background: rgba(255, 235, 59, 0.1); border-radius: 10px; border: 1px solid rgba(255, 235, 59, 0.3);">
                <strong>💡 Pro Tip:</strong> Corner spaces don't have questions from specific categories, making them strategic landing spots when you need help in multiple areas!
            </p>
        </div>

        <div class="rules-section">
            <h3>📚 Flash Cards & Review System</h3>
            <ul>
                <li><strong>Wrong Answer Tracking:</strong> Every wrong answer is saved for later review</li>
                <li><strong>Flash Card Decks:</strong> Access multiple review options from the main menu:
                    <ul>
                        <li><em>Your Weak Areas:</em> Review categories where you haven't earned mastery</li>
                        <li><em>Recent Mistakes:</em> Review questions you got wrong during gameplay</li>
                        <li><em>Random Review:</em> Mix of questions from all categories</li>
                        <li><em>Reverse Mode:</em> See the answer first, guess the question!</li>
                    </ul>
                </li>
                <li><strong>End Game Review:</strong> After winning OR losing, you'll be offered to review all wrong answers</li>
                <li><strong>Mark Difficulty:</strong> Mark cards as "Hard" to see them again, or "Easy" to move on</li>
            </ul>
        </div>

        <div class="rules-section">
            <h3>🏁 Winning the Game</h3>
            <p>To win, you must:</p>
            <ol>
                <li>Collect all 9 mastery tokens (2 correct answers per category)</li>
                <li>Land on OR pass the HOME space with all tokens</li>
                <li>Answer the final challenge correctly</li>
                <li>Do all this before LinuxBot!</li>
            </ol>
            <p style="margin-top: 15px; padding: 10px; background: rgba(255, 235, 59, 0.1); border-radius: 10px; border: 1px solid rgba(255, 235, 59, 0.3);">
                <strong>💡 Final Challenge Details:</strong>
                <br>• The final question comes from the category where you got the most questions wrong
                <br>• If you fail, you remain on HOME and must go around the board again
                <br>• You get unlimited attempts, but watch out - LinuxBot might beat you to it!
            </p>
        </div>
    `;
    
    modal.style.display = 'flex';
    lockBodyScroll();
}

function closeGameRules() {
    document.getElementById('rules-modal').style.display = 'none';
    unlockBodyScroll();
}

// Study Guide Functions

// Show study guide modal
function showStudyGuide() {
    const modal = document.getElementById('study-guide-modal');
    if (!modal) {
        console.error('Study guide modal not found!');
        showNotification('Study guide not available', true);
        return;
    }
    
    // Show the modal
    modal.style.display = 'flex';
    lockBodyScroll();
    
    // Initialize navigation if not already done
    if (!document.querySelector('.nav-category-btn')) {
        initializeStudyGuideNav();
    }
    
    // Show welcome content immediately
    showStudyGuideWelcome();
}

// Close study guide modal
function closeStudyGuide() {
    const modal = document.getElementById('study-guide-modal');
    if (modal) {
        modal.style.display = 'none';
        unlockBodyScroll();
    }
}

// Initialize study guide navigation
function initializeStudyGuideNav() {
    const nav = document.getElementById('study-guide-nav');
    if (!nav) return;
    
    nav.innerHTML = '';
    
    // Add welcome button
    const welcomeBtn = document.createElement('button');
    welcomeBtn.className = 'nav-category-btn active';
    welcomeBtn.innerHTML = '🏠 Welcome';
    welcomeBtn.onclick = () => {
        showStudyGuideWelcome();
        setActiveNavButton(welcomeBtn);
    };
    nav.appendChild(welcomeBtn);
    
    // Add category buttons - using colorOrder to maintain consistent order
    colorOrder.forEach(categoryId => {
        const category = masteryCategories[categoryId];
        if (!category) return;
        
        const btn = document.createElement('button');
        btn.className = 'nav-category-btn';
        btn.innerHTML = `${category.icon} ${category.name}`;
        
        // Set category color as CSS variable
        btn.style.setProperty('--category-color', category.color);
        btn.style.setProperty('--category-color-light', category.color + '88');
        
        // Make sure the onclick actually shows the section
        btn.onclick = () => {
            showStudyGuideSection(categoryId);
            setActiveNavButton(btn);
        };
        
        nav.appendChild(btn);
    });
}

// Show welcome content
// Replace these functions in your game.js file:

// Show welcome content
function showStudyGuideWelcome() {
    // Use the welcome section from study-guide-content.js
    showStudyGuideSection('welcome');
}

// Initialize study guide navigation
function initializeStudyGuideNav() {
    const nav = document.getElementById('study-guide-nav');
    if (!nav) return;
    
    nav.innerHTML = '';
    
    // Add welcome button
    const welcomeBtn = document.createElement('button');
    welcomeBtn.className = 'nav-category-btn active';
    welcomeBtn.innerHTML = '🏠 Welcome';
    welcomeBtn.onclick = () => {
        showStudyGuideSection('welcome');
        setActiveNavButton(welcomeBtn);
    };
    nav.appendChild(welcomeBtn);
    
    // Add category buttons - using colorOrder to maintain consistent order
    colorOrder.forEach(categoryId => {
        const category = masteryCategories[categoryId];
        if (!category) return;
        
        const btn = document.createElement('button');
        btn.className = 'nav-category-btn';
        btn.innerHTML = `${category.icon} ${category.name}`;
        
        // Set category color as CSS variable
        btn.style.setProperty('--category-color', category.color);
        btn.style.setProperty('--category-color-light', category.color + '88');
        
        // Make sure the onclick actually shows the section
        btn.onclick = () => {
            showStudyGuideSection(categoryId);
            setActiveNavButton(btn);
        };
        
        nav.appendChild(btn);
    });
}

// Generate progress summary
function generateProgressSummary() {
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; max-width: 800px; margin: 0 auto;">';
    
    Object.entries(masteryCategories).forEach(([key, category]) => {
        const progress = gameState.playerCorrectAnswers[key];
        const hasToken = gameState.playerTokens.has(key);
        const progressPercent = Math.min((progress / GAME_CONFIG.MASTERY_REQUIREMENT) * 100, 100);
        
        html += `
            <div style="background: ${category.color}22; border: 2px solid ${category.color}66; border-radius: 10px; padding: 15px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 5px;">${category.icon}</div>
                <div style="font-weight: bold; margin-bottom: 5px;">${category.name}</div>
                <div style="font-size: 14px;">
                    ${hasToken ? '✅ Mastered' : `${progress}/${GAME_CONFIG.MASTERY_REQUIREMENT} correct`}
                </div>
                <div style="margin-top: 5px; height: 6px; background: rgba(0,0,0,0.3); border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; width: ${progressPercent}%; background: ${category.color}; transition: width 0.3s;"></div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// Show specific study guide section
function showStudyGuideSection(sectionId) {
    const content = document.getElementById('study-guide-content');
    if (!content) return;
    
    // Check if we have the study guide content loaded
    if (typeof getStudyGuideSection !== 'function') {
        console.error('Study guide content not loaded! Make sure study-guide-content.js is included.');
        content.innerHTML = '<div style="padding: 40px; text-align: center; color: #ff4444;">⚠️ Study guide content not loaded. Please check that study-guide-content.js is properly included.</div>';
        return;
    }
    
    const section = getStudyGuideSection(sectionId);
    if (!section) {
        console.error(`Section not found: ${sectionId}`);
        content.innerHTML = '<div style="padding: 40px; text-align: center;">Section not found.</div>';
        return;
    }
    
    // Get category info for styling
    const category = masteryCategories[sectionId];
    const categoryColor = category ? category.color : '#00ff88';
    
    content.innerHTML = `
        <h1 style="color: ${categoryColor}; display: flex; align-items: center; gap: 15px;">
            ${section.icon} ${section.title}
        </h1>
        ${section.content}
    `;
    
    // Scroll to top
    content.scrollTop = 0;
}

// Set active navigation button
function setActiveNavButton(activeBtn) {
    const buttons = document.querySelectorAll('.nav-category-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Close study guide with Escape key
    if (e.key === 'Escape') {
        const modal = document.getElementById('study-guide-modal');
        if (modal && modal.style.display === 'flex') {
            closeStudyGuide();
        }
    }
});

// Terminal Challenge Functions
function showTerminalMenu() {
    const menu = document.getElementById('terminal-menu');
    const container = document.getElementById('terminal-category-options');
    container.innerHTML = '';
    
    // Add a practice all option
    const allBtn = document.createElement('button');
    allBtn.className = 'terminal-option';
    allBtn.onclick = () => {
        closeTerminalMenu();
        startRandomTerminalPractice();
    };
    allBtn.innerHTML = `
        🎯 Random Practice
        <span class="option-desc">Practice random commands from all categories</span>
    `;
    container.appendChild(allBtn);
    
    // Add category options in consistent order
    colorOrder.forEach(key => {
        const category = masteryCategories[key];
        const btn = document.createElement('button');
        btn.className = 'terminal-option';
        btn.onclick = () => {
            closeTerminalMenu();
            showTerminalChallenge(key);
        };
        btn.innerHTML = `
            ${category.icon} ${category.name}
            <span class="option-desc">Practice ${category.name.toLowerCase()} commands</span>
        `;
        container.appendChild(btn);
    });
    
    menu.style.display = 'flex';
    lockBodyScroll();
}

function closeTerminalMenu() {
    document.getElementById('terminal-menu').style.display = 'none';
    unlockBodyScroll();
}

function startRandomTerminalPractice() {
    terminalPracticeMode = 'random';
    const categories = Object.keys(masteryCategories);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    showTerminalChallenge(randomCategory);
    // Override the category name for random practice
    const categoryNameEl = document.getElementById('terminal-category-name');
    if (categoryNameEl) {
        categoryNameEl.textContent = 'Random Practice';
    }
}

function showTerminalChallenge(category) {
    const challenges = TERMINAL_CHALLENGES[category];
    if (!challenges || challenges.length === 0) {
        showNotification('No terminal challenges available for this category');
        return;
    }
    
    // Set practice mode
    terminalPracticeMode = category;
    
    // Pick a random challenge
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    currentTerminalChallenge = challenge;
    terminalAnswerShown = false;
    
    // Update modal content
    const categoryNameEl = document.getElementById('terminal-category-name');
    if (categoryNameEl) {
        categoryNameEl.textContent = masteryCategories[category].name;
    }
    const questionEl = document.getElementById('terminal-question');
    if (questionEl) {
        questionEl.textContent = challenge.question;
    }
    const inputEl = document.getElementById('terminal-input');
    if (inputEl) {
        inputEl.value = '';
    }
    const feedbackEl = document.getElementById('terminal-feedback');
    if (feedbackEl) {
        feedbackEl.innerHTML = '';
    }
    
    // Show modal
    document.getElementById('terminal-modal').style.display = 'flex';
    lockBodyScroll();
    if (inputEl) {
        inputEl.focus();
    }
}

// Check terminal answer - with input validation
function checkTerminalAnswer() {
    const inputEl = document.getElementById('terminal-input');
    if (!inputEl) return;
    
    let input = inputEl.value.trim();
    
    // Validate input length
    if (input.length > 100) {
        showNotification('Command too long!', true);
        return;
    }
    
    // Basic sanitization - remove any HTML/script tags
    input = input.replace(/<[^>]*>/g, '');
    
    const feedbackEl = document.getElementById('terminal-feedback');
    if (!currentTerminalChallenge || !feedbackEl) return;
    
    // Check main answer or alternatives
    const correctAnswers = [currentTerminalChallenge.answer];
    if (currentTerminalChallenge.alternatives) {
        correctAnswers.push(...currentTerminalChallenge.alternatives);
    }
    
    if (correctAnswers.includes(input)) {
        feedbackEl.innerHTML = '<div style="color: #00ff88;">✅ Correct! Well done!</div>';
        setTimeout(() => {
            // Show next challenge based on practice mode
            if (terminalPracticeMode === 'random') {
                startRandomTerminalPractice();
            } else if (terminalPracticeMode) {
                showTerminalChallenge(terminalPracticeMode);
            }
        }, 1500);
    } else {
        feedbackEl.innerHTML = '<div style="color: #ff4444;">❌ Not quite right. Try again!</div>';
        // Clear input for retry
        inputEl.value = '';
        inputEl.focus();
    }
}

function showTerminalHint() {
    if (!currentTerminalChallenge) return;
    
    const feedbackEl = document.getElementById('terminal-feedback');
    if (feedbackEl) {
        feedbackEl.innerHTML = `<div style="color: #ffa500;">💡 Hint: ${currentTerminalChallenge.hint}</div>`;
    }
}

function showTerminalAnswer() {
    if (!currentTerminalChallenge || terminalAnswerShown) return;
    
    const feedbackEl = document.getElementById('terminal-feedback');
    const input = document.getElementById('terminal-input');
    
    if (!feedbackEl) return;
    
    // Show the answer
    feedbackEl.innerHTML = `<div style="color: #00ff88;">✅ Answer: ${currentTerminalChallenge.answer}</div>`;
    
    // Also show alternatives if they exist
    if (currentTerminalChallenge.alternatives && currentTerminalChallenge.alternatives.length > 0) {
        feedbackEl.innerHTML += `<div style="color: #00ff88; margin-top: 10px;">Alternative answers: ${currentTerminalChallenge.alternatives.join(', ')}</div>`;
    }
    
    // Put the answer in the input field so they can see it in context
    if (input) {
        input.value = currentTerminalChallenge.answer;
    }
    
    terminalAnswerShown = true;
}

function skipTerminalChallenge() {
    // Show next challenge based on practice mode
    if (terminalPracticeMode === 'random') {
        startRandomTerminalPractice();
    } else if (terminalPracticeMode) {
        showTerminalChallenge(terminalPracticeMode);
    }
}

function closeTerminalChallenge() {
    document.getElementById('terminal-modal').style.display = 'none';
    unlockBodyScroll();
    currentTerminalChallenge = null;
    terminalPracticeMode = null;
}

function backToTerminalMenu() {
    closeTerminalChallenge();
    showTerminalMenu();
}

// Audio System Functions - with pause on close
function toggleAudioPanel() {
    const panel = document.getElementById('audio-panel');
    const audio = document.getElementById('study-audio');
    
    if (panel.style.display === 'none') {
        panel.style.display = 'flex';
        lockBodyScroll();
    } else {
        // Pause audio when closing the panel
        if (audio && !audio.paused) {
            audio.pause();
        }
        panel.style.display = 'none';
        unlockBodyScroll();
    }
}

function createAudioCategoryButtons() {
    const container = document.getElementById('audio-categories');
    if (!container) return;
    
    // Add Introduction button first
    const introBtn = document.createElement('button');
    introBtn.className = 'audio-cat-btn';
    introBtn.onclick = () => playAudioCategory('intro');
    introBtn.innerHTML = '🐧 Introduction';
    container.appendChild(introBtn);
    
    // Add category buttons in consistent order
    colorOrder.forEach(key => {
        const category = masteryCategories[key];
        const btn = document.createElement('button');
        btn.className = 'audio-cat-btn';
        btn.onclick = () => playAudioCategory(key);
        btn.innerHTML = `${category.icon} ${category.name}`;
        container.appendChild(btn);
    });
}

function playAudioCategory(category) {
    const audio = document.getElementById('study-audio');
    const audioFile = AUDIO_FILES[category];
    const status = document.getElementById('audio-status');
    
    if (audioFile && audio) {
        audio.src = audioFile;
        audio.play();
        
        const categoryName = category === 'intro' ? 'Introduction' : masteryCategories[category].name;
        if (status) {
            status.textContent = `Now playing: ${categoryName}`;
        }
        showNotification(`🎧 Playing: ${categoryName}`);
    } else {
        if (status) {
            status.textContent = 'Audio file not found';
        }
        showNotification('Audio file not found', true);
    }
}

// Flash Card System Functions
function showFlashCardMenu() {
    document.getElementById('flashcard-menu').style.display = 'flex';
    lockBodyScroll();
}

function closeFlashCardMenu() {
    document.getElementById('flashcard-menu').style.display = 'none';
    unlockBodyScroll();
}

function createFlashCardCategoryOptions() {
    const container = document.querySelector('.flashcard-options');
    if (!container) return;
    
    // Add category buttons in the same order as colorOrder
    colorOrder.forEach(key => {
        const category = masteryCategories[key];
        const btn = document.createElement('button');
        btn.className = 'flashcard-option';
        btn.onclick = () => startFlashCards(key);
        btn.innerHTML = `
            ${category.icon} ${category.name}
            <span class="option-desc">Review all ${category.name.toLowerCase()} commands</span>
        `;
        container.appendChild(btn);
        
        // Add reverse option for this category
        const reverseBtn = document.createElement('button');
        reverseBtn.className = 'flashcard-option';
        reverseBtn.onclick = () => startFlashCards(key, true);
        reverseBtn.innerHTML = `
            🔄 ${category.icon} ${category.name} (Reverse)
            <span class="option-desc">See descriptions first for ${category.name.toLowerCase()}</span>
        `;
        container.appendChild(reverseBtn);
    });
}

function startFlashCards(type, reverse = false) {
    closeFlashCardMenu();
    flashCardDeck = [];
    currentFlashCardIndex = 0;
    flashCardReverseMode = reverse;
    
    if (type === 'weak') {
        // Create cards for categories with low progress
        Object.entries(gameState.playerCorrectAnswers).forEach(([category, correct]) => {
            if (correct < GAME_CONFIG.MASTERY_REQUIREMENT && !gameState.playerTokens.has(category)) {
                const commands = masteryCategories[category].commands;
                commands.forEach(cmd => {
                    flashCardDeck.push({
                        front: reverse ? getCommandDescription(cmd) : cmd,
                        back: reverse ? cmd : getCommandDescription(cmd),
                        category: category
                    });
                });
            }
        });
    } else if (type === 'recent') {
        // Create cards from recent wrong answers
        gameState.wrongAnswers.slice(-10).forEach(wrong => {
            flashCardDeck.push({
                front: reverse ? wrong.question.explanation : wrong.question.question,
                back: reverse ? wrong.question.question : wrong.question.explanation,
                category: wrong.category
            });
        });
    } else if (type === 'random') {
        // Create random mix from all categories
        const allCategories = Object.keys(masteryCategories);
        const cardsPerCategory = 2;
        
        allCategories.forEach(category => {
            const commands = masteryCategories[category].commands;
            const shuffled = [...commands].sort(() => Math.random() - 0.5);
            shuffled.slice(0, cardsPerCategory).forEach(cmd => {
                flashCardDeck.push({
                    front: reverse ? getCommandDescription(cmd) : cmd,
                    back: reverse ? cmd : getCommandDescription(cmd),
                    category: category
                });
            });
        });
    } else {
        // Create cards for specific category
        const commands = masteryCategories[type].commands;
        commands.forEach(cmd => {
            flashCardDeck.push({
                front: reverse ? getCommandDescription(cmd) : cmd,
                back: reverse ? cmd : getCommandDescription(cmd),
                category: type
            });
        });
    }
    
    if (flashCardDeck.length === 0) {
        showNotification('No flash cards available for this selection');
        return;
    }
    
    // Shuffle deck
    flashCardDeck.sort(() => Math.random() - 0.5);
    
    document.getElementById('flashcard-modal').style.display = 'flex';
    lockBodyScroll();
    showCurrentFlashCard();
}

// Show current flash card - UPDATED with opacity transition
function showCurrentFlashCard() {
    if (currentFlashCardIndex >= flashCardDeck.length) {
        closeFlashCards();
        showNotification('🎉 Flash card review complete!');
        return;
    }
    
    const card = flashCardDeck[currentFlashCardIndex];
    const frontEl = document.getElementById('flashcard-front');
    const backEl = document.getElementById('flashcard-back');
    const counterEl = document.getElementById('flashcard-counter');
    const flashcard = document.getElementById('flashcard');
    
    // Hide content during transition
    if (flashcard) {
        flashcard.style.opacity = '0';
        
        setTimeout(() => {
            if (frontEl) frontEl.textContent = card.front;
            if (backEl) backEl.textContent = card.back;
            if (counterEl) counterEl.textContent = `${currentFlashCardIndex + 1} / ${flashCardDeck.length}`;
            
            // Reset flip
            flashcard.classList.remove('flipped');
            flashCardFlipped = false;
            
            // Fade back in
            flashcard.style.opacity = '1';
        }, 200);
    }
}

function flipCard() {
    const card = document.getElementById('flashcard');
    if (card) {
        card.classList.toggle('flipped');
        flashCardFlipped = !flashCardFlipped;
    }
}

function markCard(difficulty) {
    const card = flashCardDeck[currentFlashCardIndex];
    
    // Track difficulty
    if (!gameState.cardDifficulty[card.front]) {
        gameState.cardDifficulty[card.front] = [];
    }
    gameState.cardDifficulty[card.front].push(difficulty);
    
    // If marked as hard, add to deck again
    if (difficulty === 'hard') {
        flashCardDeck.push(card);
    }
    
    currentFlashCardIndex++;
    showCurrentFlashCard();
}

function closeFlashCards() {
    document.getElementById('flashcard-modal').style.display = 'none';
    unlockBodyScroll();
    flashCardDeck = [];
    currentFlashCardIndex = 0;
    
    // After closing flash cards from review, show the appropriate end game modal
    if (!gameState.gameActive) {
        // Check if player won or lost
        if (gameState.playerTokens.size === GAME_CONFIG.MAX_TOKENS) {
            // Player won - show win modal
            document.getElementById('win-modal').style.display = 'flex';
            lockBodyScroll();
        } else {
            // Player lost - show loss modal
            showLossModalDirectly();
        }
    }
}

function backToFlashCardMenu() {
    // If game is not active (ended), don't go back to menu
    if (!gameState.gameActive) {
        closeFlashCards();
        // Show the appropriate end game modal
        if (gameState.playerTokens.size === GAME_CONFIG.MAX_TOKENS) {
            document.getElementById('win-modal').style.display = 'flex';
        } else {
            showLossModalDirectly();
        }
        return;
    }
    
    // Normal behavior - go back to menu
    closeFlashCards();
    showFlashCardMenu();
}

function getCommandDescription(cmd) {
    // Simple command descriptions
    const descriptions = {
        'ls': 'List directory contents',
        'cd': 'Change directory',
        'pwd': 'Print working directory',
        'find': 'Search for files and directories',
        'cp': 'Copy files or directories',
        'mv': 'Move or rename files',
        'rm': 'Remove files or directories',
        'touch': 'Create empty file or update timestamp',
        'mkdir': 'Make directories',
        'cat': 'Concatenate and display files',
        'tar': 'Archive files',
        'zip': 'Compress files into zip archive',
        'gzip': 'Compress or decompress files',
        'unzip': 'Extract zip archives',
        'bzip2': 'Compress files using bzip2',
        'chmod': 'Change file permissions',
        'chown': 'Change file ownership',
        'sudo': 'Execute as superuser',
        'umask': 'Set default file permissions',
        'su': 'Switch user',
        'grep': 'Search text patterns',
        'sed': 'Stream editor for text',
        'awk': 'Pattern scanning and processing',
        'head': 'Display first lines of file',
        'tail': 'Display last lines of file',
        'sort': 'Sort lines in files',
        'uniq': 'Remove duplicate lines',
        'less': 'View file content page by page',
        'bash': 'Bourne Again Shell',
        'export': 'Set environment variables',
        'echo': 'Display text',
        'alias': 'Create command shortcuts',
        'history': 'Show command history',
        'ps': 'Display running processes',
        'top': 'Display processes in real-time',
        'free': 'Display memory usage',
        'df': 'Display disk space usage',
        'du': 'Display directory space usage',
        'dmesg': 'Display kernel messages',
        'useradd': 'Add new user account',
        'passwd': 'Change user password',
        'id': 'Display user and group IDs',
        'groups': 'Display group memberships',
        'usermod': 'Modify user account',
        'ping': 'Test network connectivity',
        'ssh': 'Secure shell connection',
        'wget': 'Download files from web',
        'curl': 'Transfer data from URLs',
        'netstat': 'Display network connections',
        'ifconfig': 'Configure network interface',
        'man': 'Display manual pages',
        'apt': 'Package management (Debian/Ubuntu)',
        'yum': 'Package management (Red Hat/CentOS)',
        'dpkg': 'Debian package manager',
        'rpm': 'RPM package manager'
    };
    
    return descriptions[cmd] || `Linux command: ${cmd}`;
}

// New game
function newGame() {
    // Reset game state
    gameState = {
        currentPlayer: 'player',
        turnPhase: 'ROLL',
        playerPosition: 0,
        ghostPosition: 0,
        playerTokens: new Set(),
        ghostTokens: new Set(),
        playerConsecutiveRolls: 0,
        ghostConsecutiveRolls: 0,
        currentChallenge: null,
        diceValue: 0,
        gameActive: true,
        questionsAnswered: 0,
        recentlyAskedQuestions: [],
        finalChallenge: false,
        ghostDifficulty: 'medium',
        playerCorrectAnswers: {'file-operations':0,'archives':0,'permissions':0,'text-processing':0,'shell':0,'system':0,'users':0,'networking':0,'linux-foundations':0},
        ghostCorrectAnswers: {'file-operations':0,'archives':0,'permissions':0,'text-processing':0,'shell':0,'system':0,'users':0,'networking':0,'linux-foundations':0},
        wrongAnswers: [],
        cardDifficulty: {}
    };

    // Close ALL modals
    const modalsToClose = [
        'challenge-section',
        'win-modal',
        'loss-modal',
        'study-guide-modal',
        'rules-modal',
        'audio-panel',
        'terminal-menu',
        'terminal-modal',
        'flashcard-modal',
        'flashcard-menu'  // This was missing!
    ];

    modalsToClose.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (modalId === 'challenge-section') {
                modal.classList.remove('visible');
            } else {
                modal.style.display = 'none';
            }
        }
    });
    
    // Also remove any dynamically created review modals
    const dynamicModals = document.querySelectorAll('.review-modal');
    dynamicModals.forEach(modal => {
        if (modal.parentNode) {
            modal.remove();
        }
    });
    
    // Pause any playing audio
    const audio = document.getElementById('study-audio');
    if (audio && !audio.paused) {
        audio.pause();
    }
    
    // Reset dice display
    document.getElementById('dice').textContent = '🎲';
    
    unlockBodyScroll();
    positionPlayerPieces();
    updateUI();

    // Show start modal for difficulty selection
    document.getElementById('start-modal').style.display = 'flex';
    lockBodyScroll();
}

// Handle window resize
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        positionBoardSpaces();
        positionPlayerPieces();
    }, GAME_CONFIG.RESIZE_DEBOUNCE);
});

// Add cleanup on page unload
window.addEventListener('beforeunload', () => {
    // Clean up audio
    const audio = document.getElementById('study-audio');
    if (audio) {
        audio.pause();
        audio.src = '';
    }
    
    // Clear timeouts
    if (ghostTurnTimeout) clearTimeout(ghostTurnTimeout);
    if (resizeTimeout) clearTimeout(resizeTimeout);
});

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const ghostActivity = document.getElementById('ghost-activity');
    if (ghostActivity) {
        ghostActivity.remove();
    }

    initGame();
});

// Debug Commands System
window.debug = {
    // Give player all tokens instantly
    winNow: function() {
        Object.keys(masteryCategories).forEach(cat => {
            gameState.playerTokens.add(cat);
            gameState.playerCorrectAnswers[cat] = 2;
        });
        updateUI();
        showNotification("🎯 Debug: All tokens granted!");
    },
    
    // Give ghost all tokens instantly
    ghostWinNow: function() {
        Object.keys(masteryCategories).forEach(cat => {
            gameState.ghostTokens.add(cat);
            gameState.ghostCorrectAnswers[cat] = 2;
        });
        updateUI();
        showNotification("🤖 Debug: Ghost has all tokens!");
    },
    
    // Move player to specific position
    movePlayerTo: function(position) {
        gameState.playerPosition = position % boardSpaces.length;
        positionPlayerPieces();
        updateUI();
        showNotification(`📍 Debug: Player moved to position ${position}`);
    },
    
    // Move ghost to specific position
    moveGhostTo: function(position) {
        gameState.ghostPosition = position % boardSpaces.length;
        positionPlayerPieces();
        updateUI();
        showNotification(`📍 Debug: Ghost moved to position ${position}`);
    },
    
    // Add wrong answers for testing
    addWrongAnswers: function(count = 5) {
        const categories = Object.keys(masteryCategories);
        for (let i = 0; i < count; i++) {
            const randomCat = categories[Math.floor(Math.random() * categories.length)];
            gameState.wrongAnswers.push({
                question: {
                    question: `Test wrong question ${i + 1}`,
                    explanation: `This is a test explanation for wrong answer ${i + 1}`,
                    options: ["Option A", "Option B", "Option C", "Option D"],
                    correct: 0
                },
                category: randomCat,
                timestamp: Date.now()
            });
        }
        showNotification(`❌ Debug: Added ${count} wrong answers`);
    },
    
    // Test final challenge scenario
    testFinalChallenge: function() {
        this.winNow();
        this.movePlayerTo(39); // Move near home
        showNotification("🏁 Debug: Roll dice to trigger final challenge!");
    },
    
    // Test ghost win scenario
    testGhostWin: function() {
        this.ghostWinNow();
        this.moveGhostTo(39); // Move ghost near home
        gameState.currentPlayer = 'ghost';
        showNotification("🤖 Debug: Ghost will win on next move!");
        setTimeout(() => ghostTurn(), 1000);
    },
    
    // Test collision
    testCollision: function() {
        gameState.playerPosition = 10;
        gameState.ghostPosition = 15;
        positionPlayerPieces();
        showNotification("💥 Debug: Roll 5 to test collision!");
    },
    
    // Give specific tokens
    giveToken: function(category) {
        if (masteryCategories[category]) {
            gameState.playerTokens.add(category);
            gameState.playerCorrectAnswers[category] = 2;
            updateUI();
            showNotification(`✅ Debug: ${masteryCategories[category].name} token granted!`);
        } else {
            console.log("Available categories:", Object.keys(masteryCategories));
        }
    },
    
    // Remove all tokens
    clearTokens: function() {
        gameState.playerTokens.clear();
        gameState.ghostTokens.clear();
        Object.keys(gameState.playerCorrectAnswers).forEach(cat => {
            gameState.playerCorrectAnswers[cat] = 0;
            gameState.ghostCorrectAnswers[cat] = 0;
        });
        updateUI();
        showNotification("🔄 Debug: All tokens cleared!");
    },
    
    // Skip to player's turn
    myTurn: function() {
        gameState.currentPlayer = 'player';
        gameState.turnPhase = 'ROLL';
        gameState.playerConsecutiveRolls = 0;
        updateUI();
        showNotification("👤 Debug: It's your turn!");
    },
    
    // Test specific space effects
    testSpace: function(spaceType) {
        const spaces = {
            home: 0,
            challenge: 10,
            wild: 20,
            power: 30
        };
        
        if (spaces[spaceType] !== undefined) {
            this.movePlayerTo(spaces[spaceType]);
            handleSpaceEffect('player', spaces[spaceType]);
        } else {
            console.log("Available spaces: home, challenge, wild, power");
        }
    },
    
    // Show current game state
    showState: function() {
        console.log("=== GAME STATE ===");
        console.log("Player Position:", gameState.playerPosition);
        console.log("Ghost Position:", gameState.ghostPosition);
        console.log("Player Tokens:", Array.from(gameState.playerTokens));
        console.log("Ghost Tokens:", Array.from(gameState.ghostTokens));
        console.log("Wrong Answers:", gameState.wrongAnswers.length);
        console.log("Current Turn:", gameState.currentPlayer);
        console.log("Final Challenge:", gameState.finalChallenge);
        console.log("Player Progress:", gameState.playerCorrectAnswers);
        console.log("Ghost Progress:", gameState.ghostCorrectAnswers);
    },
    
    // Test final challenge with wrong answers in specific category
    testWorstCategory: function(category) {
        this.clearTokens();
        this.winNow();
        
        // Add several wrong answers in the specified category
        for (let i = 0; i < 5; i++) {
            gameState.wrongAnswers.push({
                question: {
                    question: `Test wrong question in ${category}`,
                    explanation: `Test explanation`,
                    options: ["A", "B", "C", "D"],
                    correct: 0
                },
                category: category,
                timestamp: Date.now()
            });
        }
        
        this.movePlayerTo(39);
        showNotification(`🎯 Debug: Final challenge will be from ${masteryCategories[category].name}`);
    }
};

// Also add keyboard shortcuts for common debug commands
document.addEventListener('keydown', (e) => {
    // Only work when not typing in an input
    if (e.target.tagName === 'INPUT') return;
    
    // Ctrl/Cmd + Shift + Key combinations
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        switch(e.key.toLowerCase()) {
            case 'w':
                e.preventDefault();
                debug.winNow();
                break;
            case 'g':
                e.preventDefault();
                debug.ghostWinNow();
                break;
            case 'f':
                e.preventDefault();
                debug.testFinalChallenge();
                break;
            case 's':
                e.preventDefault();
                debug.showState();
                break;
            case 'c':
                e.preventDefault();
                debug.clearTokens();
                break;
        }
    }
});

console.log(`
🎮 DEBUG COMMANDS AVAILABLE 🎮
==============================
Open the browser console and use these commands:

debug.winNow() - Give player all tokens
debug.ghostWinNow() - Give ghost all tokens
debug.movePlayerTo(position) - Move player to position (0-39)
debug.moveGhostTo(position) - Move ghost to position (0-39)
debug.addWrongAnswers(count) - Add test wrong answers
debug.testFinalChallenge() - Set up final challenge scenario
debug.testGhostWin() - Set up ghost win scenario
debug.testCollision() - Set up collision test
debug.giveToken('category') - Give specific token (e.g., 'file-operations')
debug.clearTokens() - Remove all tokens
debug.myTurn() - Skip to player's turn
debug.testSpace('type') - Test space effect (home/challenge/wild/power)
debug.showState() - Show current game state
debug.testWorstCategory('category') - Test final challenge with specific worst category

KEYBOARD SHORTCUTS:
Ctrl+Shift+W - Win now
Ctrl+Shift+G - Ghost win now
Ctrl+Shift+F - Test final challenge
Ctrl+Shift+S - Show state
Ctrl+Shift+C - Clear tokens
`);