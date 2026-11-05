/** Services-page inquiry enhancement. No client data is stored or sent until an explicit action. */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inquiry-form');
    if (!form) return;
    const byId = id => document.getElementById(id);
    const status = byId('inquiry-status');
    const submit = byId('inquiry-submit');
    const endpoint = form.dataset.formEndpoint.trim();
    // This is a public form ID, never an API key. Enable only after recipient verification.
    const directDelivery = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint);
    const fields = [...form.querySelectorAll('.inquiry-fields input, .inquiry-fields select, .inquiry-fields textarea')];
    let handingOff = false;

    let recoveryTimer;
    submit.disabled = !directDelivery;
    form.noValidate = true;
    if (directDelivery) {
        form.action = endpoint;
        byId('inquiry-delivery-note').textContent = "Your inquiry will be sent to Dylan Forsberg. You'll receive a reply by email.";
    }
    document.querySelectorAll('[data-inquiry-link]').forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        link.addEventListener('click', event => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            const services = { photography: 'Photography', video: 'Video Production', websites: 'Website Development', social: 'Social Media Content' };
            const service = services[link.dataset.inquiryService];
            if (service) {
                byId('inquiry-service').value = service;
                byId('inquiry-service').dispatchEvent(new Event('input', { bubbles: true }));
                byId('inquiry-service').dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (location.hash !== '#inquiry-form') history.pushState(null, '', '#inquiry-form');
            requestAnimationFrame(() => {
                const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
                const headerBottom = document.querySelector('body > header').getBoundingClientRect().bottom;
                const formTop = form.getBoundingClientRect().top + window.scrollY;
                const bottom = document.documentElement.scrollHeight;
                // Show the whole form and footer together whenever they fit.
                // On small screens, keep the beginning of the form accessible.
                if (bottom - formTop <= window.innerHeight - headerBottom - 20) {
                    window.scrollTo({ top: bottom, behavior });
                } else {
                    form.scrollIntoView({ block: 'start', behavior });
                }
                byId('inquiry-name').focus({ preventScroll: true });
            });
        });
    });
    function setStatus(message, isError = false) {
        status.textContent = message;
        status.classList.toggle('is-error', isError);
    }
    function clearError(field) {
        field.removeAttribute('aria-invalid');
        const error = byId(`${field.id}-error`);
        if (error) { error.hidden = true; error.textContent = ''; }
    }
    fields.forEach(field => {
        field.addEventListener('input', () => {
            clearError(field);
            setStatus('');
        });
    });
    function validate() {
        let firstInvalid = null;
        for (const field of fields) {
            clearError(field);
            if (field.matches(':disabled')) continue;
            const value = field.value.trim();
            let message = '';
            if (field.required && !value) message = ({ name: 'Please enter your name.', email: 'Please enter your email address.', project: 'Please describe your project.', service: 'Please select a service.' })[field.name];
            else if (field.type === 'email' && field.validity.typeMismatch) message = 'Please enter a valid email address.';
            else if (field.maxLength > 0 && value.length > field.maxLength) message = `Please use ${field.maxLength} characters or fewer.`;
            if (!message) continue;
            field.setAttribute('aria-invalid', 'true');
            let error = byId(`${field.id}-error`);
            if (!error) {
                error = document.createElement('span');
                error.id = `${field.id}-error`;
                error.className = 'field-error';
                field.after(error);
                field.setAttribute('aria-describedby', error.id);
            }
            error.hidden = false;
            error.textContent = message;
            firstInvalid ||= field;
        }
        if (firstInvalid) {
            setStatus('Please check the highlighted fields. Your inquiry has not been sent.', true);
            firstInvalid.focus();
            return false;
        }
        if (form.elements._gotcha.value) {
            setStatus('Unable to submit this inquiry. Please email Dylan.Forsberg@gmail.com directly.', true);
            status.focus();
            return false;
        }
        return true;
    }
    function message() {
        const value = name => form.elements[name].value.trim();
        const subject = `New Project Inquiry — ${value('service') || 'General Inquiry'} — ${value('name')}`.replace(/[\r\n]+/g, ' ');
        const lines = [
            `Name: ${value('name')}`, `Email: ${value('email')}`,
            `Phone: ${value('phone') || 'Not provided'}`,
            `Business / Organization: ${value('organization') || 'Not provided'}`,
            `Service of Interest: ${value('service') || 'Not specified'}`,
            `Preferred Timeline: ${value('timeline') || 'Not specified'}`,
            `Preferred Communication: ${value('communication')}`
        ];
        lines.push('', 'Project Description:', value('project'));
        return { subject, body: lines.join('\n') };
    }
    form.addEventListener('submit', event => {
        if (handingOff) { event.preventDefault(); return; }
        if (!directDelivery) {
            event.preventDefault();
            setStatus('Online submission is unavailable. Please email Dylan.Forsberg@gmail.com directly.', true);
            return;
        }
        if (!validate()) { event.preventDefault(); return; }
        const { subject, body } = message();
        form.elements.subject.value = subject;
        form.elements.message.value = body;
        form.elements.email.value = form.elements.email.value.trim();
        // Use Formspree's standard POST so its hosted spam challenge and confirmation remain available.
        // No local "sent" state: only the provider can confirm receipt after processing the submission.
        handingOff = true;
        submit.disabled = true;
        form.setAttribute('aria-busy', 'true');
        setStatus('Submitting your inquiry. Please complete any verification on the next page.');
        recoveryTimer = setTimeout(() => {
            handingOff = false;
            submit.disabled = false;
            form.removeAttribute('aria-busy');
            setStatus('If the confirmation page did not open, please try again or email Dylan.Forsberg@gmail.com. Receipt has not been confirmed here.');
        }, 12000);
    });
    window.addEventListener('pageshow', () => {
        clearTimeout(recoveryTimer);
        handingOff = false;
        submit.disabled = !directDelivery;
        form.removeAttribute('aria-busy');
        setStatus('');
    });
});
