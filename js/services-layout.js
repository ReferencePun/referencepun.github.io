// Align the catalogue and keep its disclosures easy to open and close.
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('body > header');
    const page = document.querySelector('.services-page');
    if (!page) return;

    const opening = page.querySelector('.services-opening');
    const intro = page.querySelector('.services-intro');
    if (header && opening && intro) {
        const alignOpening = () => {
            const headerHeight = header.getBoundingClientRect().height;
            page.style.setProperty('--services-header-height', `${headerHeight}px`);
            const introStyle = getComputedStyle(intro);
            const count = page.querySelectorAll('.service-offering').length;
            const available = window.innerHeight - headerHeight - parseFloat(getComputedStyle(page).paddingTop)
                - intro.getBoundingClientRect().height - parseFloat(introStyle.marginBottom)
                - parseFloat(getComputedStyle(opening).paddingBottom) - (count - 1);
            const naturalHeight = Math.max(...Array.from(page.querySelectorAll('.service-row'), row => {
                const style = getComputedStyle(row);
                return Math.max(...Array.from(row.children, child => child.getBoundingClientRect().height))
                    + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
            }));
            page.style.setProperty('--services-row-min-height', `${Math.max(naturalHeight, available / count)}px`);
        };
        alignOpening();
        const observer = new ResizeObserver(alignOpening);
        observer.observe(header);
        observer.observe(intro);
        window.addEventListener('resize', alignOpening, { passive: true });
        document.fonts.ready.then(alignOpening);
    }

    document.querySelectorAll('details.service-offering').forEach(offering => {
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
