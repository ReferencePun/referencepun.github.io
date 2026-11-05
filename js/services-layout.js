// Align the catalogue and keep its disclosures easy to open and close.
document.addEventListener('DOMContentLoaded', () => {
    const price = document.querySelector('#social .service-price:last-child dd');
    const note = document.querySelector('.service-quote');
    const header = document.querySelector('body > header');
    const page = document.querySelector('.services-page');
    if (!price || !note) return;

    function alignNote() {
        const text = document.createRange();
        text.selectNodeContents(price);
        const right = text.getBoundingClientRect().right;
        const left = note.getBoundingClientRect().left;
        if (right > left) note.style.maxWidth = `${right - left}px`;
    }

    alignNote();
    document.fonts.ready.then(alignNote);
    document.fonts.addEventListener('loadingdone', alignNote);
    new ResizeObserver(alignNote).observe(price.closest('.service-prices'));
    window.addEventListener('resize', alignNote, { passive: true });

    if (header && page) {
        const alignOpening = () => page.style.setProperty('--services-header-height', `${header.getBoundingClientRect().height}px`);
        alignOpening();
        new ResizeObserver(alignOpening).observe(header);
    }

    document.querySelectorAll('details.service-offering').forEach(offering => {
        const summary = offering.querySelector('summary');
        const panel = offering.querySelector('.service-details');
        const close = () => {
            offering.open = false;
            summary.focus({ preventScroll: true });
            const top = summary.getBoundingClientRect().top;
            const visibleTop = (header?.getBoundingClientRect().bottom || 0) + 16;
            if (top < visibleTop) window.scrollBy({ top: top - visibleTop, behavior: 'instant' });
        };
        panel?.addEventListener('click', event => {
            if (!offering.open || event.target.closest('a, button, input, select, textarea, [contenteditable]')) return;
            if (window.getSelection()?.isCollapsed === false) return;
            close();
        });
        offering.addEventListener('keydown', event => {
            if (event.key === 'Escape' && offering.open) {
                event.preventDefault();
                close();
            }
        });
    });
});
