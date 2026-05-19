// Script para aplicar el tema oscuro de inmediato y evitar FOUC
(function() {
    try {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.documentElement.classList.add('dark-theme');
            // Agregamos a body cuando esté disponible o usando MutationObserver si es en el head
            document.addEventListener('DOMContentLoaded', () => {
                document.body.classList.add('dark-theme');
            });
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
    } catch (e) {
        console.error('Error aplicando dark mode:', e);
    }
})();
