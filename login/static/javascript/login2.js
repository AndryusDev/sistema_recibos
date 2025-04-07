function AutenticarUsuario(event) {
    event.preventDefault();
    
    const formData = {
        email: document.getElementById('username').value,  // Asegúrate que coincida con tu HTML
        password: document.getElementById('password').value
    };

    console.log("Enviando:", formData);  // Verifica en consola del navegador (F12)

    fetch('/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // ¡Este es crítico!
            'X-CSRFToken': 'tu-csrf-token',     // Solo necesario si usas CSRF
        },
        body: JSON.stringify({
            email: "correo@ejemplo.com",        // Asegúrate que sea "email" (no "username")
            password: "tucontraseña"
        }),
    })
    .then(response => {
        console.log("Respuesta recibida:", response);  // Depuración
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('access_token', data.access);
        window.location.href = '/dashboard/';
    })
    .catch(error => {
        console.error("Error completo:", error);
        document.getElementById('error-message').textContent = 
            error.error || "Error al iniciar sesión";
    });
}
