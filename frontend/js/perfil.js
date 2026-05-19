const { createApp } = Vue;

if (document.getElementById('appPerfil')) {
    createApp({
        data() {
            return {
                usuario: { nombre: '', email: '', rol: '' },
                misDonaciones: [], // Se conectará al backend en la fase MercadoPago
                allUsers: [],
                allPets: [],
                allDonaciones: [],
                allGastos: []
            }
        },
        mounted() {
            // Leer desde localStorage
            const token = localStorage.getItem('adoptec_token');
            const userStr = localStorage.getItem('adoptec_user');

            if (!token || !userStr) {
                window.location.href = 'login.html';
                return;
            }

            this.usuario = JSON.parse(userStr);

            // Cargar donaciones propias desde el backend
            this.cargarMisDonaciones();

            this.renderUI();

            if (this.usuario.rol === 'admin') {
                this.cargarUsuarios();
                this.cargarMascotasAdmin();
                this.cargarFinanzas();
            }

            document.getElementById("btnHistorial").addEventListener("click", (e) => {
                e.preventDefault();
                this.verHistorial();
            });

            document.getElementById("btnLogout").addEventListener("click", (e) => {
                e.preventDefault();
                this.cerrarSesion();
            });

            // MODO OSCURO FUNCIONAL
            const darkModeToggle = document.getElementById('darkModeToggle');
            if(darkModeToggle) {
                // Sincronizar estado inicial
                darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
                
                darkModeToggle.addEventListener('change', (e) => {
                    if(e.target.checked) {
                        document.body.classList.add('dark-theme');
                        localStorage.setItem('darkMode', 'true');
                    } else {
                        document.body.classList.remove('dark-theme');
                        localStorage.setItem('darkMode', 'false');
                    }
                });
            }

            const langToggle = document.getElementById("langToggle");
            if (langToggle) {
                langToggle.value = localStorage.getItem('appLang') || 'es';
                langToggle.addEventListener('change', (e) => {
                    if(typeof setLanguage === 'function') {
                        setLanguage(e.target.value);
                    }
                });
            }

            // EDICIÓN DE PERFIL EN VIVO
            let editando = false;
            let avatarBase64 = null;
            const btnEditar = document.getElementById("btnEditarPerfil");
            const nombreEl = document.getElementById("nombreUsuario");
            const avatarInput = document.getElementById("avatarInput");
            const avatarPreviewLabel = document.getElementById("avatarPreviewLabel");
            const avatarIcon = document.getElementById("avatarIcon");

            // Inicializar avatar si el usuario ya tiene uno
            if (this.usuario.avatar_url) {
                avatarPreviewLabel.style.backgroundImage = `url('${this.usuario.avatar_url}')`;
                if(avatarIcon) avatarIcon.style.display = 'none';
            }

            if (avatarInput) {
                avatarInput.addEventListener("change", (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                            avatarBase64 = evt.target.result;
                            avatarPreviewLabel.style.backgroundImage = `url('${avatarBase64}')`;
                            if(avatarIcon) avatarIcon.style.display = 'none';
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            if (btnEditar) {
                btnEditar.addEventListener("click", async () => {
                    if (!editando) {
                        // Modo Edición
                        editando = true;
                        if(avatarInput) avatarInput.disabled = false;
                        avatarPreviewLabel.style.cursor = 'pointer';
                        avatarPreviewLabel.style.border = '2px dashed #3b82f6';
                        btnEditar.innerHTML = "<i class='bx bx-save'></i> Guardar";
                        btnEditar.classList.replace("btn--outline", "btn--primary");
                        
                        const nombreActual = nombreEl.textContent;
                        nombreEl.innerHTML = `<input type="text" id="inputNombre" class="form-input" value="${nombreActual}" style="text-align:center; margin-top:5px; max-width: 200px;">`;
                    } else {
                        // Modo Guardar (PUT)
                        const nuevoNombre = document.getElementById("inputNombre").value.trim();
                        if (!nuevoNombre) {
                            Swal.fire('Atención', 'El nombre no puede estar vacío', 'warning');
                            return;
                        }

                        if (!token) {
                            Swal.fire('Error', 'No hay sesión activa', 'error');
                            return;
                        }

                        try {
                            const payload = { 
                                nombre: nuevoNombre,
                                email: this.usuario.email 
                            };
                            if (avatarBase64) {
                                payload.avatar_url = avatarBase64;
                            }

                            const response = await fetch(`https://localhost:3000/api/users/${this.usuario.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(payload)
                            });

                            if(response.ok) {
                                // Actualizar RAM y Pantalla
                                this.usuario.nombre = nuevoNombre;
                                if (avatarBase64) this.usuario.avatar_url = avatarBase64;
                                localStorage.setItem('adoptec_user', JSON.stringify(this.usuario));
                                
                                nombreEl.innerHTML = nuevoNombre;
                                editando = false;
                                if(avatarInput) avatarInput.disabled = true;
                                avatarPreviewLabel.style.cursor = 'default';
                                avatarPreviewLabel.style.border = 'none';
                                btnEditar.innerHTML = "<i class='bx bx-pencil'></i> Editar Perfil";
                                btnEditar.classList.replace("btn--primary", "btn--outline");
                                
                                Swal.fire({ icon: 'success', title: 'Perfil actualizado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000});
                            } else {
                                const errData = await response.json().catch(() => ({}));
                                Swal.fire('Error', errData.msg || 'No se pudo actualizar el perfil', 'error');
                            }
                        } catch (err) {
                            console.error(err);
                            Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
                        }
                    }
                });
            }
        },
        computed: {
            totalDonado() {
                return this.misDonaciones.reduce((suma, d) => suma + Number(d.monto), 0);
            },
            cantidadDonaciones() {
                return this.misDonaciones.length;
            },
            totalRecaudadoAdmin() {
                return this.allDonaciones.reduce((suma, d) => suma + Number(d.monto), 0).toFixed(2);
            },
            totalGastadoAdmin() {
                return this.allGastos.reduce((suma, g) => suma + Number(g.monto), 0).toFixed(2);
            }
        },
        methods: {
            async cargarUsuarios() {
                try {
                    const token = localStorage.getItem('adoptec_token');
                    const res = await fetch('https://localhost:3000/api/users', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        this.allUsers = await res.json();
                    }
                } catch (err) {
                    console.error("Error cargando usuarios:", err);
                }
            },
            async eliminarUsuario(id) {
                if (id === this.usuario.id) {
                    Swal.fire('Error', 'No puedes eliminarte a ti mismo desde aquí.', 'error');
                    return;
                }
                const confirm = await Swal.fire({
                    title: '¿Estás seguro de eliminar a este usuario?',
                    text: 'Esta acción no se puede deshacer.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#94a3b8',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                });

                if (confirm.isConfirmed) {
                    try {
                        const token = localStorage.getItem('adoptec_token');
                        const res = await fetch(`https://localhost:3000/api/users/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                            Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
                            this.cargarUsuarios();
                        } else {
                            const err = await res.json();
                            Swal.fire('Error', err.msg || 'No se pudo eliminar.', 'error');
                        }
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Error', 'Problema de conexión.', 'error');
                    }
                }
            },
            async cambiarRol(user) {
                try {
                    const token = localStorage.getItem('adoptec_token');
                    const res = await fetch(`https://localhost:3000/api/users/admin/${user.id}`, {
                        method: 'PUT',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({ rol: user.rol })
                    });
                    if (res.ok) {
                        Swal.fire({ icon: 'success', title: 'Rol actualizado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000});
                    } else {
                        const err = await res.json();
                        Swal.fire('Error', err.msg || 'No se pudo cambiar el rol.', 'error');
                        this.cargarUsuarios(); // Revertir visualmente
                    }
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', 'Problema de conexión.', 'error');
                    this.cargarUsuarios();
                }
            },
            async crearUsuario() {
                const { value: formValues } = await Swal.fire({
                    title: 'Crear Nuevo Usuario',
                    html:
                        '<input id="swal-nombre" class="swal2-input" placeholder="Nombre completo">' +
                        '<input id="swal-email" type="email" class="swal2-input" placeholder="Correo electrónico">' +
                        '<input id="swal-password" type="password" class="swal2-input" placeholder="Contraseña">' +
                        '<select id="swal-rol" class="swal2-input" style="display: flex; margin: 1em auto; max-width: 100%;">' +
                        '<option value="user">Usuario</option>' +
                        '<option value="admin">Administrador</option>' +
                        '</select>',
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: 'Crear',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                        const nombre = document.getElementById('swal-nombre').value;
                        const email = document.getElementById('swal-email').value;
                        const password = document.getElementById('swal-password').value;
                        const rol = document.getElementById('swal-rol').value;

                        if (!nombre || !email || !password) {
                            Swal.showValidationMessage('Todos los campos son obligatorios');
                            return false;
                        }
                        return { nombre, email, password, rol };
                    }
                });

                if (formValues) {
                    try {
                        const token = localStorage.getItem('adoptec_token');
                        const res = await fetch('https://localhost:3000/api/auth/register', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(formValues)
                        });

                        if (res.ok) {
                            Swal.fire('¡Éxito!', 'Usuario creado correctamente.', 'success');
                            this.cargarUsuarios();
                        } else {
                            const err = await res.json();
                            Swal.fire('Error', err.msg || 'No se pudo crear el usuario.', 'error');
                        }
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Error', 'Problema de conexión.', 'error');
                    }
                }
            },
            async editarUsuario(user) {
                const { value: formValues } = await Swal.fire({
                    title: 'Editar Usuario',
                    html:
                        `<input id="swal-edit-nombre" class="swal2-input" placeholder="Nombre" value="${user.nombre}">` +
                        `<input id="swal-edit-email" type="email" class="swal2-input" placeholder="Correo" value="${user.email}">`,
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: 'Guardar',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                        const nombre = document.getElementById('swal-edit-nombre').value;
                        const email = document.getElementById('swal-edit-email').value;

                        if (!nombre || !email) {
                            Swal.showValidationMessage('Los campos no pueden estar vacíos');
                            return false;
                        }
                        return { nombre, email };
                    }
                });

                if (formValues) {
                    try {
                        const token = localStorage.getItem('adoptec_token');
                        const res = await fetch(`https://localhost:3000/api/users/admin/${user.id}`, {
                            method: 'PUT',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` 
                            },
                            body: JSON.stringify({ nombre: formValues.nombre, email: formValues.email })
                        });

                        if (res.ok) {
                            Swal.fire('¡Éxito!', 'Usuario actualizado correctamente.', 'success');
                            this.cargarUsuarios();
                        } else {
                            const err = await res.json();
                            Swal.fire('Error', err.msg || 'No se pudo actualizar.', 'error');
                        }
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Error', 'Problema de conexión.', 'error');
                    }
                }
            },
            async cargarMascotasAdmin() {
                try {
                    const res = await fetch('https://localhost:3000/api/pets');
                    const data = await res.json();
                    if (data.status === 'success') {
                        this.allPets = data.data;
                    }
                } catch (err) {
                    console.error("Error cargando mascotas:", err);
                }
            },
            async eliminarMascota(id) {
                const confirm = await Swal.fire({
                    title: '¿Estás seguro de eliminar este reporte?',
                    text: 'Esta acción no se puede deshacer.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#94a3b8',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                });

                if (confirm.isConfirmed) {
                    try {
                        const token = localStorage.getItem('adoptec_token');
                        const res = await fetch(`https://localhost:3000/api/pets/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                            Swal.fire('¡Eliminado!', 'El reporte de la mascota ha sido eliminado.', 'success');
                            this.cargarMascotasAdmin();
                        } else {
                            const err = await res.json();
                            Swal.fire('Error', err.error || 'No se pudo eliminar.', 'error');
                        }
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Error', 'Problema de conexión.', 'error');
                    }
                }
            },
            async editarMascota(pet) {
                const { value: formValues } = await Swal.fire({
                    title: 'Editar Mascota',
                    html:
                        `<input id="swal-pet-nombre" class="swal2-input" placeholder="Nombre" value="${pet.nombre}">` +
                        `<input id="swal-pet-especie" class="swal2-input" placeholder="Especie" value="${pet.especie}">` +
                        `<input id="swal-pet-ubicacion" class="swal2-input" placeholder="Ubicación" value="${pet.ubicacion || ''}">` +
                        `<textarea id="swal-pet-descripcion" class="swal2-textarea" placeholder="Descripción" style="width: 80%;">${pet.descripcion || ''}</textarea>`,
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: 'Guardar',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                        const nombre = document.getElementById('swal-pet-nombre').value;
                        const especie = document.getElementById('swal-pet-especie').value;
                        const ubicacion = document.getElementById('swal-pet-ubicacion').value;
                        const descripcion = document.getElementById('swal-pet-descripcion').value;

                        if (!nombre || !especie) {
                            Swal.showValidationMessage('Nombre y Especie son obligatorios');
                            return false;
                        }
                        return { nombre, especie, ubicacion, descripcion, raza: pet.raza, edad: pet.edad, urgente: pet.urgente, estado: pet.estado };
                    }
                });

                if (formValues) {
                    try {
                        const token = localStorage.getItem('adoptec_token');
                        const res = await fetch(`https://localhost:3000/api/pets/${pet.id}`, {
                            method: 'PUT',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` 
                            },
                            body: JSON.stringify(formValues)
                        });

                        if (res.ok) {
                            Swal.fire('¡Éxito!', 'Mascota actualizada correctamente.', 'success');
                            this.cargarMascotasAdmin();
                        } else {
                            const err = await res.json();
                            Swal.fire('Error', err.error || 'No se pudo actualizar.', 'error');
                        }
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Error', 'Problema de conexión.', 'error');
                    }
                }
            },
            async cargarFinanzas() {
                try {
                    const token = localStorage.getItem('adoptec_token');
                    
                    const resDonaciones = await fetch('https://localhost:3000/api/finanzas/donaciones', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (resDonaciones.ok) {
                        const data = await resDonaciones.json();
                        if (data.status === 'success') this.allDonaciones = data.data;
                    }

                    const resGastos = await fetch('https://localhost:3000/api/finanzas/gastos', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (resGastos.ok) {
                        const data = await resGastos.json();
                        if (data.status === 'success') this.allGastos = data.data;
                    }
                } catch (err) {
                    console.error("Error cargando finanzas:", err);
                }
            },
            async cargarMisDonaciones() {
                try {
                    const token = localStorage.getItem('adoptec_token');
                    const res = await fetch('https://localhost:3000/api/finanzas/donaciones/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status === 'success') {
                            this.misDonaciones = data.data;
                            this.renderUI(); // Forzar actualización del widget
                        }
                    }
                } catch (err) {
                    console.error("Error cargando mis donaciones:", err);
                }
            },
            async registrarGasto() {
                const { value: formValues } = await Swal.fire({
                    title: 'Registrar Gasto',
                    html:
                        '<input id="swal-gasto-concepto" class="swal2-input" placeholder="Concepto (ej. Veterinaria)">' +
                        '<input id="swal-gasto-monto" type="number" step="0.01" class="swal2-input" placeholder="Monto ($)">',
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: 'Registrar',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                        const concepto = document.getElementById('swal-gasto-concepto').value;
                        const monto = document.getElementById('swal-gasto-monto').value;
                        if (!concepto || !monto || isNaN(monto) || Number(monto) <= 0) {
                            Swal.showValidationMessage('Ingresa un concepto válido y un monto mayor a 0');
                            return false;
                        }
                        return { concepto, monto: Number(monto) };
                    }
                });

                if (formValues) {
                    try {
                        const token = localStorage.getItem('adoptec_token');
                        const res = await fetch('https://localhost:3000/api/finanzas/gastos', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` 
                            },
                            body: JSON.stringify(formValues)
                        });

                        if (res.ok) {
                            Swal.fire({ icon: 'success', title: 'Gasto registrado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000});
                            this.cargarFinanzas();
                        } else {
                            const err = await res.json();
                            Swal.fire('Error', err.error || 'No se pudo registrar el gasto.', 'error');
                        }
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Error', 'Problema de conexión.', 'error');
                    }
                }
            },
            renderUI() {
                document.getElementById("nombreUsuario").textContent = this.usuario.nombre;
                document.getElementById("rolUsuario").textContent = this.usuario.rol === 'admin' ? 'Administrador' : 'Estudiante ITM';
                document.getElementById("cantidadDonaciones").textContent = this.cantidadDonaciones;
                document.getElementById("totalDonado").textContent = `$${this.totalDonado}`;
            },
            verHistorial() {
                if (this.cantidadDonaciones === 0) {
                    Swal.fire('Sin donaciones', 'Aún no tienes donaciones registradas.', 'info');
                    return;
                }

                let htmlLista = '<ul style="text-align:left;">';
                this.misDonaciones.forEach(d => {
                    htmlLista += `<li><b>$${d.monto}</b> - <small>${new Date(d.fecha).toLocaleDateString()}</small></li>`;
                });
                htmlLista += '</ul>';

                Swal.fire({
                    title: 'Mis Aportaciones',
                    html: htmlLista,
                    icon: 'success'
                });
            },
            cerrarSesion() {
                // Eliminar token y datos de localStorage
                localStorage.removeItem('adoptec_token');
                localStorage.removeItem('adoptec_user');
                window.location.href = '../index.html'; // Redirige a la portada
            }
        }
    }).mount('#appPerfil');
}