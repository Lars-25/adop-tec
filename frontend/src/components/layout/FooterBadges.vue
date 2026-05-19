<template>
  <footer class="footer-bottom">
    <p>&copy; 2026 AdopTec ITM. Todos los derechos reservados.</p>
    <div class="validator-badges">
      <a href="https://validator.w3.org/check?uri=referer" target="_blank" title="Validar HTML">
        <img src="https://www.w3.org/Icons/valid-html40" alt="HTML Válido">
      </a>
      <a href="https://jigsaw.w3.org/css-validator/check/referer" target="_blank" title="Validar CSS">
        <img src="https://jigsaw.w3.org/css-validator/images/vcss" alt="CSS Válido">
      </a>
    </div>
  </footer>
</template>

<style scoped>
.footer-bottom {
  text-align: center;
  padding: 1.5rem;
  background-color: var(--secondary-color, #E8F5E9);
  color: var(--text-color, #333);
  margin-top: auto;
}

body.dark-theme .footer-bottom {
  background-color: #1e1e1e;
  color: #fff;
}

.validator-badges {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.validator-badges img {
  border: 0;
  width: 88px;
  height: 31px;
}
</style>
