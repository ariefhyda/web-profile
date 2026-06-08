/**
 * Docker Course Layout Component
 * Menangani pembuatan Sidebar, Navbar, dan Mobile Menu secara dinamis.
 * Pola sama dengan course lain — `url` memakai absolute path agar
 * pencocokan link aktif konsisten dengan window.location.pathname.
 */
const courseConfig = {
    courseName: "Docker",
    profileUrl: "../index.html",
    courseIcon: `<svg width="24" height="24" viewBox="0 0 40 40" fill="none">
        <rect x="9" y="15" width="5" height="5" rx="0.5" fill="currentColor"/>
        <rect x="15" y="15" width="5" height="5" rx="0.5" fill="currentColor"/>
        <rect x="21" y="15" width="5" height="5" rx="0.5" fill="currentColor"/>
        <rect x="15" y="9" width="5" height="5" rx="0.5" fill="currentColor"/>
        <rect x="21" y="9" width="5" height="5" rx="0.5" fill="currentColor"/>
        <path d="M5 21h27c0 5-4 9-10.5 9H14.5C9 30 5 26.5 5 22.5V21z" fill="currentColor" opacity="0.65"/>
        <path d="M32 19c1.5-1.2 3.2-0.6 3.5 0-0.2 1.4-1.8 2-3.5 1.4" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    </svg>`,
    modules: [
        {
            group: "Bagian 1 — Fondasi Container",
            items: [
                { title: "Pengantar Docker & Kontainerisasi", url: "/docker/index.html", icon: "1" },
                { title: "Arsitektur Docker", url: "/docker/arsitektur.html", icon: "2" },
                { title: "Instalasi & Perintah Dasar", url: "/docker/perintah-dasar.html", icon: "3" }
            ]
        },
        {
            group: "Bagian 2 — Image & Container",
            items: [
                { title: "Docker Image & Dockerfile", url: "/docker/dockerfile.html", icon: "4" },
                { title: "Lifecycle & Manajemen Container", url: "/docker/container-lifecycle.html", icon: "5" },
                { title: "Volume & Persistensi Data", url: "/docker/volumes.html", icon: "6" },
                { title: "Docker Networking", url: "/docker/networking.html", icon: "7" }
            ]
        },
        {
            group: "Bagian 3 — Orkestrasi",
            items: [
                { title: "Docker Compose", url: "/docker/compose.html", icon: "8" }
            ]
        }
    ]
};

function renderNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    navbar.innerHTML = `
        <div class="nav-container" style="max-width: 1300px; padding: 0 32px;">
            <a href="${courseConfig.profileUrl}" class="nav-logo">
                <div class="logo-icon">
                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                        <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
                        <circle cx="14" cy="14" r="3" fill="currentColor"/>
                    </svg>
                </div>
                <span class="logo-text" style="font-size: 1.1rem;">Arif<span class="logo-accent">Hidayah</span></span>
            </a>
            <div class="nav-links">
                <a href="${courseConfig.profileUrl}" class="nav-link">← Kembali ke Profil</a>
            </div>
            <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
                <span></span><span></span><span></span>
            </button>
        </div>`;
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.innerHTML = `<a href="${courseConfig.profileUrl}" class="mobile-link" onclick="closeMobileMenu()">← Kembali ke Profil</a>`;
    }
}

// Normalisasi path agar pencocokan tetap akurat baik saat URL berisi
// "index.html", diakhiri "/", maupun saat di-serve dengan clean URL (tanpa .html).
function normalizePath(p) {
    return p.replace(/\/index(\.html)?$/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
}

function renderSidebar() {
    const sidebar = document.getElementById('courseSidebar');
    if (!sidebar) return;
    const currentPath = normalizePath(window.location.pathname);
    let html = `<div class="sidebar-header"><div class="sidebar-icon">${courseConfig.courseIcon}</div><span class="sidebar-course-name">${courseConfig.courseName}</span></div>`;
    courseConfig.modules.forEach(module => {
        html += `<div class="module-group"><div class="module-group-title">${module.group}</div>`;
        module.items.forEach(item => {
            const isActive = currentPath === normalizePath(item.url) ? 'active' : '';
            const isDisabled = item.disabled ? 'disabled' : '';
            const href = item.disabled ? 'javascript:void(0)' : item.url;
            const title = item.disabled ? 'Materi belum tersedia' : item.title;
            html += `<a href="${href}" class="module-link ${isActive} ${isDisabled}" title="${title}"><div class="module-link-icon">${item.icon}</div><span>${item.title}</span></a>`;
        });
        html += `</div>`;
    });
    sidebar.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    renderSidebar();
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (navbar) { window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 20); }); }
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
});

function closeMobileMenu() {
    document.getElementById('navToggle')?.classList.remove('active');
    document.getElementById('mobileMenu')?.classList.remove('active');
    document.body.style.overflow = '';
}
