const { createApp } = Vue;

if (document.getElementById('appDonaciones')) {
    createApp({
        data() { 
            return { 
                datos: {}, 
                rol: 'usuario', 
                montoDonacion: null, 
                conceptoGasto: 'Medicamentos',
                mesActual: new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
                historial: []
            } 
        },
        async mounted() {
            // Verificar si hay sesión activa por localStorage de forma segura
            const userStr = localStorage.getItem('adoptec_user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    this.rol = user.rol;
                } catch (e) {
                    console.error("Error parseando usuario", e);
                }
            }

            // Inicializar con valores por defecto
            this.datos = { recaudado: 0, meta: 10000 };
            
            // Cargar meta desde el backend
            await this.cargarMeta();

            document.getElementById("mesActual").textContent = this.mesActual;

            document.getElementById("formDonacion").addEventListener("submit", (e) => {
                e.preventDefault();
                this.montoDonacion = Number(document.getElementById("montoDonacion").value);
                if (this.montoDonacion >= 10) {
                    this.donar();
                } else {
                    Swal.fire('Atención', 'Ingresa un monto válido (mínimo $10)', 'warning');
                }
            });

            // PREVISUALIZACIÓN DE COMPROBANTE (ADMIN)
            const inputComprobante = document.getElementById("comprobanteGasto");
            const labelPreview = document.getElementById("comprobantePreviewLabel");
            const textoPreview = document.getElementById("comprobanteTexto");

            if (inputComprobante) {
                inputComprobante.addEventListener("change", (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        textoPreview.textContent = file.name;
                        if (file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                                labelPreview.style.backgroundImage = `url('${evt.target.result}')`;
                                labelPreview.style.backgroundColor = 'rgba(0,0,0,0.6)';
                                labelPreview.style.backgroundBlendMode = 'overlay';
                                textoPreview.style.color = '#fff';
                            }
                            reader.readAsDataURL(file);
                        } else {
                            labelPreview.style.backgroundImage = 'none';
                            labelPreview.style.backgroundColor = '#f8fafc';
                            textoPreview.style.color = '#475569';
                        }
                    } else {
                        textoPreview.textContent = "Haz clic para subir comprobante";
                        labelPreview.style.backgroundImage = 'none';
                        labelPreview.style.backgroundColor = '#f8fafc';
                        textoPreview.style.color = '#475569';
                    }
                });
            }

            const formGasto = document.getElementById("formGasto");
            if (formGasto) {
                formGasto.addEventListener("submit", (e) => {
                    e.preventDefault();
                    Swal.fire('Registrado', 'Se registró el gasto correctamente', 'success');
                    formGasto.reset();
                    if (labelPreview && textoPreview) {
                        labelPreview.style.backgroundImage = 'none';
                        labelPreview.style.backgroundColor = '#f8fafc';
                        textoPreview.style.color = '#475569';
                        textoPreview.textContent = "Haz clic para subir comprobante";
                    }
                });
            }

            // BOTÓN MERCADO PAGO
            const btnMercadoPago = document.getElementById("btnMercadoPago");
            if (btnMercadoPago) {
                btnMercadoPago.addEventListener("click", () => {
                    Swal.fire({
                        title: 'Integración en proceso',
                        text: 'La pasarela de Mercado Pago estará disponible pronto.',
                        icon: 'info',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#009EE3'
                    });
                });
            }

            // MODAL TRANSFERENCIA / EFECTIVO
            const btnTransferencia = document.getElementById("btnTransferencia");
            if (btnTransferencia) {
                btnTransferencia.addEventListener("click", () => {
                    Swal.fire({
                        title: 'Transferencia o Efectivo',
                        html: `
                            <div style="text-align: left;">
                                <p><strong>Banco:</strong> ITM Bank</p>
                                <p><strong>CLABE:</strong> 123456789012345678</p>
                                <p><strong>Cuenta:</strong> 987654321</p>
                                <p><strong>Titular:</strong> Clínica Veterinaria ITM</p>
                                <hr style="margin: 1rem 0; border: 0; border-top: 1px solid #e2e8f0;">
                                <p><strong>Efectivo:</strong><br>
                                Entrega tu donativo en el edificio de la Clínica (Campus Principal), de Lunes a Viernes de 9:00 a 14:00 hrs.</p>
                            </div>
                        `,
                        icon: 'info',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#3b82f6'
                    });
                });
            }

            this.renderUI();
        },
        methods: {
            async cargarMeta() {
                try {
                    const res = await fetch('https://localhost:3000/api/finanzas/meta');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status === 'success') {
                            this.datos.recaudado = data.data.recaudado;
                            this.datos.meta = data.data.meta;
                            this.historial = data.data.topDonadores;
                            this.renderUI();
                        }
                    }
                } catch (err) {
                    console.error("Error obteniendo meta de donaciones:", err);
                }
            },
            getTopDonadores() {
                // El backend ya devuelve el array agrupado y ordenado
                return this.historial.map(d => ({
                    nombre: d.usuario_nombre || (d.usuario_email ? d.usuario_email.split('@')[0] : 'Anónimo'),
                    monto: Number(d.monto)
                }));
            },
            async donar() {
                if (this.montoDonacion > 0) {
                    const token = localStorage.getItem('adoptec_token');
                    
                    if (!token) {
                        Swal.fire('Inicia sesión', 'Debes iniciar sesión para que tu donación quede registrada en la plataforma.', 'warning');
                        return;
                    }

                    try {
                        const res = await fetch('https://localhost:3000/api/finanzas/donaciones', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` 
                            },
                            body: JSON.stringify({ monto: Number(this.montoDonacion) })
                        });

                        if (res.ok) {
                            Swal.fire(
                                '¡Gracias!',
                                `Donación de $${this.montoDonacion} registrada exitosamente en tu cuenta.`,
                                'success'
                            );

                            // Actualización optimista de la meta global
                            // Actualización optimista y recarga real
                            await this.cargarMeta();
                            document.getElementById("montoDonacion").value = "";
                            this.montoDonacion = null;
                        } else {
                            const err = await res.json();
                            Swal.fire('Error', err.error || 'No se pudo registrar la donación.', 'error');
                        }
                    } catch (error) {
                        console.error("Error al registrar donación:", error);
                        Swal.fire('Error', 'Problema de conexión con el servidor.', 'error');
                    }
                }
            },
            renderUI() {
                const barra = document.getElementById("barraProgreso");
                const porc = Math.min((this.datos.recaudado / this.datos.meta) * 100, 100);
                barra.style.width = porc + "%";
                barra.style.background = "#F2A900"; // accent color
                barra.style.transition = "width 0.5s ease";

                document.getElementById("metaTexto").innerHTML =
                    `<strong>$${this.datos.recaudado}</strong> de $${this.datos.meta}`;

                const lista = document.getElementById("topDonadores");
                lista.innerHTML = "";

                const topDonadoresList = this.getTopDonadores();
                topDonadoresList.forEach((donador, index) => {
                    const li = document.createElement("li");
                    li.style.display = "flex";
                    li.style.justifyContent = "space-between";
                    li.style.padding = "0.8rem 0";
                    li.style.borderBottom = "1px solid #E9ECEF";

                    li.innerHTML = `
                        <span style="font-weight: 500; text-transform: capitalize;">
                            <span style="color: #6C757D; margin-right: 0.5rem;">
                                #${index + 1}
                            </span>
                            ${donador.nombre}
                        </span>
                        <span style="font-weight: 700; color: #7A1E38;">
                            $${donador.monto}
                        </span>
                    `;
                    lista.appendChild(li);
                });

                const adminPanel = document.getElementById("adminPanel");
                adminPanel.style.display = this.rol === "admin" ? "block" : "none";
            }
        }
    }).mount('#appDonaciones');
}