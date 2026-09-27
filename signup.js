document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const eyeIcon = document.getElementById('eye-icon');

    // Supabase client instance fetch karein
    const supabase = window.supabaseClient || window._supabase || (typeof window.supabase !== 'undefined' ? window.supabase : null);

    // Password Show/Hide Toggle
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            if (eyeIcon) {
                eyeIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
                if (window.lucide) lucide.createIcons();
            }
        });
    }

    const showError = (input) => {
        const formGroup = input ? input.closest('.form-group') : null;
        if (formGroup) formGroup.classList.add('error');
    };

    const clearError = (input) => {
        const formGroup = input ? input.closest('.form-group') : null;
        if (formGroup) formGroup.classList.remove('error');
    };

    [fullnameInput, emailInput, phoneInput, passwordInput].forEach(input => {
        if (input) input.addEventListener('input', () => clearError(input));
    });

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let isValid = true;

            const nameVal = fullnameInput ? fullnameInput.value.trim() : '';
            const emailVal = emailInput ? emailInput.value.trim() : '';
            const phoneVal = phoneInput ? phoneInput.value.trim() : '';
            const passVal = passwordInput ? passwordInput.value : '';

            if (nameVal.length < 2) { showError(fullnameInput); isValid = false; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) { showError(emailInput); isValid = false; }
            if (!/^[0-9+\s-]{10,15}$/.test(phoneVal)) { showError(phoneInput); isValid = false; }
            if (passVal.length < 6) { showError(passwordInput); isValid = false; }

            if (!isValid) return;

            const submitBtn = document.getElementById('submit-btn');
            const btnText = document.getElementById('btn-text');
            if (submitBtn) submitBtn.disabled = true;
            if (btnText) btnText.textContent = "Creating Account...";

            try {
                if (!supabase) {
                    alert('Supabase client is not loaded!');
                    if (submitBtn) submitBtn.disabled = false;
                    if (btnText) btnText.textContent = "Create Account";
                    return;
                }

                // Standard Supabase Auth Signup
                const { data, error } = await supabase.auth.signUp({
                    email: emailVal,
                    password: passVal,
                    options: {
                        data: {
                            full_name: nameVal,
                            phone: phoneVal
                        }
                    }
                });

                if (error) {
                    alert('Signup Failed: ' + error.message);
                    if (submitBtn) submitBtn.disabled = false;
                    if (btnText) btnText.textContent = "Create Account";
                    return;
                }

                // Save to 'profiles' table for Phone Login Search
                if (data && data.user) {
                    await supabase.from('profiles').upsert({
                        id: data.user.id,
                        full_name: nameVal,
                        phone: phoneVal
                    });
                }

                alert('Account created successfully! Redirecting to login...');
                window.location.href = 'login.html';

            } catch (err) {
                console.error('Unexpected Signup Error:', err);
                alert('An unexpected error occurred during signup.');
                if (submitBtn) submitBtn.disabled = false;
                if (btnText) btnText.textContent = "Create Account";
            }
        });
    }
});