/**
 * Laravel Course Layout Component
 */
const courseConfig = {
    courseName: "Laravel (Web)",
    profileUrl: "../index.html",
    courseIcon: `<svg width="24" height="24" viewBox="0 0 40 40" fill="none">
        <path d="M8 10L14 6L26 14L20 18L8 10Z" fill="currentColor"/>
        <path d="M26 14V26L20 30V18L26 14Z" fill="currentColor" opacity="0.8"/>
        <path d="M8 10V22L14 26V14L8 10Z" fill="currentColor" opacity="0.6"/>
        <path d="M14 26L20 30L26 26" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,
    modules: [
        {
            group: "Pengantar",
            items: [
                { title: "Pengenalan Laravel & MVC", url: "/laravel/index.html", icon: "1" },
                { title: "Instalasi & Konfigurasi", url: "/laravel/instalasi.html", icon: "2" }
            ]
        },
        {
            group: "Routing & Controller",
            items: [
                { title: "Routing Dasar", url: "/laravel/routing.html", icon: "3" },
                { title: "Controller & Request", url: "/laravel/controller.html", icon: "4" },
                { title: "Middleware", url: "/laravel/middleware.html", icon: "5" }
            ]
        },
        {
            group: "View & Blade",
            items: [
                { title: "Blade Templating", url: "/laravel/blade.html", icon: "6" },
                { title: "Layout & Component", url: "/laravel/layout-component.html", icon: "7" }
            ]
        },
        {
            group: "Database & Eloquent",
            items: [
                { title: "Migration & Seeder", url: "/laravel/migration.html", icon: "8" },
                { title: "Eloquent ORM", url: "/laravel/eloquent.html", icon: "9" },
                { title: "Relationship", url: "/laravel/relationship.html", icon: "10" }
            ]
        },
        {
            group: "Fitur Lanjutan",
            items: [
                { title: "Form & Validasi", url: "/laravel/form-validasi.html", icon: "11" },
                { title: "Authentication", url: "/laravel/authentication.html", icon: "12" },
                { title: "REST API", url: "/laravel/rest-api.html", icon: "13" }
            ]
        },
        {
            group: "Proyek",
            items: [
                { title: "Final Project", url: "/laravel/final-project.html", icon: "14" }
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

function renderSidebar() {
    const sidebar = document.getElementById('courseSidebar');
    if (!sidebar) return;
    const currentPath = window.location.pathname;
    let html = `<div class="sidebar-header"><div class="sidebar-icon">${courseConfig.courseIcon}</div><span class="sidebar-course-name">${courseConfig.courseName}</span></div>`;
    courseConfig.modules.forEach(module => {
        html += `<div class="module-group"><div class="module-group-title">${module.group}</div>`;
        module.items.forEach(item => {
            const isActive = currentPath === item.url ? 'active' : '';
            html += `<a href="${item.url}" class="module-link ${isActive}"><div class="module-link-icon">${item.icon}</div><span>${item.title}</span></a>`;
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
