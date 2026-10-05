// Sections below the hero — nav scrolling + active state, scroll reveals,
// count-ups, and the Taste section's flavor buttons (which reuse the hero's switch).
(() => {
    const header = document.querySelector('.header');
    const navItems = [...document.querySelectorAll('.nav-item')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- Nav: smooth scroll + active item follows the section in view ----------
    const scrollToId = (id) => {
        const target = document.querySelector(id);
        if (target) target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    };

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id.length < 2) return;
            e.preventDefault();
            scrollToId(id);
        });
    });

    document.querySelector('.contact-btn')?.addEventListener('click', () => scrollToId('#contact'));

    const setActive = (id) => {
        navItems.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            // The CTA/footer belongs to the Reviews item.
            setActive(entry.target.id === 'contact' ? 'reviews' : entry.target.id);
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    ['#home', '#ingredients', '#taste', '#eco', '#reviews', '#contact'].forEach(id => {
        const el = document.querySelector(id);
        if (el) sectionObserver.observe(el);
    });

    // ---------- Header backing once the hero has scrolled away ----------
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---------- Count-ups ----------
    const countUp = (el) => {
        const to = parseFloat(el.dataset.to) || 0;
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const format = (v) => v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        if (reducedMotion || to === 0) { el.textContent = format(to); return; }
        const state = { v: 0 };
        gsap.to(state, {
            v: to,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: () => { el.textContent = format(state.v); },
        });
    };

    // ---------- Scroll reveals (staggered within each group) ----------
    const groups = new Map();
    document.querySelectorAll('.reveal').forEach(el => {
        const parent = el.parentElement;
        const index = groups.get(parent) ?? 0;
        groups.set(parent, index + 1);
        el.style.setProperty('--d', `${Math.min(index, 6) * 0.08}s`);
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            entry.target.querySelectorAll('.count').forEach(countUp);
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ---------- Taste: switch flavor through the hero's own cards ----------
    // Scroll up first so the reader sees the can spin and the berries swap.
    document.querySelectorAll('.flavor-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = document.querySelector(`.card[data-flavor="${btn.dataset.flavor}"]`);
            if (!card || card.classList.contains('active') || isSwitching) return;
            window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
            setTimeout(() => card.click(), reducedMotion ? 0 : 600);
        });
    });
})();
