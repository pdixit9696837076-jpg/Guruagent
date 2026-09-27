document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.supabaseClient || window._supabase;

    document.addEventListener('click', async event => {
        const toggle = event.target.closest('.sidebar-toggle');
        if (toggle) {
            const sidebar = toggle.closest('.sidebar');
            const expanded = sidebar.classList.toggle('is-expanded');
            toggle.setAttribute('aria-expanded', String(expanded));
            toggle.setAttribute('aria-label', expanded ? 'Collapse navigation' : 'Expand navigation');
            if (!expanded) toggle.blur();
            return;
        }

    });

    if (!supabase) return;

    const getInitials = (name, email) => {
        const source = name || email?.split('@')[0] || 'U';
        return source
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0].toUpperCase())
            .join('');
    };

    const updateSidebar = async () => {
        const userMenus = document.querySelectorAll('.mini-user');
        if (!userMenus.length) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const metadata = user.user_metadata || {};
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle();

        const name = profile?.full_name || metadata.full_name || metadata.name || user.email?.split('@')[0] || 'User';
        const email = user.email || 'Account';
        const avatarUrl = profile?.avatar_url || metadata.avatar_url || '';
        const initials = getInitials(name, email);

        userMenus.forEach(menu => {
            const avatar = menu.querySelector('.avatar');
            const details = menu.querySelector(':scope > span:last-child, :scope > div:last-child');
            const nameElement = details?.querySelector('strong');
            const emailElement = details?.querySelector('small, span');

            if (avatar) {
                avatar.textContent = avatarUrl ? '' : initials;
                avatar.style.backgroundImage = avatarUrl ? `url("${avatarUrl.replace(/"/g, '%22')}")` : '';
                avatar.style.backgroundSize = avatarUrl ? 'cover' : '';
                avatar.style.backgroundPosition = avatarUrl ? 'center' : '';
                avatar.style.backgroundRepeat = avatarUrl ? 'no-repeat' : '';
                avatar.dataset.profileLoaded = 'true';
                avatar.setAttribute('aria-label', `${name} profile picture`);
            }

            if (nameElement) nameElement.textContent = name;
            if (emailElement) emailElement.textContent = email;
        });
    };

    await updateSidebar();

    const observer = new MutationObserver(() => {
        if ([...document.querySelectorAll('.mini-user .avatar')].some(avatar => !avatar.dataset.profileLoaded)) {
            updateSidebar();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
});
