from sqlite3 import IntegrityError
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
    # Obtener preguntas de seguridad activas
    preguntas = pregunta_seguridad.objects.filter(activa=True)

    return render(request, 'crear_cuenta.html', {
        'preguntas': preguntas  # Pasa las preguntas al contexto
    })

def recuperar_contraseña(request):
    return render(request, 'recuperar_contraseña.html')


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_200_OK
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django.shortcuts import render, redirect
from .models import empleado, usuario, rol, usuario_rol, usuario_pregunta, pregunta_seguridad  # Importa tu modelo usuario actual
from django.utils import timezone
from django.http import JsonResponse
from datetime import datetime
from django.utils.crypto import get_random_string

#Formulario verificacion empleado
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
                'tiene_usuario': tiene_usuario,
                'cedula': cedula
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
from django.http import JsonResponse
from django.views.decorators.http import require_POST

#formnulario crear Cuenta
@require_POST
def crear_cuenta_empleado(request):
    try:
        # Verificar contraseñas (usa los mismos nombres que en el formulario)
        if request.POST.get('contraseña') != request.POST.get('confirmar_contraseña'):
            return JsonResponse({'error': 'Las contraseñas no coinciden'}, status=400)
            
        # Obtener datos
        email = request.POST.get('email')
        contraseña = request.POST.get('contraseña')
        cedula = request.POST.get('cedula')
        print(cedula)
        
        # Verificar email único
        if usuario.objects.filter(email=email).exists():
            return JsonResponse({'error': 'El email ya está registrado'}, status=400)
        
        token_registro = get_random_string(50)
        
        # Almacenar usuario
        request.session['datos_registro'] = {
            'token': token_registro,
            'email': email,
            'contraseña': contraseña,
            'cedula': cedula,
            'ultimo_login': str(timezone.now())
        }
        request.session.modified = True  # ¡Importante!
        request.session.set_expiry(3600)  # 1 hora de validez
        
        response = JsonResponse({
            'status': 'success',
            'message': 'Datos validados correctamente',
            'token': token_registro,
        })
        response.set_cookie(
            'token_registro', 
            token_registro, 
            max_age=3600, 
            httponly=False, 
            samesite='Lax',
            path='/',
        )
        
        return response        
        
    except empleado.DoesNotExist:
        return JsonResponse({'error': 'No existe un empleado con esta cédula'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'Error del servidor: {str(e)}'}, status=500)
    
#Completar registros para almacenar en la base de datos
def completar_registro(request):

    try:
        # 1. Verificación de token
        token_frontend = request.POST.get('token')
        datos_sesion = request.session.get('datos_registro', {})
        print("Token desde el frontend:", token_frontend)
        print("Datos de sesión:", datos_sesion)
        
        if not datos_sesion or token_frontend != datos_sesion.get('token'):
            return JsonResponse({'error': 'Sesión inválida o expirada'}, status=400)
        empleado_instance = empleado.objects.get(cedula=datos_sesion['cedula'])

        # 2. Validar preguntas/respuestas primero
        preguntas_respuestas = [
            (request.POST.get('pregunta1'), request.POST.get('respuesta1')),
            (request.POST.get('pregunta2'), request.POST.get('respuesta2')),
            (request.POST.get('pregunta3'), request.POST.get('respuesta3'))
        ]
        
        if any(not pr[0] or not pr[1] for pr in preguntas_respuestas):
            return JsonResponse({'error': 'Todas las preguntas deben tener respuesta'}, status=400)

        # 3. Crear usuario (SIN HASH)
        nuevo_usuario = usuario.objects.create(
            email=datos_sesion['email'],
            contraseña_hash=datos_sesion['contraseña'],  # ← Contraseña en texto plano
            empleado=empleado_instance,  # Usamos _id para asignación directa
            ultimo_login=timezone.now()
        )

        # 4. Preguntas de seguridad (SIN HASH)
        for pregunta_id, respuesta in preguntas_respuestas:
            usuario_pregunta.objects.create(
                usuario_id=nuevo_usuario.id,  # Asignación por ID explícito
                pregunta_id=pregunta_id,
                respuesta_hash=respuesta,  # ← Respuesta en texto plano
            )

        # 5. Asignar rol
        usuario_rol.objects.create(
            usuario_id=nuevo_usuario.id,
            rol_id='1',  # Asume que existe este código
            fecha_asignacion=timezone.now()
        )

        # 6. Limpiar sesión
        del request.session['datos_registro']

        return JsonResponse({
            'status': 'success',
            'message': 'Usuario registrado (modo pruebas sin hashing)!'
        })

    except Exception as e:
        return JsonResponse({'error': f'Error: {str(e)}'}, status=500)


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