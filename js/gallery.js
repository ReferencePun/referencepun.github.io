/* Shared gallery behavior; the selections remain in their original data files. */
window.initGallery = function initGallery(images) {
    'use strict';
    const grid = document.getElementById('portfolio-grid');
    const lightbox = document.getElementById('lightbox');
    if (!grid || !lightbox) return;
    const fullImage = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    const closeButton = lightbox.querySelector('.close-lightbox');
    const previousButton = lightbox.querySelector('.lightbox-prev');
    const nextButton = lightbox.querySelector('.lightbox-next');
    const controls = [closeButton, previousButton, nextButton];
    const status = document.createElement('div');
    status.className = 'visually-hidden';
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    lightbox.append(status);
    let currentIndex = 0;
    let opener = null;
    let previousOverflow = '';
    let backgroundState = [];
    let swipe = null;

    function columnWidth() {
        return Math.ceil(parseFloat(getComputedStyle(grid).gridTemplateColumns)) || 480;
    }
    let lastSize = 0;
    function setImages(selection) {
        close();
        images = selection;
        currentIndex = 0;
        const initialSize = columnWidth();
        const fragment = document.createDocumentFragment();
        images.forEach((image, index) => {
            const metadata = window.galleryImageVariants?.[image.src];
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'portfolio-item';
            item.dataset.index = index;
            item.setAttribute('aria-label', `View photograph ${index + 1}: ${image.alt || image.caption || 'Photograph'}`);
            item.setAttribute('aria-haspopup', 'dialog');
            const img = document.createElement('img');
            img.alt = image.alt || image.caption || 'Photograph';
            img.loading = index < 6 ? 'eager' : 'lazy';
            img.decoding = 'async';
            if (index < 3) img.fetchPriority = 'high';
            if (metadata) {
                img.width = metadata.width;
                img.height = metadata.height;
                const ratio = metadata.width / metadata.height;
                item.classList.add(ratio > 1.2 ? 'horizontal' : ratio < 0.8 ? 'vertical' : 'square');
                img.sizes = `${initialSize}px`;
                img.srcset = metadata.variants.map(variant => `${variant.src} ${variant.width}w`).join(', ');
                img.src = metadata.variants[0].src;
                img.addEventListener('error', () => {
                    img.removeAttribute('srcset');
                    img.src = image.src;
                }, { once: true });
            } else {
                // A newly added photograph remains usable before regenerating derivatives.
                img.addEventListener('load', () => {
                    const ratio = img.naturalWidth / img.naturalHeight;
                    item.classList.add(ratio > 1.2 ? 'horizontal' : ratio < 0.8 ? 'vertical' : 'square');
                }, { once: true });
                img.src = image.src;
            }
            item.append(img);
            item.addEventListener('click', () => open(index, item));
            fragment.append(item);
        });
        grid.replaceChildren(fragment);
        lastSize = initialSize;
    }
    setImages(images);
    new ResizeObserver(() => {
        const size = columnWidth();
        if (size === lastSize) return;
        lastSize = size;
        grid.querySelectorAll('img[srcset]').forEach(img => { img.sizes = `${size}px`; });
    }).observe(grid);

    function show(index) {
        currentIndex = (index + images.length) % images.length;
        const image = images[currentIndex];
        fullImage.src = image.src;
        fullImage.alt = image.alt || image.caption || 'Photograph';
        caption.textContent = image.caption || '';
        status.textContent = `Photograph ${currentIndex + 1} of ${images.length}: ${fullImage.alt}`;
    }
    function open(index, trigger) {
        if (!lightbox.classList.contains('active')) {
            opener = trigger;
            previousOverflow = document.body.style.overflow;
            // Make every sibling outside the dialog inert, including its ancestors' siblings.
            backgroundState = [];
            for (let node = lightbox; node.parentElement; node = node.parentElement) {
                for (const sibling of node.parentElement.children) {
                    if (sibling !== node && !['SCRIPT', 'STYLE'].includes(sibling.tagName)) {
                        backgroundState.push([sibling, sibling.inert]);
                        sibling.inert = true;
                    }
                }
                if (node.parentElement === document.body) break;
            }
            lightbox.classList.add('active');
            lightbox.removeAttribute('aria-hidden');
            document.body.style.overflow = 'hidden';
            closeButton.focus({ preventScroll: true });
        }
        show(index);
    }
    function close() {
        if (!lightbox.classList.contains('active')) return;
        lightbox.classList.remove('active');
        backgroundState.forEach(([element, wasInert]) => { element.inert = wasInert; });
        backgroundState = [];
        document.body.style.overflow = previousOverflow;
        opener?.focus({ preventScroll: true });
        lightbox.setAttribute('aria-hidden', 'true');
        swipe = null;
    }
    closeButton.addEventListener('click', close);
    previousButton.addEventListener('click', () => show(currentIndex - 1));
    nextButton.addEventListener('click', () => show(currentIndex + 1));
    lightbox.addEventListener('click', event => {
        if (event.target === lightbox || event.target.classList.contains('lightbox-content')) close();
    });
    lightbox.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); close(); }
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            show(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
        } else if (event.key === 'Tab') {
            const active = controls.indexOf(document.activeElement);
            if (event.shiftKey && active <= 0) {
                event.preventDefault(); nextButton.focus();
            } else if (!event.shiftKey && (active === controls.length - 1 || active === -1)) {
                event.preventDefault(); closeButton.focus();
            }
        }
    });
    // Only a deliberate, single-finger horizontal gesture changes the photograph.
    lightbox.addEventListener('touchstart', event => {
        swipe = event.touches.length === 1 && !event.target.closest('button')
            ? { x: event.touches[0].clientX, y: event.touches[0].clientY, time: performance.now() } : null;
    }, { passive: true });
    lightbox.addEventListener('touchmove', event => {
        if (event.touches.length !== 1) swipe = null;
    }, { passive: true });
    lightbox.addEventListener('touchcancel', () => { swipe = null; }, { passive: true });
    lightbox.addEventListener('touchend', event => {
        if (!swipe || event.touches.length || !lightbox.classList.contains('active')) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - swipe.x, dy = touch.clientY - swipe.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && performance.now() - swipe.time < 800
            && (!window.visualViewport || window.visualViewport.scale <= 1.05)) {
            show(currentIndex + (dx < 0 ? 1 : -1));
        }
        swipe = null;
    }, { passive: true });
    return { setImages };
};
