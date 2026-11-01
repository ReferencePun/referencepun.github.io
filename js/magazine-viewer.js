/** On-demand page images, decoded before display, with a bounded adjacent-page cache. */
(() => {
    'use strict';
    const dialog = document.getElementById('magazine-reader');
    const library = window.magazineLibrary || [];
    if (!dialog || !dialog.showModal || !library.length) return;
    const find = selector => dialog.querySelector(selector);
    const shell = find('.reader-shell');
    const stage = find('.reader-stage');
    const pages = find('.reader-pages');
    const body = find('.reader-body');
    const overview = find('.reader-overview');
    const thumbnails = find('.reader-thumbnails');
    const status = find('#reader-position');
    const loading = find('.reader-loading');
    const error = find('.reader-error');
    const pageInput = find('#reader-page');
    const progress = find('.reader-progress');
    const previous = find('[data-reader="previous"]');
    const next = find('[data-reader="next"]');
    const zoomButton = find('[data-reader="zoom"]');
    const viewButton = find('[data-reader="view"]');
    const overviewButton = find('[data-reader="overview"]');
    const fullscreenButton = find('[data-reader="fullscreen"]');
    const spreadLayout = matchMedia('(min-width: 900px), (orientation: landscape)');
    const manifests = new Map();
    const images = new Map();
    const positions = new Map();
    let publication, manifest, opener, oldOverflow;
    let page = 1, readingPage = 1, zoom = false, mode = 'auto', request = 0, loadingTimer, preloadTimer;
    let visible = [], touchStart;
    const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
    const enterFullscreen = shell.requestFullscreen || shell.webkitRequestFullscreen;
    const exitFullscreen = () => (document.exitFullscreen || document.webkitExitFullscreen).call(document);

    const isSpread = () => mode === 'spread' || (mode === 'auto' && spreadLayout.matches);
    const source = (book, number, size) => `images/magazines/${book.id}/page-${String(number).padStart(3, '0')}-${size}.webp?v=${book.version}`;
    const normalized = number => isSpread() && number > 1 ? number - number % 2 : number;
    function numbersFor(number) {
        const first = normalized(number);
        return isSpread() && first > 1 && first < manifest.pages.length ? [first, first + 1] : [first];
    }
    function getManifest(entry) {
        if (!manifests.has(entry.id)) {
            const promise = fetch(entry.manifest).then(response => {
                if (!response.ok) throw new Error('Magazine unavailable');
                return response.json();
            }).catch(reason => { manifests.delete(entry.id); throw reason; });
            manifests.set(entry.id, promise);
        }
        return manifests.get(entry.id);
    }
    function getImage(book, number, size, priority = 'high') {
        const url = source(book, number, size);
        if (images.has(url)) {
            const cached = images.get(url);
            images.delete(url);
            images.set(url, cached);
            return cached;
        }
        const image = new Image();
        image.decoding = 'async';
        image.fetchPriority = priority;
        image.width = book.pages[number - 1].width;
        image.height = book.pages[number - 1].height;
        image.alt = `${book.title}, page ${number}`;
        image.draggable = false;
        image.src = url;
        const promise = image.decode().then(() => image).catch(reason => {
            if (images.get(url) === promise) images.delete(url);
            throw reason;
        });
        images.set(url, promise);
        while (images.size > 12) images.delete(images.keys().next().value);
        return promise;
    }
    function setBusy(busy) {
        clearTimeout(loadingTimer);
        stage.setAttribute('aria-busy', String(busy));
        loading.hidden = true;
        if (busy) loadingTimer = setTimeout(() => { if (dialog.open) loading.hidden = false; }, 180);
    }
    function updateControls() {
        if (!manifest) return;
        const numbers = numbersFor(page);
        previous.disabled = page === 1;
        next.disabled = numbers.at(-1) === manifest.pages.length;
        pageInput.value = page;
        pageInput.max = progress.max = manifest.pages.length;
        progress.value = page;
        progress.style.setProperty('--progress', `${100 * (page - 1) / Math.max(1, manifest.pages.length - 1)}%`);
        const label = numbers.length === 2 ? `Pages ${numbers[0]}–${numbers[1]} of ${manifest.pages.length}` : `Page ${page} of ${manifest.pages.length}`;
        progress.setAttribute('aria-valuetext', label);
        find('.reader-count').textContent = `/ ${manifest.pages.length}`;
        find('.reader-jump label').textContent = numbers.length === 2 ? 'Pages' : 'Page';
        find('.reader-range').textContent = numbers.length === 2 ? `–${numbers[1]}` : '';
        viewButton.setAttribute('aria-pressed', String(isSpread()));
        viewButton.setAttribute('aria-label', isSpread() ? 'Switch to single pages' : 'Switch to spreads');
        viewButton.querySelector('.reader-tool-label').textContent = isSpread() ? 'Single page' : 'Two pages';
        zoomButton.setAttribute('aria-pressed', String(zoom));
        zoomButton.setAttribute('aria-label', zoom ? 'Zoom out' : 'Zoom in');
        zoomButton.querySelector('span').textContent = zoom ? 'Fit' : 'Zoom';
        thumbnails.querySelectorAll('button').forEach((button, index) => {
            if (numbers.includes(index + 1)) button.setAttribute('aria-current', 'page');
            else button.removeAttribute('aria-current');
        });
        return label;
    }
    function fitPages() {
        if (!dialog.open || !visible.length || !stage.clientWidth) return;
        const style = getComputedStyle(stage);
        const width = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const height = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
        const ratio = visible.reduce((sum, item) => sum + item.width / item.height, 0);
        const pageHeight = Math.max(1, Math.min(height, (width - visible.length + 1) / ratio)) * (zoom ? 2 : 1);
        [...pages.children].forEach((sheet, index) => {
            sheet.style.width = `${pageHeight * visible[index].width / visible[index].height}px`;
            sheet.style.height = `${pageHeight}px`;
            sheet.setAttribute('aria-label', zoom ? 'Zoom out' : `Zoom in on page ${sheet.dataset.page}`);
        });
        stage.classList.toggle('is-zoomed', zoom);
    }
    function schedulePreload(token) {
        clearTimeout(preloadTimer);
        if (navigator.connection?.saveData || /(^|-)2g$/.test(navigator.connection?.effectiveType || '')) return;
        const book = manifest;
        const shown = numbersFor(page);
        // Only a small neighborhood, never the entire issue or the zoom assets.
        const nearby = [shown.at(-1) + 1, shown.at(-1) + 2, shown[0] - 1, shown[0] - 2];
        preloadTimer = setTimeout(async () => {
            for (const number of nearby) {
                if (!dialog.open || token !== request) return;
                if (number > 0 && number <= book.pages.length) await getImage(book, number, 960, 'low').catch(() => {});
            }
        }, 100);
    }
    async function showPage(number, { resetScroll = true } = {}) {
        if (!dialog.open || !manifest) return;
        readingPage = Math.max(1, Math.min(manifest.pages.length, Math.trunc(Number(number)) || 1));
        page = normalized(readingPage);
        const token = ++request;
        const book = manifest;
        clearTimeout(preloadTimer);
        error.hidden = true;
        const label = updateControls();
        setBusy(true);
        try {
            const numbers = numbersFor(page);
            const loaded = await Promise.all(numbers.map(number => getImage(book, number, zoom ? 1920 : 960)));
            if (!dialog.open || request !== token) return;
            visible = numbers.map(number => book.pages[number - 1]);
            const sheets = loaded.map((image, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'reader-sheet';
                button.dataset.page = numbers[index];
                button.append(image);
                return button;
            });
            const focusWasPage = pages.contains(document.activeElement);
            pages.replaceChildren(...sheets);
            fitPages();
            if (resetScroll) stage.scrollTo(0, 0);
            if (focusWasPage) sheets[0].focus({ preventScroll: true });
            positions.set(book.id, readingPage);
            status.textContent = label;
            setBusy(false);
            schedulePreload(token);
        } catch (_) {
            if (token !== request || !dialog.open) return;
            setBusy(false);
            error.hidden = false;
            status.textContent = 'This page could not load. Please try again.';
        }
    }
    function move(direction) {
        if (!manifest) return;
        zoom = false;
        const step = isSpread() ? 2 : 1;
        showPage(direction > 0 ? (page === 1 ? 2 : page + step) : Math.max(1, page - step));
    }
    function toggleZoom(event) {
        if (!manifest || !visible.length) return;
        // Keep the point under the pointer stable while the pages grow. Keyboard
        // and toolbar zoom use the center of the visible reading area instead.
        const viewport = stage.getBoundingClientRect();
        const before = pages.getBoundingClientRect();
        const pointer = event?.detail > 0;
        const clientX = pointer ? event.clientX : viewport.left + stage.clientWidth / 2;
        const clientY = pointer ? event.clientY : viewport.top + stage.clientHeight / 2;
        const x = Math.max(0, Math.min(1, (clientX - before.left) / before.width));
        const y = Math.max(0, Math.min(1, (clientY - before.top) / before.height));
        zoom = !zoom;
        fitPages();
        if (zoom) {
            const after = pages.getBoundingClientRect();
            stage.scrollTo({
                left: stage.scrollLeft + after.left + x * after.width - clientX,
                top: stage.scrollTop + after.top + y * after.height - clientY,
                behavior: 'instant'
            });
        } else stage.scrollTo(0, 0);
        // Decoding a sharper image must not reset the chosen zoom position.
        showPage(readingPage, { resetScroll: false });
    }
    function buildOverview() {
        if (thumbnails.children.length || !manifest) return;
        const fragment = document.createDocumentFragment();
        manifest.pages.forEach((dimensions, index) => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'reader-thumbnail';
            button.dataset.page = index + 1;
            button.setAttribute('aria-label', `Go to page ${index + 1}`);
            const image = new Image();
            image.alt = '';
            image.width = dimensions.width;
            image.height = dimensions.height;
            image.style.aspectRatio = `${dimensions.width} / ${dimensions.height}`;
            image.loading = 'lazy';
            image.decoding = 'async';
            image.src = source(manifest, index + 1, 240);
            const label = document.createElement('span');
            label.textContent = index + 1;
            button.append(image, label);
            li.append(button);
            fragment.append(li);
        });
        thumbnails.append(fragment);
    }
    function setOverview(open) {
        if (open && !manifest) return;
        overview.hidden = !open;
        body.classList.toggle('has-overview', open);
        overviewButton.setAttribute('aria-expanded', String(open));
        if (open) {
            buildOverview();
            updateControls();
            const selected = thumbnails.querySelector('[aria-current="page"]');
            selected?.scrollIntoView({ block: 'nearest' });
            selected?.focus({ preventScroll: true });
        } else overviewButton.focus({ preventScroll: true });
        fitPages();
    }
    async function loadPublication(entry) {
        const token = ++request;
        setBusy(true);
        error.hidden = true;
        try {
            const book = await getManifest(entry);
            if (!dialog.open || token !== request) return;
            manifest = book;
            pageInput.disabled = progress.disabled = false;
            zoomButton.disabled = viewButton.disabled = overviewButton.disabled = false;
            await showPage(positions.get(book.id) || 1);
        } catch (_) {
            if (token !== request || !dialog.open) return;
            setBusy(false);
            error.hidden = false;
            status.textContent = 'The magazine could not load. Please try again.';
        }
    }
    function openMagazine(entry, trigger) {
        opener = trigger;
        publication = entry;
        manifest = null;
        zoom = false;
        mode = 'auto';
        fullscreenButton.setAttribute('aria-pressed', 'false');
        page = readingPage = 1;
        visible = [];
        pages.replaceChildren();
        thumbnails.replaceChildren();
        overview.hidden = true;
        body.classList.remove('has-overview');
        overviewButton.setAttribute('aria-expanded', 'false');
        find('.reader-title').textContent = entry.title;
        find('.reader-series').textContent = entry.series;
        find('.reader-count').textContent = `/ ${entry.pages}`;
        find('.reader-range').textContent = '';
        status.textContent = 'Opening magazine';
        pageInput.value = progress.value = 1;
        pageInput.disabled = progress.disabled = previous.disabled = next.disabled = true;
        zoomButton.disabled = viewButton.disabled = overviewButton.disabled = true;
        oldOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
        find('[data-reader="close"]').focus({ preventScroll: true });
        // Show the already-loaded cover immediately while the first reading page decodes.
        const cover = trigger.querySelector('img');
        if (cover?.naturalWidth) {
            const preview = cover.cloneNode();
            preview.removeAttribute('loading');
            const sheet = document.createElement('div');
            sheet.className = 'reader-sheet';
            sheet.append(preview);
            pages.append(sheet);
            visible = [{ width: cover.naturalWidth, height: cover.naturalHeight }];
            fitPages();
        }
        loadPublication(entry);
    }
    async function cleanup() {
        ++request;
        clearTimeout(preloadTimer);
        setBusy(false);
        document.body.style.overflow = oldOverflow;
        pages.replaceChildren();
        thumbnails.replaceChildren();
        visible = [];
        manifest = null;
        try { if (fullscreenElement() === shell) await exitFullscreen(); } catch (_) { /* The browser may already be exiting. */ }
        if (!dialog.open) opener?.focus({ preventScroll: true });
    }
    document.querySelectorAll('.transmission-card[data-magazine]').forEach(card => {
        const entry = library.find(book => book.id === card.dataset.magazine);
        if (!entry) return;
        card.addEventListener('click', event => {
            event.preventDefault();
            openMagazine(entry, card);
        });
        const warm = () => getManifest(entry).catch(() => {});
        card.addEventListener('pointerenter', warm, { once: true });
        card.addEventListener('focus', warm, { once: true });
    });
    dialog.addEventListener('close', cleanup);
    dialog.addEventListener('click', event => {
        const action = event.target.closest('[data-reader]')?.dataset.reader;
        if (action === 'close') dialog.close();
        if (action === 'previous') move(-1);
        if (action === 'next') move(1);
        if (action === 'zoom') toggleZoom();
        if (action === 'view') { mode = isSpread() ? 'single' : 'spread'; zoom = false; showPage(readingPage); }
        if (action === 'overview') setOverview(overview.hidden);
        if (action === 'retry') manifest ? showPage(readingPage) : loadPublication(publication);
        if (action === 'fullscreen') toggleFullscreen();
        if (event.target.closest('button.reader-sheet')) toggleZoom(event);
        const thumb = event.target.closest('.reader-thumbnail');
        if (thumb) { zoom = false; setOverview(false); showPage(Number(thumb.dataset.page)); }
    });
    async function toggleFullscreen() {
        fullscreenButton.disabled = true;
        try {
            // Fullscreen the reader's non-dialog shell, keeping its controls and
            // pages together rather than fullscreening the underlying website.
            if (fullscreenElement() === shell) await exitFullscreen();
            else {
                await enterFullscreen.call(shell);
                if (!dialog.open && fullscreenElement() === shell) await exitFullscreen();
            }
        } catch (_) {
            status.textContent = 'Fullscreen is unavailable in this browser.';
        } finally { fullscreenButton.disabled = false; }
    }
    if (!enterFullscreen) fullscreenButton.hidden = true;
    const updateFullscreen = () => {
        const active = fullscreenElement() === shell;
        shell.classList.toggle('is-fullscreen', active);
        fullscreenButton.setAttribute('aria-pressed', String(active));
        fullscreenButton.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
        fitPages();
    };
    document.addEventListener('fullscreenchange', updateFullscreen);
    document.addEventListener('webkitfullscreenchange', updateFullscreen);
    find('.reader-jump').addEventListener('submit', event => { event.preventDefault(); zoom = false; showPage(pageInput.value); pageInput.blur(); });
    pageInput.addEventListener('change', () => { zoom = false; showPage(pageInput.value); });
    progress.addEventListener('change', () => { zoom = false; showPage(progress.value); });
    document.addEventListener('keydown', event => {
        // A navigation button loses focus when it becomes disabled at a book's
        // first or last page; keyboard reading must continue at those edges.
        if (!dialog.open || event.target.matches('input') || event.altKey || event.ctrlKey || event.metaKey || !manifest) return;
        if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); move(1); }
        if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); move(-1); }
        if (event.key === 'Home') { event.preventDefault(); zoom = false; showPage(1); }
        if (event.key === 'End') { event.preventDefault(); zoom = false; showPage(manifest.pages.length); }
    });
    stage.addEventListener('touchstart', event => {
        touchStart = !zoom && event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    }, { passive: true });
    stage.addEventListener('touchend', event => {
        if (!touchStart || zoom || event.touches.length) return;
        const dx = event.changedTouches[0].clientX - touchStart.x;
        const dy = event.changedTouches[0].clientY - touchStart.y;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
        touchStart = null;
    }, { passive: true });
    spreadLayout.addEventListener('change', () => {
        // A new orientation gets its natural layout. The view button can still
        // override that layout until the next orientation/breakpoint change.
        mode = 'auto';
        zoom = false;
        if (dialog.open) showPage(readingPage);
    });
    new ResizeObserver(fitPages).observe(stage);
})();
