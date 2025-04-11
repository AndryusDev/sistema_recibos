from django.shortcuts import render
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_200_OK
from rest_framework_simplejwt.tokens import RefreshToken

from login.models import usuario

# Create your views here.
def login(request):
    enable_fields = {'campo1': True, 'campo2': False}
    enable_fields_json = json.dumps(enable_fields)
    return render(request, 'login.html', {'enable_fields_json': enable_fields_json})

def crear_cuenta(request):
    return render(request, 'crear_cuenta.html')

def recuperar_contraseña(request):
    return render(request, 'recuperar_contraseña.html')


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_200_OK
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny

from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import empleado  # Asume que tienes un modelo Empleado


from .models import empleado  # Asegúrate de importar tu modelo User
from .models import empleado, usuario, rol, usuario_rol  # Importa tu modelo usuario actual


from django.utils import timezone
from django.http import JsonResponse
from .models import empleado, usuario  # Asegúrate de que estos modelos estén importados

def verificar_empleado(request):
    if request.method == 'POST':
        cedula = request.POST.get('formulario_cedula', '').strip()

        try:
            empleado_instance = empleado.objects.get(cedula__iexact=cedula)
            tiene_usuario = usuario.objects.filter(empleado=empleado_instance).exists()

            empleado_data = {
                'primer_nombre': empleado_instance.primer_nombre,
                'segundo_nombre': empleado_instance.segundo_nombre or '',
                'primer_apellido': empleado_instance.primer_apellido,
                'segundo_apellido': empleado_instance.segundo_apellido or '',
                'tiene_usuario': tiene_usuario
            }

            return JsonResponse({
                'status': 'success',
                'tiene_usuario': tiene_usuario,
                'empleado': empleado_data,
                'message': 'Empleado verificado correctamente'
            })

        except empleado.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'No eres empleado registrado'
            }, status=404)

        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': 'Error interno del servidor'
            }, status=500)

    return JsonResponse({
        'status': 'error',
        'message': 'Método no permitido'
    }, status=405)

# Solo si estás usando CSRF en AJAX, asegúrate de que esto sea seguro
def crear_cuenta_empleado(request):
    if request.method == 'POST':
        try:
            # Asegúrate de recibir los datos correctamente
            try:
                data = json.loads(request.body.decode('utf-8'))  # Decodifica el body
            except json.JSONDecodeError:
                return JsonResponse({'status': 'error', 'message': 'Formato JSON inválido'}, status=400)
            
            cedula = data.get('cedula', '').strip()
            email = data.get('email', '').lower().strip()
            password = data.get('contraseña', '').strip()
            confirm_password = data.get('confirmar_contraseña', '').strip()

            print(f"Datos recibidos - Cédula: {cedula}, Email: {email}")  # Debug

            # Validación de campos vacíos
            if not all([cedula, email, password, confirm_password]):
                return JsonResponse({'status': 'error', 'message': 'Todos los campos son obligatorios'}, status=400)

            # Verificar empleado
            try:
                empleado_existente = empleado.objects.get(cedula=cedula)
                print(f"Empleado encontrado: {empleado_existente}")  # Debug
            except empleado.DoesNotExist:
                print(f"No se encontró empleado con cédula: {cedula}")  # Debug
                return JsonResponse({'status': 'error', 'message': 'La cédula no está registrada en el sistema. Contacte al administrador.'}, status=400)

            # Validar email único
            if usuario.objects.filter(email=email).exists():
                return JsonResponse({'status': 'error', 'message': 'El email ya está registrado'}, status=400)

            # Validar coincidencia de contraseñas
            if password != confirm_password:
                return JsonResponse({'status': 'error', 'message': 'Las contraseñas no coinciden'}, status=400)

            # Crear usuario (¡hasheando la contraseña!)
            nuevo_usuario = usuario(
                empleado=empleado_existente,
                email=email,
                contraseña_hash=password,  # Hashear la contraseña
                ultimo_login=timezone.now()
            )
            nuevo_usuario.save()

            return JsonResponse({'status': 'success', 'message': 'Cuenta creada exitosamente'})

        except Exception as e:
            print(f"Error inesperado: {str(e)}")  # Debug
            return JsonResponse({'status': 'error', 'message': 'Error interno del servidor'}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)


"""def crear_cuenta_empleado(request):
    if request.method == "POST":
        # Verificar que las contraseñas coincidan
        if request.POST['contraseña'] == request.POST['confirmar_contraseña']:
            email = request.POST.get('email')
            password = request.POST.get('contraseña')
            cedula = request.POST.get('formulario_cedula')

            # Verificar que el email no esté en uso
            if usuario.objects.filter(email=email).exists():
                return JsonResponse({'status': 'error', 'message': 'El correo ya está en uso'}, status=400)

            try:
                # Obtener el empleado correspondiente a la cédula
                empleado_instance = empleado.objects.get(cedula=cedula)

                # Almacenar los datos en la sesión
                request.session['temp_user_data'] = {
                    'email': email,
                    'password': password,
                    'empleado_id': empleado_instance.id  # Almacena el ID del empleado
                }

                # Redirigir a la vista de preguntas de seguridad
                return JsonResponse({'status': 'success', 'message': 'Datos almacenados, por favor complete las preguntas de seguridad.'})

            except empleado.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'Empleado no encontrado'}, status=404)
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': 'Error al procesar la solicitud: ' + str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)"""



#views viejo de crear cuenta
"""def crear_cuenta_empleado(request):
    if request.method == "POST":
        if request.POST['contraseña'] == request.POST['confirmar_contraseña']:
            email = request.POST.get('email')
            password = request.POST.get('contraseña')
            cedula = request.POST.get('formulario_cedula')

            # Verificar que el email no esté en uso
            if usuario.objects.filter(email=email).exists():
                return JsonResponse({'status': 'error', 'message': 'El correo ya está en uso'}, status=400)

            try:
                # Obtener el empleado correspondiente a la cédula
                empleado_instance = empleado.objects.get(cedula=cedula)

                # Obtener el rol por defecto
                try:
                    rol_usuario = rol.objects.get(codigo_rol='1')  # Cambia '1' por el código correspondiente a tu rol
                except rol.DoesNotExist:
                    return JsonResponse({'status': 'error', 'message': 'Rol no encontrado'}, status=404)

                # Crear la instancia del modelo usuario
                nuevo_usuario = usuario(
                    empleado=empleado_instance,
                    email=email,
                )
                nuevo_usuario.set_password(password)  # Almacena el hash de la contraseña
                nuevo_usuario.save()  # Guarda el nuevo usuario en la base de datos

                # Asignar el rol al nuevo usuario
                usuario_rol_instance = usuario_rol(
                    usuario=nuevo_usuario,
                    rol=rol_usuario
                )
                usuario_rol_instance.save()  # Guarda la asignación del rol

                return JsonResponse({'status': 'success', 'message': 'Cuenta creada correctamente'})
            except empleado.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'Empleado no encontrado'}, status=404)
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': 'Error al crear la cuenta: ' + str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)"""
            




"""class CustomLoginView(APIView):
    permission_classes = [AllowAny]
    http_method_names = ['post', 'get']
    
    def get(self, request):
        return render(request, 'login.html')

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        print("Correo recibido:", email)
        print("Datos recibidos en backend:", email, password)  # Verificación

        try:
            user = usuario.objects.get(email=email)
        except usuario.DoesNotExist:
            return Response({"error": "Email no registrado"}, status=HTTP_400_BAD_REQUEST)

        if user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=HTTP_200_OK)
        else:
            return Response({"error": "Contraseña incorrecta"}, status=HTTP_400_BAD_REQUEST)"""