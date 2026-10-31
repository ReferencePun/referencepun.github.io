(() => {
    'use strict';
    const buttons = [...document.querySelectorAll('.photography-switcher [data-collection]')];
    const region = document.getElementById('photography-gallery');
    const status = document.getElementById('collection-status');
    const collections = window.photographyCollections;
    const gallery = initGallery(collections.portraits);
    let selected = 'portraits';

    function select(button) {
        const collection = button.dataset.collection;
        if (collection === selected) return;
        const keepPosition = button.closest('.photography-switcher--bottom');
        const previousTop = button.getBoundingClientRect().top;
        gallery.setImages(collections[collection]);
        selected = collection;
        buttons.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.collection === collection)));
        region.setAttribute('aria-labelledby', `${collection}-selector`);
        status.textContent = `${button.textContent}, ${collections[collection].length} photographs.`;
        if (keepPosition) requestAnimationFrame(() => {
            window.scrollBy(0, button.getBoundingClientRect().top - previousTop);
        });
    }

    buttons.forEach(button => {
        const siblings = [...button.parentElement.querySelectorAll('[data-collection]')];
        const index = siblings.indexOf(button);
        button.addEventListener('click', () => select(button));
        button.addEventListener('keydown', event => {
            let target;
            if (event.key === 'ArrowRight') target = siblings[(index + 1) % siblings.length];
            else if (event.key === 'ArrowLeft') target = siblings[(index + siblings.length - 1) % siblings.length];
            else if (event.key === 'Home') target = siblings[0];
            else if (event.key === 'End') target = siblings.at(-1);
            if (!target) return;
            event.preventDefault();
            target.focus({ preventScroll: true });
            select(target);
        });
    });
})();
