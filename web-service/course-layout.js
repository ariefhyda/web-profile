/**
 * Web Service Course Layout Component
 *
 * Catatan: Saat ini baru Pertemuan 1 (index.html) yang tersedia.
 * Pertemuan 2-16 akan ditambahkan bertahap. Item bertanda `disabled: true`
 * akan tampil di sidebar tetapi tidak bisa diklik (placeholder kurikulum).
 */
const courseConfig = {
    courseName: "Web Service",
    profileUrl: "../index.html",
    courseIcon: `<svg width="24" height="24" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="2"/>
        <path d="M6 20H34M20 6V34" stroke="currentColor" stroke-width="1.5"/>
        <path d="M9 11C13 14 27 14 31 11M9 29C13 26 27 26 31 29" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,
    modules: [
        {
            group: "Bagian 1 — Fondasi & RESTful API",
            items: [
                { title: "Pengenalan Web Service & SOA", url: "/web-service/index.html", icon: "1" },
                { title: "Protokol HTTP & Format Data", url: "/web-service/http-format-data.html", icon: "2" },
                { title: "Legacy Service: SOAP & WSDL", url: "/web-service/soap-wsdl.html", icon: "3" },
                { title: "Prinsip Desain RESTful API", url: "/web-service/restful-design.html", icon: "4" },
                { title: "Hands-on: REST API (CRUD)", url: "/web-service/rest-crud.html", icon: "5" },
                { title: "API Documentation & Testing", url: "/web-service/api-docs-testing.html", icon: "6" },
                { title: "Keamanan API (JWT & RBAC)", url: "/web-service/api-security.html", icon: "7" },
                { title: "Evaluasi Tengah Semester (UTS)", url: "/web-service/uts.html", icon: "8", disabled: true }
            ]
        },
        {
            group: "Bagian 2 — GraphQL & Microservices",
            items: [
                { title: "Pengenalan GraphQL", url: "/web-service/graphql-intro.html", icon: "9" },
                { title: "Hands-on: GraphQL Server", url: "/web-service/graphql-server.html", icon: "10" },
                { title: "Arsitektur Microservices", url: "/web-service/microservices.html", icon: "11" },
                { title: "Komunikasi Antar Service", url: "/web-service/inter-service-comm.html", icon: "12" },
                { title: "API Gateway & Discovery", url: "/web-service/api-gateway.html", icon: "13" },
                { title: "Containerization (Docker)", url: "/web-service/docker.html", icon: "14" },
                { title: "Monitoring & Final Review", url: "/web-service/monitoring.html", icon: "15" },
                { title: "Evaluasi Akhir Semester (UAS)", url: "/web-service/uas.html", icon: "16", disabled: true }
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
