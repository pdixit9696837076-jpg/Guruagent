document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.supabaseClient || window._supabase || (typeof window.supabase !== 'undefined' ? window.supabase : null);

    const displayName = document.getElementById('display-name');
    const displayEmail = document.getElementById('display-email');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const dobInput = document.getElementById('dob');
    const homeAddressInput = document.getElementById('home-address');
    const workAddressInput = document.getElementById('work-address');
    const academicForm = document.getElementById('academic-form');
    const targetExamInput = document.getElementById('target-exam');
    const targetYearInput = document.getElementById('target-year');
    const studyHoursInput = document.getElementById('study-hours');
    const personalForm = document.getElementById('personal-form');
    const securityForm = document.getElementById('security-form');
    const logoutBtn = document.getElementById('logout-btn');

    const showToast = (message) => {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-message');
        if (toast && toastMsg) {
            toastMsg.textContent = message;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3000);
        }
    };

    // Session Verify Logic
    async function initProfile() {
        if (!supabase) return;

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            console.warn('No active session, redirecting to login...');
            window.location.href = 'login.html';
            return;
        }

        const user = session.user;
        const metadata = user.user_metadata || {};
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
        const profile = profileData || {};
        const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop';
        const avatarPreview = document.getElementById('profile-img-preview');
        const value = (key, fallback = '') => profile[key] ?? metadata[key] ?? fallback;

        const fullName = value('full_name', user.email.split('@')[0]);
        const phone = value('phone', user.phone || '');

        if (displayName) displayName.textContent = fullName;
        if (displayEmail) displayEmail.textContent = user.email;
        if (avatarPreview) avatarPreview.src = value('avatar_url', defaultAvatar);
        if (fullnameInput) fullnameInput.value = fullName;
        if (emailInput) emailInput.value = user.email;
        if (phoneInput) phoneInput.value = phone;
        if (dobInput) dobInput.value = value('dob');
        if (homeAddressInput) homeAddressInput.value = value('home_address');
        if (workAddressInput) workAddressInput.value = value('work_address');
        if (targetExamInput) targetExamInput.value = value('target_exam', 'bca');
        if (targetYearInput) targetYearInput.value = value('target_year', '2026');
        if (studyHoursInput) studyHoursInput.value = value('study_hours', 4);
    }

    await initProfile();

    const avatarInput = document.getElementById('avatar-upload');
    if (avatarInput) {
        avatarInput.addEventListener('change', async () => {
            const file = avatarInput.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                avatarInput.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Profile image must be smaller than 5 MB.');
                avatarInput.value = '';
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = 'login.html';
                return;
            }

            const extension = file.name.split('.').pop().toLowerCase() || 'jpg';
            const filePath = `${user.id}/avatar.${extension}`;
            const { error: uploadError } = await supabase.storage
                .from('profile-images')
                .upload(filePath, file, { upsert: true, contentType: file.type });

            if (uploadError) {
                console.error('Avatar upload failed.', uploadError);
                alert(`Avatar upload failed: ${uploadError.message}`);
                avatarInput.value = '';
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from('profile-images')
                .getPublicUrl(filePath);
            const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
            const { error: avatarProfileError } = await supabase
                .from('profiles')
                .upsert({ id: user.id, avatar_url: avatarUrl }, { onConflict: 'id' });

            if (avatarProfileError) {
                console.error('Avatar URL save failed.', avatarProfileError);
                alert(`Avatar URL save failed: ${avatarProfileError.message}`);
                avatarInput.value = '';
                return;
            }

            const avatarPreview = document.getElementById('profile-img-preview');
            if (avatarPreview) avatarPreview.src = avatarUrl;
            avatarInput.value = '';
            showToast('Profile picture updated successfully!');
        });
    }

    // Update Profile Data
    if (personalForm) {
        personalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProfile({
                full_name: fullnameInput ? fullnameInput.value.trim() : '',
                phone: phoneInput ? phoneInput.value.trim() : '',
                dob: dobInput ? dobInput.value : '',
                home_address: homeAddressInput ? homeAddressInput.value.trim() : '',
                work_address: workAddressInput ? workAddressInput.value.trim() : ''
            }, 'Profile details updated successfully!');
        });
    }

    if (academicForm) {
        academicForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProfile({
                target_exam: targetExamInput ? targetExamInput.value : '',
                target_year: targetYearInput ? targetYearInput.value : '',
                study_hours: studyHoursInput ? Number(studyHoursInput.value) : 4
            }, 'Study preferences updated successfully!');
        });
    }

    if (securityForm) {
        securityForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!supabase) {
                alert('Supabase client not initialized!');
                return;
            }

            const currentPassword = document.getElementById('current-pwd')?.value || '';
            const newPassword = document.getElementById('new-pwd')?.value || '';
            const confirmPassword = document.getElementById('confirm-pwd')?.value || '';
            const submitButton = securityForm.querySelector('button[type="submit"]');

            if (newPassword.length < 6) {
                alert('New password must be at least 6 characters long.');
                return;
            }

            if (newPassword !== confirmPassword) {
                alert('New password and confirmation do not match.');
                return;
            }

            if (currentPassword === newPassword) {
                alert('New password must be different from the current password.');
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) {
                window.location.href = 'login.html';
                return;
            }

            if (submitButton) submitButton.disabled = true;

            try {
                const { error: verifyError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: currentPassword
                });

                if (verifyError) {
                    alert('Current password is incorrect.');
                    return;
                }

                const { error: updateError } = await supabase.auth.updateUser({
                    password: newPassword
                });

                if (updateError) {
                    console.error('Password update failed.', updateError);
                    alert(`Password update failed: ${updateError.message}`);
                    return;
                }

                await supabase.auth.signOut();
                alert('Password updated successfully. Please log in with your new password.');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Unexpected password update error.', error);
                alert('Unable to update password right now. Please try again.');
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    async function saveProfile(values, successMessage) {
        if (!supabase) {
            alert('Supabase client not initialized!');
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ id: user.id, ...values }, { onConflict: 'id' });

        if (profileError) {
            console.error('Profile table update failed.', profileError);
            alert(`Profile table update failed: ${profileError.message}`);
            return;
        }

        const { error: authError } = await supabase.auth.updateUser({ data: values });
        if (authError) {
            console.warn('Database profile was saved, but auth metadata update failed.', authError);
        }

        if (displayName && values.full_name !== undefined) displayName.textContent = values.full_name;
        showToast(successMessage);
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                await supabase.auth.signOut();
                window.location.href = 'login.html';
            }
        });
    }

    // Tab navigation logic
    const tabs = document.querySelectorAll('.nav-tab[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const content = document.getElementById(targetTab);
            if (content) content.classList.add('active');
        });
    });

    if (location.hash === '#security') {
        document.querySelector('.nav-tab[data-tab="security"]')?.click();
    }
});