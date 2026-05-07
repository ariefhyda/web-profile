/**
 * Flutter Fundamentals Layout Component
 */

const courseConfig = {
    courseName: "Flutter Fundamentals",
    profileUrl: "../index.html",
    courseIcon: `<svg width="24" height="24" viewBox="0 0 40 40" fill="none">
        <path d="M22 6L8 20L13 25L32 6H22Z" fill="currentColor"/>
        <path d="M22 18L13 27L18 32L32 18H22Z" fill="currentColor" opacity="0.7"/>
    </svg>`,
    modules: [
        {
            group: "Pengantar",
            items: [
                { title: "Pengenalan Flutter & Dart", url: "/flutter/index.html", icon: "1" },
                { title: "Instalasi & Konfigurasi", url: "/flutter/instalasi.html", icon: "2" }
            ]
        },
        {
            group: "Dart Fundamental",
            items: [
                { title: "Variabel & Tipe Data", url: "/flutter/variabel.html", icon: "3" },
                { title: "Function & OOP", url: "#", icon: "4" },
                { title: "Collection & Async", url: "/flutter/collection-async.html", icon: "5" }
            ]
        },
        {
            group: "Flutter UI",
            items: [
                { title: "Widget Dasar", url: "#", icon: "6" },
                { title: "Layout & Responsive", url: "#", icon: "7" },
                { title: "Navigation & Routing", url: "#", icon: "8" }
            ]
        },
        {
            group: "State & Data",
            items: [
                { title: "State Management", url: "#", icon: "9" },
                { title: "REST API & HTTP", url: "#", icon: "10" },
                { title: "Local Storage (SQLite)", url: "#", icon: "11" }
            ]
        },
        {
            group: "Proyek Akhir",
            items: [
                { title: "Final Project", url: "#", icon: "12" }
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
        </div>
    `;

    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.innerHTML = `
            <a href="${courseConfig.profileUrl}" class="mobile-link" onclick="closeMobileMenu()">← Kembali ke Profil</a>
        `;
    }
}

function renderSidebar() {
    const sidebar = document.getElementById('courseSidebar');
    if (!sidebar) return;

    const currentPath = window.location.pathname;
    
    let html = `
        <div class="sidebar-header">
            <div class="sidebar-icon">
                ${courseConfig.courseIcon}
            </div>
            <span class="sidebar-course-name">${courseConfig.courseName}</span>
        </div>
    `;

    courseConfig.modules.forEach(module => {
        html += `
            <div class="module-group">
                <div class="module-group-title">${module.group}</div>
        `;

        module.items.forEach(item => {
            const isActive = currentPath === item.url ? 'active' : '';
            html += `
                <a href="${item.url}" class="module-link ${isActive}">
                    <div class="module-link-icon">${item.icon}</div>
                    <span>${item.title}</span>
                </a>
            `;
        });

        html += `</div>`;
    });

    sidebar.innerHTML = html;
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    renderSidebar();
    
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        });
    }

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
});

function closeMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    navToggle?.classList.remove('active');
    mobileMenu?.classList.remove('active');
    document.body.style.overflow = '';
}
