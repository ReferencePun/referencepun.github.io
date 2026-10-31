(() => {
    'use strict';
    const switcher = document.querySelector('.photography-switcher');
    const buttons = [...switcher.querySelectorAll('[data-collection]')];
    const region = document.getElementById('photography-gallery');
    const status = document.getElementById('collection-status');
    const collections = window.photographyCollections;
    const gallery = initGallery(collections.portraits);
    let selected = 'portraits';

    function select(button) {
        const collection = button.dataset.collection;
        if (collection === selected) return;
        gallery.setImages(collections[collection]);
        selected = collection;
        buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        region.setAttribute('aria-labelledby', button.id);
        status.textContent = `${button.textContent}, ${collections[collection].length} photographs.`;
    }

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => select(button));
        button.addEventListener('keydown', event => {
            let target;
            if (event.key === 'ArrowRight') target = buttons[(index + 1) % buttons.length];
            else if (event.key === 'ArrowLeft') target = buttons[(index + buttons.length - 1) % buttons.length];
            else if (event.key === 'Home') target = buttons[0];
            else if (event.key === 'End') target = buttons.at(-1);
            if (!target) return;
            event.preventDefault();
            target.focus({ preventScroll: true });
            select(target);
        });
    });
})();
