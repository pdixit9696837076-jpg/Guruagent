document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginInput = document.getElementById('loginInput');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  const loginCard = document.querySelector('.login-card');

  const supabase = window.supabaseClient || window._supabase || (typeof window.supabase !== 'undefined' ? window.supabase : null);

  const clearError = (input) => {
    if (!input) return;
    const parentGroup = input.closest('.input-group') || input.closest('.form-group');
    if (parentGroup) parentGroup.classList.remove('error');
  };

  const setError = (input) => {
    if (!input) return;
    const parentGroup = input.closest('.input-group') || input.closest('.form-group');
    if (parentGroup) parentGroup.classList.add('error');
  };

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassword.classList.toggle('fa-eye');
      togglePassword.classList.toggle('fa-eye-slash');
    });
  }

  if (loginInput) loginInput.addEventListener('input', () => clearError(loginInput));
  if (passwordInput) passwordInput.addEventListener('input', () => clearError(passwordInput));

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      let isValid = true;
      const rawInputValue = loginInput ? loginInput.value.trim() : '';
      const passwordValue = passwordInput ? passwordInput.value : '';

      if (!rawInputValue) { setError(loginInput); isValid = false; }
      if (passwordValue.length < 6) { setError(passwordInput); isValid = false; }

      if (!isValid) {
        if (loginCard) {
          loginCard.classList.remove('shake');
          void loginCard.offsetWidth;
          loginCard.classList.add('shake');
        }
        return;
      }

      const submitBtn = document.getElementById('submitBtn') || document.getElementById('submit-btn');
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '<span>Log In</span>';
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Logging in...</span>';
      }

      try {
        if (!supabase) {
          alert('Supabase client not initialized!');
          resetButton(submitBtn, originalBtnHTML);
          return;
        }

        let targetEmail = rawInputValue;

        // Check karein ki user ne Email dala hai ya Phone Number
        const isEmail = rawInputValue.includes('@');

        if (!isEmail) {
          // Phone number se email find karein
          const { data: profileData, error: profileErr } = await supabase
            .from('profiles')
            .select('email')
            .eq('phone', rawInputValue)
            .maybeSingle();

          if (profileErr || !profileData) {
            alert('Is phone number se koi account registered nahi hai!');
            if (loginCard) {
              loginCard.classList.remove('shake');
              void loginCard.offsetWidth;
              loginCard.classList.add('shake');
            }
            resetButton(submitBtn, originalBtnHTML);
            return;
          }

          targetEmail = profileData.email;
        }

        // Standard Supabase Auth Login with Email
        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: passwordValue,
        });

        if (error) {
          alert('Login Error: ' + error.message);
          if (loginCard) {
            loginCard.classList.remove('shake');
            void loginCard.offsetWidth;
            loginCard.classList.add('shake');
          }
          resetButton(submitBtn, originalBtnHTML);
          return;
        }

        // Open the personalized dashboard and its plan prompt after every login.
        window.location.href = 'dasboard.html?openPlan=1';

      } catch (err) {
        console.error('Unexpected Login Error:', err);
        alert('An unexpected error occurred.');
        resetButton(submitBtn, originalBtnHTML);
      }
    });
  }

  function resetButton(btn, originalHTML) {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  }
});