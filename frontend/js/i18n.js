const dictionary = {
    es: {
        "nav.home": "Inicio",
        "nav.about": "Nosotros",
        "nav.donate": "Donar",
        "nav.profile": "Perfil",
        "profile.title": "Mi Perfil",
        "profile.edit": "Editar Perfil",
        "profile.history": "Ver Historial de Donaciones",
        "profile.darkmode": "Modo Oscuro",
        "profile.logout": "Cerrar Sesión",
        "profile.report": "Publicar Ayuda / Reporte"
    },
    en: {
        "nav.home": "Home",
        "nav.about": "About Us",
        "nav.donate": "Donate",
        "nav.profile": "Profile",
        "profile.title": "My Profile",
        "profile.edit": "Edit Profile",
        "profile.history": "Donation History",
        "profile.darkmode": "Dark Mode",
        "profile.logout": "Logout",
        "profile.report": "Publish Report / Help"
    },
    fr: {
        "nav.home": "Accueil",
        "nav.about": "À propos",
        "nav.donate": "Faire un don",
        "nav.profile": "Profil",
        "profile.title": "Mon Profil",
        "profile.edit": "Modifier le Profil",
        "profile.history": "Historique des Dons",
        "profile.darkmode": "Mode Sombre",
        "profile.logout": "Déconnexion",
        "profile.report": "Publier un Signalement"
    }
};

function setLanguage(lang) {
    localStorage.setItem('appLang', lang);
    const translations = dictionary[lang] || dictionary['es'];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.textContent = translations[key];
        }
    });

    // Disparar un evento por si algún componente necesita re-renderizarse (Opcional)
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

// Auto-inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem('appLang') || 'es';
    setLanguage(savedLang);
});
