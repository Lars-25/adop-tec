const { createApp } = Vue;

if (document.getElementById('appSignup')) {
    createApp({
        data() {
            return {
                nombre: '',
                email: '',
                password: ''
            }
        },
        mounted() {
            document.getElementById("signupForm").addEventListener("submit", (e) => {
                e.preventDefault();
                this.nombre = document.getElementById("nombre").value;
                this.email = document.getElementById("email").value;
                this.password = document.getElementById("password").value;
                this.registrarUsuario();
            });

            // ESTADO DE VALIDACIÓN GLOBAL
            let emailExists = false;
            let usernameExists = false;

            const submitBtn = document.getElementById("btnSignup");
            const emailInput = document.getElementById("email");
            const nombreInput = document.getElementById("nombre");
            const emailError = document.getElementById("emailError");
            const nombreError = document.getElementById("nombreError");

            const checkSubmitBtn = () => {
                if (emailExists || usernameExists) {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = "0.5";
                } else {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = "1";
                }
            };

            // VALIDACIÓN AJAX EN VIVO DEL NOMBRE DE USUARIO
            if (nombreInput) {
                nombreInput.addEventListener("blur", async (e) => {
                    const nombreVal = e.target.value.trim();
                    if (!nombreVal) {
                        nombreError.style.display = "none";
                        usernameExists = false;
                        checkSubmitBtn();
                        return;
                    }

                    try {
                        const response = await fetch(`https://localhost:3000/api/auth/check-username/${encodeURIComponent(nombreVal)}`);
                        const data = await response.json();

                        if (data.exists) {
                            nombreError.style.display = "block";
                            usernameExists = true;
                        } else {
                            nombreError.style.display = "none";
                            usernameExists = false;
                        }
                        checkSubmitBtn();
                    } catch (error) {
                        console.error('Error AJAX check-username:', error);
                    }
                });

                nombreInput.addEventListener("input", () => {
                    nombreError.style.display = "none";
                    usernameExists = false;
                    checkSubmitBtn();
                });
            }

            // VALIDACIÓN AJAX EN VIVO DEL CORREO
            if (emailInput) {
                emailInput.addEventListener("blur", async (e) => {
                    const emailVal = e.target.value.trim();
                    if (!emailVal) {
                        emailError.style.display = "none";
                        emailExists = false;
                        checkSubmitBtn();
                        return;
                    }

                    try {
                        const response = await fetch(`https://localhost:3000/api/auth/check-email/${encodeURIComponent(emailVal)}`);
                        const data = await response.json();

                        if (data.exists) {
                            emailError.style.display = "block";
                            emailExists = true;
                        } else {
                            emailError.style.display = "none";
                            emailExists = false;
                        }
                        checkSubmitBtn();
                    } catch (error) {
                        console.error('Error AJAX check-email:', error);
                    }
                });

                emailInput.addEventListener("input", () => {
                    emailError.style.display = "none";
                    emailExists = false;
                    checkSubmitBtn();
                });
            }
        },
        methods: {
            async registrarUsuario() {
                if (!this.email.includes('@morelia.tecnm.mx')) {
                    Swal.fire('Error', 'Usa tu correo institucional @morelia.tecnm.mx', 'error');
                    return;
                }
                if (this.password.length < 6) {
                    Swal.fire('Error', 'Contraseña mínima de 6 caracteres', 'warning');
                    return;
                }

                try {
                    const response = await fetch('https://localhost:3000/api/auth/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            nombre: this.nombre,
                            email: this.email,
                            password: this.password
                        })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        Swal.fire('Error', data.error || 'No se pudo registrar', 'error');
                        return;
                    }

                    Swal.fire('¡Registro exitoso!', 'Ahora puedes iniciar sesión', 'success')
                        .then(() => {
                            window.location.href = 'login.html';
                        });

                } catch (error) {
                    console.error('Error al registrar:', error);
                    Swal.fire('Error de red', 'No se pudo conectar con el servidor', 'error');
                }
            }
        }
    }).mount('#appSignup');
}
