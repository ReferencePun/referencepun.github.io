/** Services-page inquiry enhancement. No client data is stored or sent until an explicit action. */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inquiry-form');
    if (!form) return;
    const byId = id => document.getElementById(id);
    const recipient = 'Dylan.Forsberg@gmail.com';
    const status = byId('inquiry-status');
    const draft = byId('inquiry-draft');
    const submit = byId('inquiry-submit');
    const fallback = byId('inquiry-fallback');
    const callFields = byId('inquiry-call-fields');
    const endpoint = form.dataset.formEndpoint.trim();
    // This is a public form ID, never an API key. Unconfigured or invalid endpoints use email drafts.
    const directDelivery = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint);
    const fields = [...form.querySelectorAll('.inquiry-fields input, .inquiry-fields select, .inquiry-fields textarea')];
    let handingOff = false;

    form.hidden = false;
    form.noValidate = true;
    if (directDelivery) {
        form.action = endpoint;
        submit.textContent = 'Send Inquiry';
        fallback.hidden = false;
        byId('inquiry-delivery-note').textContent = 'Your inquiry is sent securely through Formspree. Complete any verification and wait for its confirmation page.';
    }
    function updateCallFields() {
        const wantsCall = form.elements.communication.value === 'Phone call';
        callFields.hidden = !wantsCall;
        callFields.disabled = !wantsCall;
    }
    updateCallFields();
    form.elements.communication.addEventListener('change', updateCallFields);
    document.querySelectorAll('[data-inquiry-link]').forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        link.addEventListener('click', () => {
            byId('inquiry-details').open = true;
            requestAnimationFrame(() => byId('inquiry-name').focus({ preventScroll: true }));
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
            draft.hidden = true;
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
            if (field.required && !value) message = ({ name: 'Please enter your name.', email: 'Please enter your email address.', project: 'Please describe your project.' })[field.name];
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
            setStatus('Unable to prepare this inquiry. Please email Dylan.Forsberg@gmail.com directly.', true);
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
            `Business / Organization: ${value('organization') || 'Not provided'}`,
            `Service of Interest: ${value('service') || 'Not specified'}`,
            `Preferred Timeline: ${value('timeline') || 'Not specified'}`,
            `Preferred Communication: ${value('communication')}`
        ];
        if (value('communication') === 'Phone call') {
            lines.push(`Phone Number: ${value('phone') || 'Not provided'}`, `Convenient Calling Times: ${value('calling_times') || 'To arrange by email'}`);
        }
        lines.push('', 'Project Description:', value('project'));
        return { subject, body: lines.join('\n') };
    }
    function prepareDraft() {
        if (!validate()) return;
        const { subject, body } = message();
        byId('inquiry-open-draft').href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        byId('inquiry-draft-text').value = `To: ${recipient}\nSubject: ${subject}\n\n${body}`;
        draft.hidden = false;
        setStatus('Email draft ready — it has not been sent. Review and send it from your email app.');
        // Some email clients truncate very long mailto URLs. Always keep a complete copyable draft.
        byId('inquiry-draft-help').textContent = body.length > 1500
            ? 'Your draft is ready, but has not been sent. For a long inquiry, copy the full draft below into your email app to avoid missing details.'
            : 'Your draft is ready. It has not been sent. Open it in your email app, then review and send it.';
        byId('inquiry-open-draft').focus();
    }
    form.addEventListener('submit', event => {
        if (handingOff) { event.preventDefault(); return; }
        if (!directDelivery) { event.preventDefault(); prepareDraft(); return; }
        if (!validate()) { event.preventDefault(); return; }
        const { subject, body } = message();
        form.elements.subject.value = subject;
        form.elements.message.value = body;
        form.elements.email.value = form.elements.email.value.trim();
        // Use Formspree's standard POST so its hosted spam challenge and confirmation remain available.
        // No local "sent" state: only the provider can confirm receipt after processing the submission.
        handingOff = true;
        submit.disabled = true;
        setStatus('Opening secure delivery. Your inquiry is not confirmed until the next page confirms receipt.');
        setTimeout(() => {
            handingOff = false;
            submit.disabled = false;
            setStatus('If delivery did not open, try again or use an email draft. Receipt has not been confirmed here.');
        }, 12000);
    });
    fallback.addEventListener('click', prepareDraft);
    byId('inquiry-copy').addEventListener('click', async () => {
        const text = byId('inquiry-draft-text');
        try {
            await navigator.clipboard.writeText(text.value);
            setStatus('Draft copied. Paste it into an email to Dylan.Forsberg@gmail.com, then review and send.');
        } catch {
            text.focus(); text.select();
            setStatus('Select and copy the draft, then paste it into your email app. It has not been sent.');
        }
    });
    window.addEventListener('pageshow', () => { handingOff = false; submit.disabled = false; });
});
