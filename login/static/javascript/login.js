document.addEventListener('DOMContentLoaded', function() {
  console.log("🌐 Página del menú cargada. Ejecutando login2.js...");

  const sidebar = document.getElementById("sidebar");

  if (!sidebar) {
      console.warn("⚠ Sidebar no encontrado. login2.js no se ejecutará en esta página.");
      return;
  }

  const userNameElement = document.getElementById("user-name");
  const userLastnameElement = document.getElementById("user-lastname");
  const rolesElement = document.getElementById("roles");
  const userTypeElement = document.getElementById("user-type");

  if (userNameElement && userLastnameElement && rolesElement) {
      const usuarioInfo = JSON.parse(sessionStorage.getItem("usuario_info"));

      if (usuarioInfo) {
          console.log("✅ Usuario encontrado en sessionStorage:", usuarioInfo);
          userNameElement.innerText = usuarioInfo.nombre;
          userLastnameElement.innerText = usuarioInfo.apellido;
          rolesElement.innerText = Array.isArray(usuarioInfo.roles)
              ? usuarioInfo.roles.join(", ")
              : "Sin roles";
              if (Array.isArray(usuarioInfo.roles) && usuarioInfo.roles.length > 0) {
                const primerRol = usuarioInfo.roles[0];
            
                // ⬇ Aquí se mantiene la clase "user" + se agrega dinámicamente el rol
                userTypeElement.classList.add(primerRol.toLowerCase());
            }
      } else {
          console.error("❌ No se encontró información de usuario en sessionStorage.");
      }
  } else {
      console.error("❌ Elementos del sidebar no encontrados en el DOM.");
  }
});