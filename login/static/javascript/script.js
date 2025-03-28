const formulario__boton__autenticacion = document.getElementById("formulario__boton__autenticacion");
const formulario__boton__crearcuenta = document.getElementById("formulario__boton__crearcuenta");
const boton__anterior = document.getElementById("boton__anterior");
const boton__confirmar = document.getElementById("boton__confirmar");
const formulario__contenedor = document.querySelector(".formulario__contenedor");

function resetClases() {
    formulario__contenedor.classList.remove("toggle", "toggle-2", "toggle-3", "toggle-4");
}

// Mueve el formulario a la izquierda cuando presionas "Siguiente"
formulario__boton__autenticacion.addEventListener("click", () => {
    resetClases();
    formulario__contenedor.classList.add("toggle");
});

// Mueve el formulario aún más a la izquierda cuando presionas "Crear Cuenta"
formulario__boton__crearcuenta.addEventListener("click", () => {
    resetClases();
    formulario__contenedor.classList.add("toggle-2");
});

// Regresa al paso anterior
boton__anterior.addEventListener("click", () => {
    resetClases();
    formulario__contenedor.classList.add("toggle-3");
});

// Confirma el registro
boton__confirmar.addEventListener("click", () => {
    resetClases();
    formulario__contenedor.classList.add("toggle-4");
});
