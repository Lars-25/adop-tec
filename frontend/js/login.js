const { createApp } = Vue;

if (document.getElementById('appLogin')) {
    createApp({
        data() {
            return {
                email: '',
                password: ''
            }
        },
        mounted() {
            document.getElementById("loginForm").addEventListener("submit", (e) => {
                e.preventDefault();
                this.email = document.getElementById("email").value;
                this.password = document.getElementById("password").value;
                this.iniciarSesion();
            });
        },
        methods: {
            async iniciarSesion() {
                if (!this.email.includes('@morelia.tecnm.mx')) {
                    Swal.fire('Error', 'Usa tu correo institucional @morelia.tecnm.mx', 'error');
                    return;
                }
                if (this.password.length < 6) {
                    Swal.fire('Error', 'Contraseña mínima de 6 caracteres', 'warning');
                    return;
                }

                try {
                    const response = await fetch('http://localhost:3000/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: this.email,
                            password: this.password
                        })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        Swal.fire('Error', data.error || 'Credenciales inválidas', 'error');
                        return;
                    }

                    // Guardar token y datos del usuario en localStorage
                    localStorage.setItem('adoptec_token', data.token);
                    localStorage.setItem('adoptec_user', JSON.stringify(data.user));

                    Swal.fire('¡Bienvenido!', 'Acceso concedido', 'success')
                        .then(() => {
                            window.location.href = 'feed.html';
                        });

                } catch (error) {
                    console.error('Error de red al iniciar sesión:', error);
                    Swal.fire('Error de red', 'No se pudo conectar con el servidor', 'error');
                }
            }
        }
    }).mount('#appLogin');
}