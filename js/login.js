const { createApp } = Vue;
if (document.getElementById('appLogin')) {
    createApp({
        data() { return { email: '', password: '' } },
        methods: {
            iniciarSesion() {
                if (!this.email.includes('@morelia.tecnm.mx')) {
                    Swal.fire('Error', 'Usa tu correo institucional @morelia.tecnm.mx', 'error'); return;
                }
                if (this.password.length < 6) {
                    Swal.fire('Error', 'Contraseña mínima de 6 caracteres', 'warning'); return;
                }
                let rol = this.email.startsWith('admin') ? 'admin' : 'usuario';
                const { getDB, saveDB } = useStore();
                let db = getDB();
                db.sesionActiva = { email: this.email, rol: rol, nombre: this.email.split('@')[0] };
                saveDB(db);
                Swal.fire('¡Bienvenido!', 'Acceso concedido', 'success').then(() => { window.location.href = 'feed.html'; });
            }
        }
    }).mount('#appLogin');
}