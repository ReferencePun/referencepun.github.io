// Keep the custom-projects note within the visible price text above it.
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
});
