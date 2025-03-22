// Obtener el token CSRF del input oculto
var csrfToken = document.querySelector('input[name="csrf_token"]').value;

// Función para establecer los encabezados de la solicitud
function setRequestHeaders(xhr) {
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader("X-CSRF-Token", csrfToken); 
}

// Función de inicialización al cargar la página
function initializePage() {
  var codIdentPsnaInput = document.getElementById('CodIdentPsna');
  var usernameInput = document.getElementById('username');
  var passwordInput = document.getElementById('password');
  var loginButton = document.getElementById('loginButton');
  var togglePasswordButton = document.getElementById('togglePassword');
  var errorMessage = document.getElementById('error-message');

  usernameInput.disabled = true;
  passwordInput.disabled = true;
  loginButton.disabled = true;
  togglePasswordButton.classList.add('disabled');

  document.getElementById('LblUsername').style.opacity = "0.5";
  document.getElementById('LblPassword').style.opacity = "0.5";

  if (errorMessage && errorMessage.textContent !== '') {
    codIdentPsnaInput.setCustomValidity(errorMessage.textContent);
  }

  codIdentPsnaInput.oninput = function () {
    if (errorMessage) {
      errorMessage.textContent = "";
    }
    codIdentPsnaInput.setCustomValidity("");
  };
  
  codIdentPsnaInput.addEventListener('input', async function (event) {
    event.target.value = await formatCedula(event.target.value,'CodIdentPsna');
  });
}

// Ejecutar la función de inicialización al cargar la página
window.onload = initializePage;

// Evento al cargar el DOM
document.addEventListener('DOMContentLoaded', function () {
  const enableFields = window.enableFields;
  if (enableFields) {
    document.getElementById('username').disabled = false;
    document.getElementById('LblUsername').classList.remove('disabled-label');
    document.getElementById('password').disabled = false;
    document.getElementById('LblPassword').classList.remove('disabled-label');
    document.getElementById('loginButton').disabled = false;
  }

  const codIdentPsnaField = document.getElementById('CodIdentPsna');
  if (codIdentPsnaField) {
    codIdentPsnaField.addEventListener('input', function () {
      document.getElementById('username').setCustomValidity("");
      document.getElementById('password').setCustomValidity("");
      codIdentPsnaField.setCustomValidity("");
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
      document.getElementById('username').disabled = true;
      document.getElementById('LblUsername').classList.add('disabled-label');
      document.getElementById('password').disabled = true;
      document.getElementById('LblPassword').classList.add('disabled-label');
      document.getElementById('loginButton').disabled = true;
    });
  }

  const AutenticarUsuarioButton = document.querySelector('button[onclick="AutenticarUsuario()"]');
  if (AutenticarUsuarioButton) {
    AutenticarUsuarioButton.addEventListener('click', function () {
      AutenticarUsuario();
    });
  }

  const loginButton = document.getElementById('loginButton');
  if (loginButton) {
    loginButton.addEventListener('click', function (event) {
      event.preventDefault();

      var CodIdentPsnaInput = document.getElementById("CodIdentPsna");
      var prefix = document.getElementById("prefix").value;
      var formatted_id_number = CodIdentPsnaInput.value.replace(/\./g, '');

      var isValidUsername = validateForm("username");
      var isValidPassword = validateForm("password");
      
      if (!isValidUsername || !isValidPassword) {
        return;
      }
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/login", true);
      setRequestHeaders(xhr);

      xhr.onload = function () {
        var CodIdentPsnaInput = document.getElementById("CodIdentPsna");
        var contentType = xhr.getResponseHeader("Content-Type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          try {
            var response = JSON.parse(xhr.responseText);
            if (response.success) {
              window.location.href = "/menu";
            } else {
              setCustomMsjValidity('CodIdentPsna',response.error || 'Error inesperado.');
              document.getElementById("password").value = '';
              if (response.disableLogin) {
                document.getElementById("loginButton").disabled = true;
              }
            }
          } catch (e) {
            console.error('Error al parsear la respuesta JSON:', e);
            setCustomMsjValidity('CodIdentPsnaInput','Error al procesar la respuesta del servidor. Intente nuevamente.');
          }
        } else {
          setCustomMsjValidity('CodIdentPsnaInput','Respuesta del servidor no es JSON. Por favor, intente nuevamente.');
        }
      };

      xhr.onerror = function () {
        setCustomMsjValidity('CodIdentPsnaInput','Error de red. Intente nuevamente.');        
      };

      var dataToSend = JSON.stringify({
        cedula: formatted_id_number,
        prefix: prefix,
        username: username,
        password: password,
        csrf_token: csrfToken
      });
      xhr.send(dataToSend);
    });
  }

  const togglePassword = document.getElementById('togglePassword');
  if (togglePassword) {
    togglePassword.addEventListener('click', function () {
      var passwordInput = document.getElementById('password');
      var type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.classList.toggle('fa-eye-slash');
    });
  }
});

// Variable para controlar si el login está bloqueado
let loginDisabled = false;

// Evento click del botón loginButton
document.getElementById('loginButton').addEventListener('click', function (event) {
    event.preventDefault();

    var CodIdentPsnaInput = document.getElementById("CodIdentPsna");
    var prefix = document.getElementById("prefix").value;
    var formatted_id_number = CodIdentPsnaInput.value.replace(/\./g, '');

    var username = document.getElementById("username").value.trim();
    var password = document.getElementById("password").value.trim();

    if (!username) {
        setCustomMsjValidity("username","Debe rellenar este campo");
        return;
    }
    if (!password) {
        setCustomMsjValidity("password","Debe rellenar este campo");
        return;
    }

    // Crear objeto con los datos del usuario
    var userData = {
        cedula: formatted_id_number,
        prefix: prefix,
        username: username,
        password: password,
        csrf_token: csrfToken
    };

    // Enviar solicitud POST al servidor
    fetch('/autenticar_usuario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = "/menu";
        } else {
            setCustomMsjValidity("CodIdentPsnaInput",data.error || 'Error inesperado.');
            document.getElementById("password").value = '';
            if (data.disableLogin) {
                document.getElementById("loginButton").disabled = true;
            }
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        setCustomMsjValidity('CodIdentPsnaInput','Error interno del servidor. Intente nuevamente.');
    });
});