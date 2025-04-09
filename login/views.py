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
from .models import empleado, usuario  # Importa tu modelo usuario actual



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

def crear_cuenta_empleado(request):
    if request.method == "POST":
        print(request.post)


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