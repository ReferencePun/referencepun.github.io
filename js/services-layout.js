// Align the catalogue and keep its disclosures easy to open and close.
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('body > header');
    const page = document.querySelector('.services-page');
    if (!page) return;

    if (header && page) {
        const alignOpening = () => page.style.setProperty('--services-header-height', `${header.getBoundingClientRect().height}px`);
        alignOpening();
        new ResizeObserver(alignOpening).observe(header);
    }

    document.querySelectorAll('details.service-offering, details.service-terms').forEach(offering => {
        const summary = offering.querySelector('summary');
        const panel = offering.querySelector('.service-details');
        if (!summary || !panel) return;
        panel.id ||= `${offering.id}-details`;
        summary.setAttribute('aria-controls', panel.id);
        const syncExpanded = () => summary.setAttribute('aria-expanded', String(offering.open));
        syncExpanded();
        offering.addEventListener('toggle', syncExpanded);
        const close = () => {
            offering.open = false;
            syncExpanded();
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
