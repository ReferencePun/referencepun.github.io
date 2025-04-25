/**
 * Transmission Magazine page JavaScript
 * Handles magazine modal and Issuu embed functionality
 */

// Magazine issues data
const magazineIssues = [
    {
        id: '01',
        title: 'Transition',
        cover: 'images/transmission/issue01-cover.jpg',
        issuuEmbed: 'https://e.issuu.com/embed.html#XXXX' // Replace with your actual Issuu embed code
    },
    {
        id: '02',
        title: 'Transparency',
        cover: 'images/transmission/issue02-cover.jpg',
        issuuEmbed: 'https://e.issuu.com/embed.html#YYYY' // Replace with your actual Issuu embed code
    },
    {
        id: '03',
        title: 'Transform',
        cover: 'images/transmission/issue03-cover.jpg',
        issuuEmbed: 'https://e.issuu.com/embed.html#ZZZZ' // Replace with your actual Issuu embed code
    },
    {
        id: '03-04',
        title: 'Intermission',
        cover: 'images/transmission/issue0304-cover.jpg',
        issuuEmbed: 'https://e.issuu.com/embed.html#AAAA' // Replace with your actual Issuu embed code
    }
];

document.addEventListener('DOMContentLoaded', function() {
    // Add click events to magazine covers
    initMagazineCovers();
    
    // Set up modal close button
    initMagazineModal();
});

/**
 * Initialize click events for magazine covers
 */
function initMagazineCovers() {
    const magazineIssueElements = document.querySelectorAll('.magazine-issue');
    
    magazineIssueElements.forEach((issueElement, index) => {
        issueElement.addEventListener('click', function() {
            openMagazine(index);
        });
    });
}

/**
 * Initialize magazine modal functionality
 */
function initMagazineModal() {
    const modal = document.getElementById('magazine-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn && modal) {
        // Close button click
        closeBtn.addEventListener('click', function() {
            closeModal();
        });
        
        // Close modal when clicking outside content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Keyboard navigation - ESC to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }
}

/**
 * Opens the magazine modal with the specified issue
 * @param {number} index - Index of the magazine issue to display
 */
function openMagazine(index) {
    const modal = document.getElementById('magazine-modal');
    const issuuEmbed = document.getElementById('issuu-embed');
    
    if (!modal || !issuuEmbed) return;
    
    // Get magazine data
    const magazine = magazineIssues[index];
    
    // Create iframe for Issuu embed
    issuuEmbed.innerHTML = `
        <iframe src="${magazine.issuuEmbed}" 
                style="width:100%; height:100%;" 
                frameborder="0" 
                allowfullscreen></iframe>
    `;
    
    // Show modal
    modal.classList.add('active');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

/**
 * Closes the magazine modal
 */
function closeModal() {
    const modal = document.getElementById('magazine-modal');
    const issuuEmbed = document.getElementById('issuu-embed');
    
    if (!modal) return;
    
    // Hide modal
    modal.classList.remove('active');
    
    // Clear embed content
    if (issuuEmbed) {
        issuuEmbed.innerHTML = '';
    }
    
    // Allow body scrolling
    document.body.style.overflow = '';
}