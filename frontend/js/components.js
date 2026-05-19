class PetCard extends HTMLElement {
    // connectedCallback se ejecuta cuando el elemento es insertado en el DOM
    // Esto es vital porque los atributos setAttribute() se leen después del constructor
    connectedCallback() {
        const nombre = this.getAttribute('data-nombre') || 'Mascota';
        const img = this.getAttribute('data-img') || 'https://placehold.co/400x300?text=Sin+Imagen';
        const ubicacion = this.getAttribute('data-ubicacion') || 'Local';
        const tiempo = this.getAttribute('data-tiempo') || '';

        // Mantenemos las clases CSS originales de AdopTec
        this.innerHTML = `
            <img src="${img}" alt="${nombre}" class="pet-card__img">
            <div class="pet-card__body">
                <h3 class="pet-card__title">${nombre}</h3>
                <div class="pet-card__meta">
                    <i class='bx bx-map'></i> ${ubicacion}
                </div>
                <div class="pet-card__meta">
                    <i class='bx bx-time'></i> ${tiempo}
                </div>
                <button class="pet-card__btn">Ver detalles</button>
            </div>
        `;
    }
}
// Registramos el componente nativo de HTML5
customElements.define('pet-card', PetCard);
