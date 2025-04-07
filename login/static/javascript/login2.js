function AutenticarUsuario(event) {
    event.preventDefault();
    
    const formData = {
        email: document.getElementById('username').value,  // Asegúrate que coincida con tu HTML
        password: document.getElementById('password').value
    };

    console.log("Enviando:", formData);  // Verifica en consola del navegador (F12)
    console.log("Datos enviados al backend:", formData);  // Verificación antes del fetch()
    
    fetch('/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.access) {
            // Guarda el token en Local Storage
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);  // Opcional
            console.log("Token guardado:", data.access);  // Verifica en consola
            window.location.href = '/dashboard/';
        } else {
            console.error("El servidor no devolvió un token");
        }
    })
    .catch(error => console.error("Error:", error));
}
