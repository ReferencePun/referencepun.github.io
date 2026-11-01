/** One selected film, with direct links and browser history preserved. */
(() => {
    const page = document.querySelector('.video-page');
    if (!page) return;
    const films = [...page.querySelectorAll('.film-feature')];
    const choices = [...page.querySelectorAll('.film-choice')];
    const status = page.querySelector('#film-selection-status');
    let selected = null;

    function selectFilm(id, moveToFilm = false) {
        const film = films.find(item => item.id === id) || films[0];
        if (film !== selected) {
            films.forEach(item => {
                item.querySelector('iframe')?.remove();
                item.querySelector('.film-play').hidden = false;
                item.hidden = item !== film;
            });
            choices.forEach(choice => {
                if (choice.hash === `#${film.id}`) choice.setAttribute('aria-current', 'true');
                else choice.removeAttribute('aria-current');
            });
            selected = film;
            if (moveToFilm) status.textContent = `${film.querySelector('h2').textContent} selected.`;
        }
        if (moveToFilm) {
            film.querySelector('h2').focus({ preventScroll: true });
            film.scrollIntoView({ block: 'start', behavior: 'instant' });
        }
    }

    choices.forEach(choice => choice.addEventListener('click', event => {
        // Preserve normal open-in-new-tab behavior for modified clicks.
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (location.hash !== choice.hash) history.pushState(null, '', choice.hash);
        selectFilm(choice.hash.slice(1), true);
    }));

    page.querySelectorAll('.film-play').forEach(play => play.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const player = play.closest('.film-player');
        if (player.querySelector('iframe')) return;
        const iframe = document.createElement('iframe');
        iframe.src = `https://player.vimeo.com/video/${player.dataset.vimeoId}?autoplay=1&autopause=1&playsinline=1&badge=0`;
        iframe.title = player.closest('.film-feature').querySelector('h2').textContent;
        iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
        iframe.allowFullscreen = true;
        play.hidden = true;
        player.append(iframe);
        iframe.focus();
    }));

    page.classList.add('is-interactive');
    selectFilm(location.hash.slice(1));
    window.addEventListener('hashchange', () => selectFilm(location.hash.slice(1), true));
})();
