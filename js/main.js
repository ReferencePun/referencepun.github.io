/** Shared navigation and footer behavior. */
document.addEventListener('DOMContentLoaded', () => {
    const currentYear = document.getElementById('current-year');
    if (currentYear) currentYear.textContent = new Date().getFullYear();

    const button = document.getElementById('mobile-menu');
    const nav = document.querySelector('header nav');
    if (!button || !nav) return;
    const mobile = matchMedia('(max-width: 768px)');
    function setOpen(open) {
        const expanded = mobile.matches && open;
        nav.classList.toggle('active', expanded);
        button.classList.toggle('active', expanded);
        button.setAttribute('aria-expanded', String(expanded));
        button.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
        nav.inert = mobile.matches && !expanded;
        if (nav.inert) nav.setAttribute('aria-hidden', 'true');
        else nav.removeAttribute('aria-hidden');
    }
    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', event => {
        if (event.target.closest('a')) setOpen(false);
    });
    document.querySelector('header').addEventListener('keydown', event => {
        if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            button.focus();
        }
    });
    mobile.addEventListener('change', () => setOpen(false));
    setOpen(false);

    const current = location.pathname.replace(/\/index\.html$/, '/');
    nav.querySelectorAll('a').forEach(link => {
        const target = new URL(link.href).pathname.replace(/\/index\.html$/, '/');
        const active = current === target || (current.startsWith('/articles/') && target === '/writing.html');
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
});
