// Project photographs stay on the alternate homepage.
document.querySelectorAll('[data-project]').forEach(button => {
    const dialog = document.getElementById(button.dataset.project);
    let previousOverflow = '';

    button.addEventListener('click', () => {
        previousOverflow = document.body.style.overflow;
        dialog.showModal();
        dialog.scrollTop = 0;
        document.body.style.overflow = 'hidden';
    });
    dialog.querySelector('.close-project').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
        document.body.style.overflow = previousOverflow;
        button.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right
            || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
});
