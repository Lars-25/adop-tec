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
        mounted() {
            const { getDB } = useStore();
            const db = getDB();

            this.datos = db.donaciones;
            this.historial = db.historialDonaciones || [];

            if (db.sesionActiva) this.rol = db.sesionActiva.rol;

            document.getElementById("mesActual").textContent = this.mesActual;

            document.getElementById("formDonacion").addEventListener("submit", (e) => {
                e.preventDefault();
                this.montoDonacion = Number(document.getElementById("montoDonacion").value);
                this.donar();
            });

            this.renderUI();
        },
        computed: { 
            porcentaje() { 
                return Math.min((this.datos.recaudado / this.datos.meta) * 100, 100); 
            },
            topDonadores() {
                const agrupados = {};
                this.historial.forEach(d => {
                    if (!agrupados[d.email]) agrupados[d.email] = 0;
                    agrupados[d.email] += Number(d.monto);
                });

                return Object.keys(agrupados)
                    .map(email => ({
                        nombre: email.split('@')[0],
                        monto: agrupados[email]
                    }))
                    .sort((a, b) => b.monto - a.monto)
                    .slice(0, 5);
            }
        },
        methods: {
            donar() {
                if (this.montoDonacion > 0) {
                    const { getDB, saveDB } = useStore();
                    let db = getDB();

                    db.donaciones.recaudado += this.montoDonacion;

                    if (!db.historialDonaciones) {
                        db.historialDonaciones = [];
                    }

                    db.historialDonaciones.push({
                        email: db.sesionActiva ? db.sesionActiva.email : 'Anónimo',
                        monto: Number(this.montoDonacion),
                        fecha: new Date().toISOString()
                    });

                    saveDB(db);

                    this.datos.recaudado = db.donaciones.recaudado;
                    this.historial = [...db.historialDonaciones];

                    Swal.fire(
                        '¡Gracias!',
                        `Donación de $${this.montoDonacion} registrada en tu cuenta.`,
                        'success'
                    );

                    document.getElementById("montoDonacion").value = "";
                    this.montoDonacion = null;
                    this.renderUI();
                }
            },
            renderUI() {
                const barra = document.getElementById("barraProgreso");
                barra.style.width = this.porcentaje + "%";
                barra.style.background = "#F2A900"; // accent color
                barra.style.transition = "width 0.5s ease";

                document.getElementById("metaTexto").innerHTML =
                    `<strong>$${this.datos.recaudado}</strong> de $${this.datos.meta}`;

                const lista = document.getElementById("topDonadores");
                lista.innerHTML = "";

                this.topDonadores.forEach((donador, index) => {
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