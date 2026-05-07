/**
 * Course Layout Component
 * Menangani pembuatan Sidebar, Navbar, dan Mobile Menu secara dinamis.
 */

const courseConfig = {
    courseName: "Data Mining",
    profileUrl: "../index.html",
    courseIcon: `<svg width="24" height="24" viewBox="0 0 40 40" fill="none">
        <circle cx="14" cy="14" r="4" stroke="currentColor" stroke-width="2"/>
        <circle cx="28" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        <circle cx="20" cy="28" r="4" stroke="currentColor" stroke-width="2"/>
        <path d="M17 16L18 24M18 14L25.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>
    </svg>`,
    modules: [
        {
            group: "Pengantar",
            items: [
                { title: "Konsep Data Mining", url: "/datamining/index.html", icon: "1" },
                { title: "Mengenal Data", url: "/datamining/mengenal-data.html", icon: "2" }
            ]
        },
        {
            group: "Data Preprocessing",
            items: [
                { title: "Cleaning", url: "/datamining/cleaning.html", icon: "3" },
                { title: "Transformation", url: "/datamining/transformasi.html", icon: "4" },
                { title: "Data Reduction (PCA)", url: "/datamining/pca.html", icon: "5" }
            ]
        },
        {
            group: "Classification",
            items: [
                { title: "K-Nearest Neighbors (KNN)", url: "/datamining/knn.html", icon: "6" },
                { title: "Naïve Bayes", url: "/datamining/naive-bayes.html", icon: "7" },
                { title: "Decision Tree (C4.5)", url: "/datamining/decision-tree.html", icon: "8" }
            ]
        },
        {
            group: "Clustering",
            items: [
                { title: "K-Means Clustering", url: "/datamining/kmeans.html", icon: "9" },
                { title: "Hierarchical Clustering", url: "/datamining/hierarchical.html", icon: "10" }
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
    const currentFile = currentPath.split('/').pop() || 'index.html';

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
            const isActive = currentFile === item.url ? 'active' : '';
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
    
    // Inisialisasi ulang event listener navbar setelah di-render
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
