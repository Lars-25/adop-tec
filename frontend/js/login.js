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

            // VALIDACIÓN AJAX EN VIVO
            const emailInput = document.getElementById("email");
            const submitBtn = document.querySelector("#loginForm button[type='submit']");
            
            if (emailInput) {
                emailInput.addEventListener("blur", async (e) => {
                    const emailVal = e.target.value.trim();
                    if (!emailVal) return;

                    try {
                        const response = await fetch(`https://localhost:3000/api/auth/check-email/${encodeURIComponent(emailVal)}`);
                        const data = await response.json();

                        // Flujo de Login
                        if (!data.exists) {
                            Swal.fire({
                                icon: 'info',
                                title: 'Aviso',
                                text: 'Este correo no parece estar registrado.',
                                toast: true,
                                position: 'bottom-end',
                                showConfirmButton: false,
                                timer: 3000
                            });
                        }
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = "1";
                    } catch (error) {
                        console.error('Error AJAX check-email:', error);
                    }
                });

                emailInput.addEventListener("input", () => {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = "1";
                });
            }
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
                    const response = await fetch('https://localhost:3000/api/auth/login', {
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