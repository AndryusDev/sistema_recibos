
const formulario__boton__autenticacion = document.getElementById("formulario__boton__autenticacion");
const formulario__boton__crearcuenta = document.getElementById("formulario__boton__crearcuenta");
const formulario__boton__preguntasseguridad = document.getElementById("formulario__boton__preguntasseguridad");
const formulario__contenedor = document.querySelector(".formulario__contenedor");

// Mueve el formulario a la izquierda cuando presionas "Siguiente"
formulario__boton__autenticacion.addEventListener("click", () => {
    formulario__contenedor.classList.add("toggle");
});

 // Mueve el formulario aún más a la izquierda cuando presionas "Crear Cuenta"
formulario__boton__crearcuenta.addEventListener("click", () => {
    formulario__contenedor.classList.add("toggle-2");
});
