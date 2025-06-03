import json
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_200_OK
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseServerError
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
import pandas as pd
from django.http import JsonResponse
from .models import concepto_pago, nomina, recibo_pago, detalle_recibo, prenomina, detalle_prenomina, banco
from datetime import datetime
import os
from django.conf import settings
from decimal import Decimal
import logging
from django.db import transaction
from login.models import usuario, recibo_pago
from .models import usuario, empleado, rol
from django.shortcuts import render, get_object_or_404, redirect
from django.utils.timezone import now
from django.db.models.functions import ExtractMonth

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

# <-----Estrucutra del menu ------->

def menu(request):
    if 'usuario_id' not in request.session:
        return redirect('/login/')  # Redirigir si no hay sesión
    return render(request, 'menu_principal/menu.html')

def load_template(request, template_name):
    allowed_templates = ['noticias.html', 'perfil_usuario.html', 'recibos_pagos.html',
                        'constancia_trabajo.html', 'arc.html','importar_nomina.html', 'gestion_nomina.html', 'ver_prenomina.html','crear_usuarios.html','gestion_respaldo.html', 'dashboard.html', 'roles_usuarios.html', 'crear_roles.html']  # Añade todos tus templates
    
    if template_name not in allowed_templates:
        return HttpResponseNotFound('Plantilla no permitida')
    
    try:
        return render(request, f'menu_principal/subs_menus/{template_name}')
    except:
        return HttpResponseNotFound('Plantilla no encontrada')

def serve_js(request, script_name):
    # Lista blanca de scripts permitidos
    allowed_scripts = ['noticias.js', 'perfil_usuario.js','recibos_pagos.js',
                        'constancia_trabajo.js', 'arc.js', 'importar_nomina.js', 'gestion_nomina.js',
                        'ver_prenomina.js', 'crear_usuarios.js', 'gestion_respaldo.js', 'dashboard.js', 'roles_usuarios', 'crear_roles.js']  # Añade todos tus scripts aquí
    
    if script_name not in allowed_scripts:
        return HttpResponseNotFound('Script no permitido')
    
    js_path = os.path.join(settings.STATIC_ROOT, 'javascript', 'menu_principal', 'subs_menus', script_name)
    
    if os.path.exists(js_path):
        with open(js_path, 'r') as f:
            return HttpResponse(f.read(), content_type='application/javascript')
    return HttpResponseNotFound('Script no encontrado')

from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseServerError
from .models import usuario, empleado, recibo_pago, rol

def perfil_usuario(request):
    try:
        usuario_id = request.session.get('usuario_id')
        if not usuario_id:
            return redirect('login_empleado')
        
        # Obtener el usuario con sus relaciones
        usuario_instance = get_object_or_404(
            usuario.objects.select_related('empleado', 'rol'),
            id=usuario_id
        )
        
        # Verificar si el empleado existe
        if not hasattr(usuario_instance, 'empleado'):
            raise ValueError("El usuario no tiene empleado asociado")
        
        # Obtener información del empleado con cuentas bancarias
        empleado_con_cuentas = empleado.objects.filter(
            pk=usuario_instance.empleado.pk
        ).prefetch_related('cuentas_bancarias__banco').first()
        
        # Obtener recibos recientes
        recibos_recientes = recibo_pago.objects.filter(
            cedula_id=usuario_instance.empleado.cedula
        ).select_related('nomina', 'cedula', 'cedula__cargo'
        ).order_by('-fecha_generacion')[:3]
        
        # Preparar el contexto (SIMPLIFICADO)
        context = {
            'usuario': usuario_instance,
            'empleado': empleado_con_cuentas,
            'recibos_recientes': recibos_recientes,
            # Eliminamos 'rol_usuario' ya que accederemos directamente desde usuario.rol
        }
        
        return render(request, 'menu_principal/subs_menus/perfil_usuario.html', context)
    
    except Exception as e:
        print(f"Error en perfil_usuario: {str(e)}")
        return HttpResponseServerError("Error al cargar el perfil. Por favor intente más tarde.")

    
def noticias(request):
    return render(request, 'menu_principal/subs_menus/noticias.html')

def noticias(request):
    return render(request, 'menu_principal/subs_menus/noticias.html')

def recibos_pagos(request):
    # Verificar si el usuario está autenticado
    if 'empleado_id' not in request.session:
        # Redirigir a login si no hay sesión
        return redirect('login_empleado')
    
    # Obtener el ID del empleado de la sesión
    empleado_id = request.session['empleado_id']
    
    # Filtrar recibos solo para el empleado autenticado
    recibos = recibo_pago.objects.filter(
        cedula_id=empleado_id
    ).select_related(
        'cedula', 
        'cedula__cargo'
    ).order_by('-fecha_generacion')
    
    return render(request, 'menu_principal/subs_menus/recibos_pagos.html', {
        'recibos': recibos
    })

def constancia_trabajo(request):
    return render(request, 'menu_principal/subs_menus/constancia_trabajo.html')

def arc(request):
    return render(request, 'menu_principal/subs_menus/arc.html')

def importar_nomina(request):
    tipos_nomina = tipo_nomina.objects.values_list('tipo_nomina', flat=True).distinct()

    mesess = meses.objects.values_list('nombre_mes', flat=True).distinct()

    secuencia_mes = secuencia.objects.values_list('nombre_secuencia', flat=True).distinct()

    nominas = nomina.objects.select_related('tipo_nomina', 'secuencia').all().order_by('-fecha_carga')

    print("Tipos de nómina encontrados:", list(tipos_nomina))  # Debug
    return render(request, 'menu_principal/subs_menus/importar_nomina.html', {
        'tipos_nomina': tipos_nomina, 'mesess': mesess, 'secuencia_mes': secuencia_mes, 'nominas': nominas
    })

def gestion_nomina(request):
    return render(request, 'menu_principal/subs_menus/gestion_nomina.html')

def ver_prenomina(request):
    prenominas = prenomina.objects.all().prefetch_related('detalles', 'nomina')
    
    lista = []
    for p in prenominas:
        total = p.detalles.aggregate(suma=Sum('total_monto'))['suma'] or 0
        lista.append({
            'id_prenomina': p.id_prenomina,
            'periodo': p.nomina.periodo,
            'tipo': p.nomina.tipo_nomina.tipo_nomina,
            'secuencia': p.nomina.secuencia.nombre_secuencia,  
            'total': total,
            'obj': p
        })

    return render(request, 'menu_principal/subs_menus/ver_prenomina.html', {
        'prenominas': lista
    })

def crear_usuarios(request):
    # Obtener todos los usuarios con sus relaciones
    usuarios = usuario.objects.select_related(
        'empleado',
        'empleado__cargo',
        'empleado__cargo__familia',
        'empleado__cargo__nivel',
        'empleado__tipo_trabajador'
    ).prefetch_related(
        'rol'
    ).all()
    
    # Obtener datos para el formulario
    tipos_trabajador_list = tipo_trabajador.objects.all()
    bancos_list = banco.objects.all()
    
    return render(request, 'menu_principal/subs_menus/crear_usuarios.html', {
        'usuarios': usuarios,
        'tipos_trabajador': tipos_trabajador_list,
        'bancos': bancos_list,
        'empleado': empleado  # Para acceder a las constantes del modelo
    })

def gestion_respaldo(request):
    return render(request, 'menu_principal/subs_menus/gestion_respaldo.html')

def dashboard(request):
    # Obtener años disponibles para el selector
    available_years = nomina.objects.dates('fecha_cierre', 'year').values_list('fecha_cierre__year', flat=True)
    current_year = datetime.now().year
    
    # Si no hay años en la base de datos, usar el año actual
    if not available_years:
        available_years = [current_year]
    
    context = {
        'total_empleados': empleado.objects.count(),
        'total_usuarios': usuario.objects.count(),
        'total_nominas': nomina.objects.count(),
        'total_gastado': detalle_nomina.objects.aggregate(total=Sum('monto')).get('total') or 0,
        'current_year': current_year,
        'available_years': sorted(available_years, reverse=True)
    }
    
    return render(request, 'menu_principal/subs_menus/dashboard.html', context)

def chart_data(request):
    try:
        year = request.GET.get('year', datetime.now().year)
        
        # Obtener datos mensuales
        gastos_mensuales = (
            detalle_nomina.objects
            .filter(nomina__fecha_cierre__year=year)
            .annotate(month=ExtractMonth('nomina__fecha_cierre'))
            .values('month')
            .annotate(total=Sum('monto'))
            .order_by('month')
        )
        
        # Calcular el total anual
        total_anual = float(detalle_nomina.objects
                        .filter(nomina__fecha_cierre__year=year)
                        .aggregate(total=Sum('monto'))
                        .get('total') or 0.0)
        
        # Preparar datos para el gráfico
        meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        datos = [0.0] * 12
        
        for gasto in gastos_mensuales:
            month_index = gasto['month'] - 1
            if 0 <= month_index < 12:
                datos[month_index] = float(gasto['total'])
        
        # Total de nóminas
        total_nominas = nomina.objects.filter(fecha_cierre__year=year).count()
        
        return JsonResponse({
            'year': year,
            'meses': meses,
            'datos': datos,
            'total_nominas': total_nominas,
            'total_anual': total_anual  # Añadimos este campo
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def roles_usuarios(request):
    return render(request, 'menu_principal/subs_menus/rol_usuario.html')

def crear_roles(request):
    return render(request, 'menu_principal/subs_menus/crear_roles.html')

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django.shortcuts import render, redirect
from .models import empleado, usuario, rol, usuario_pregunta, pregunta_seguridad, tipo_nomina ,meses, secuencia, tipo_trabajador, detalle_nomina, detalle_recibo, recibo_pago  # Importa tu modelo usuario actual
from django.utils import timezone
from django.http import JsonResponse
from datetime import datetime
from django.utils.crypto import get_random_string

#   <-------CREAR CUENTA------->

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
from django.contrib.auth.hashers import make_password, check_password


#formnulario crear Cuenta
@require_POST
def crear_cuenta_empleado(request):
    try:
        # Verificar contraseñas (usa los mismos nombres que en el formulario)
        if request.POST.get('contraseña') != request.POST.get('confirmar_contraseña'):
            return JsonResponse({'error': 'Las contraseñas no coinciden'}, status=400)
        
        #Verificar que la contraseña sea mayour a 8 digitos
        if len(request.POST.get('contraseña', '')) < 8:
            return JsonResponse({'error': 'La contraseña debe tener al menos 8 caracteres'}, status=400)
            
        # Obtener datos
        email = request.POST.get('email')
        contraseña = request.POST.get('contraseña')
        cedula = request.POST.get('cedula')
        print(cedula)
        
        # Verificar email único
        if usuario.objects.filter(email=email).exists():
            return JsonResponse({'error': 'El email ya está registrado'}, status=400)
        contraseña_hash = make_password(contraseña)
        
        token_registro = get_random_string(50)
        
        # Almacenar usuario
        request.session['datos_registro'] = {
            'token': token_registro,
            'email': email,
            'contraseña': contraseña_hash,
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
            ultimo_login=timezone.now(),
            rol_id='1',
        )

        # 4. Preguntas de seguridad (SIN HASH)
        for pregunta_id, respuesta in preguntas_respuestas:
            usuario_pregunta.objects.create(
                usuario_id=nuevo_usuario.id,  # Asignación por ID explícito
                pregunta_id=pregunta_id,
                respuesta_hash=make_password(respuesta.lower().strip()),  # ← Respuesta en texto plano
            )


        # 6. Limpiar sesión
        del request.session['datos_registro']

        return JsonResponse({
            'status': 'success',
            'message': 'Usuario registrado (modo pruebas sin hashing)!'
        })

    except Exception as e:
        return JsonResponse({'error': f'Error: {str(e)}'}, status=500)
    
#   <-------CREAR CUENTA TERMINADO------->

#          <-------LOGIN------->

@require_POST
def login_empleado(request):
    try:
        email = request.POST.get('email')
        contraseña = request.POST.get('password')

        # Validaciones de campos
        if not email:
            return JsonResponse({'status': 'error', 'error': 'El correo electrónico es obligatorio.'}, status=400)
        
        if not contraseña:
            return JsonResponse({'status': 'error', 'error': 'La contraseña es obligatoria.'}, status=400)

        # Buscar el usuario por email
        try:
            usuario_instance = usuario.objects.get(email=email)
        except usuario.DoesNotExist:
            return JsonResponse({'status': 'error', 'error': 'Correo electrónico no registrado.'}, status=401)

        # Verificar contraseña
        if not check_password(contraseña, usuario_instance.contraseña_hash):
            return JsonResponse({'status': 'error', 'error': 'Contraseña incorrecta.'}, status=401)

        # Obtener el empleado asociado
        empleado_instance = usuario_instance.empleado  # Asegúrate de que esta relación exista

        # Guardar datos de sesión
        request.session['usuario_id'] = usuario_instance.id
        request.session['email'] = usuario_instance.email
        request.session['empleado_id'] = usuario_instance.empleado_id
        request.session.set_expiry(3600)  # 1 hora

        usuario_instance.ultimo_login = timezone.now()
        usuario_instance.save()

        rol_nombre = usuario_instance.rol.nombre_rol if usuario_instance.rol else 'Sin rol asignado'
        

        # Información del usuario para enviar al frontend
        usuario_info = {
            'nombre': empleado_instance.primer_nombre,
            'apellido': empleado_instance.primer_apellido,
            'cedula': empleado_instance.cedula,
            'cargo': str(empleado_instance.cargo) if empleado_instance.cargo else 'N/A',
            'roles': rol_nombre,
            'ultimo_login': usuario_instance.ultimo_login.strftime('%d/%m/%Y %H:%M') if usuario_instance.ultimo_login else 'Nunca'
        }
        
        return JsonResponse({
            'status': 'success',
            'message': 'Inicio de sesión exitoso.',
            'redirect_url': '/menu/',
            'usuario_info': usuario_info
        })

    except Exception as e:
        import traceback
        traceback.print_exc()  # Esto imprimirá el traceback completo en la consola del servidor
        return JsonResponse({'status': 'error', 'error': str(e)}, status=500)
    
#          <-------LOGIN_TERMINADO------->

#          <-------RECUPERAR_CONTRASEÑA------->

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

#   <----------codigo importar documento -------------------->

logger = logging.getLogger(__name__)


@csrf_exempt
@transaction.atomic
@csrf_exempt
@transaction.atomic
def importar_nominas(request):
    if request.method == 'POST':
        try:
            # 1. Validación y obtención de parámetros básicos
            tipo_nomina_nombre = request.POST.get('tipo_nomina')
            mes_nombre = request.POST.get('mes')
            anio = request.POST.get('anio')
            secuencia_nombre = request.POST.get('secuencia')
            fecha_cierre = request.POST.get('fecha_cierre')
            archivo = request.FILES.get('archivo')
            
            # Validaciones básicas
            if not all([tipo_nomina_nombre, mes_nombre, anio, secuencia_nombre, fecha_cierre, archivo]):
                return JsonResponse({'error': 'Todos los campos son requeridos'}, status=400)
            
            if archivo.size > 10 * 1024 * 1024:  # 10MB máximo
                return JsonResponse({'error': 'El archivo excede el tamaño máximo permitido (10MB)'}, status=400)

            # 2. Validar referencias a tablas maestras
            try:
                tipo_nomina_obj = tipo_nomina.objects.get(tipo_nomina=tipo_nomina_nombre)
                meses_obj = meses.objects.get(nombre_mes=mes_nombre)
                secuencia_obj = secuencia.objects.get(nombre_secuencia=secuencia_nombre)
            except ObjectDoesNotExist as e:
                return JsonResponse({'error': f'Referencia inválida: {str(e)}'}, status=400)

            # 3. Procesamiento del archivo
            try:
                if archivo.name.endswith('.csv'):
                    df = pd.read_csv(archivo, dtype={'COD': str, 'CEDULA': str})
                elif archivo.name.endswith(('.xls', '.xlsx')):
                    df = pd.read_excel(archivo, dtype={'COD': str, 'CEDULA': str})
                else:
                    return JsonResponse({'error': 'Formato de archivo no soportado. Use CSV o Excel'}, status=400)
            except Exception as e:
                return JsonResponse({'error': f'Error al leer el archivo: {str(e)}'}, status=400)

            # 4. Validación de estructura del archivo
            required_columns = [
                'COD', 'CEDULA', 'APELLIDO', 'NOMBRE', 
                'SDOBASE', 'TOTPGONOMINA', 'NUMERO DE CUENTA DE BANCO'
            ]
            
            # Normalizar nombres de columnas
            df.columns = [col.strip().upper().replace(' ', '_') for col in df.columns]
            missing_columns = [col for col in required_columns 
                            if col.replace(' ', '_') not in df.columns]
            
            if missing_columns:
                return JsonResponse({
                    'error': f'El archivo no tiene la estructura esperada. Faltan: {", ".join(missing_columns)}'
                }, status=400)

            # 5. Crear registro de nómina
            nueva_nomina = nomina.objects.create(
                tipo_nomina=tipo_nomina_obj,
                periodo=f"{meses_obj.nombre_mes}-{anio}",
                secuencia=secuencia_obj,
                fecha_cierre=datetime.strptime(fecha_cierre, '%Y-%m-%d').date()
            )

            # 6. Procesar cada registro del archivo
            stats = {
                'empleados_procesados': 0,
                'conceptos_procesados': 0,
                'recibos_generados': 0,
                'errores': 0
            }

            for _, row in df.iterrows():
                detalles_empleado = []  # Mover la declaración aquí para que sea visible en todo el bloque
                try:
                    # 6.1. Obtener empleado (no crear si no existe)
                    try:
                        empleado_obj = empleado.objects.get(cedula=row['CEDULA'])
                    except empleado.DoesNotExist:
                        stats['errores'] += 1
                        logger.error(f"Empleado no encontrado: {row['CEDULA']}")
                        continue

                    # 6.2. Procesar conceptos dinámicos
                    concept_cols = [col for col in df.columns if col not in [
                        'COD', 'CEDULA', 'APELLIDO', 'NOMBRE', 
                        'SDOBASE', 'TOTPGONOMINA', 'NUMERO_DE_CUENTA_DE_BANCO'
                    ] and pd.api.types.is_numeric_dtype(df[col])]

                    for col in concept_cols:
                        monto = row[col]
                        if pd.notna(monto) and float(monto) != 0:
                            # 6.3. Buscar concepto en catálogo
                            try:
                                concepto_obj = concepto_pago.objects.get(
                                    Q(nombre_nomina__iexact=col) | 
                                    Q(codigo__iexact=extract_codigo_from_colname(col))
                                )
                                
                                # 6.4. Crear detalle de nómina
                                detalle = detalle_nomina.objects.create(
                                    nomina=nueva_nomina,
                                    cedula=empleado_obj,
                                    codigo=concepto_obj,
                                    monto=Decimal(str(monto))
                                )
                                detalles_empleado.append(detalle)
                                stats['conceptos_procesados'] += 1
                            except ObjectDoesNotExist:
                                logger.warning(f'Concepto no encontrado para columna: {col}')
                                stats['errores'] += 1
                            except Exception as e:
                                logger.error(f"Error procesando concepto {col}: {str(e)}")
                                stats['errores'] += 1

                    stats['empleados_procesados'] += 1

                    # 6.5. Crear recibo de pago si hay detalles
                    if detalles_empleado:  # Ahora la variable es visible aquí
                        try:
                            # Crear el recibo en la base de datos
                            recibo = recibo_pago.objects.create(
                                nomina=nueva_nomina,
                                cedula=empleado_obj,
                                fecha_generacion=datetime.now()
                            )
                            
                            # Asociar los detalles al recibo
                            for detalle in detalles_empleado:
                                detalle_recibo.objects.create(
                                    recibo=recibo,
                                    detalle_nomina=detalle
                                )
                            
                            stats['recibos_generados'] += 1
                        except Exception as e:
                            stats['errores'] += 1
                            logger.error(f"Error creando recibo para {empleado_obj.cedula}: {str(e)}")

                except Exception as e:
                    stats['errores'] += 1
                    logger.error(f"Error procesando empleado {row['CEDULA']}: {str(e)}")

            # 7. Retornar resultados
            generar_prenomina_para_nomina(nueva_nomina)
            return JsonResponse({
                'success': True,
                'message': f'Nómina importada correctamente. Empleados: {stats["empleados_procesados"]}, ' +
                        f'Conceptos: {stats["conceptos_procesados"]}, ' +
                        f'Recibos generados: {stats["recibos_generados"]}',
                'id': nueva_nomina.id_nomina,  # <--- aquí cambias de 'nomina_id' a 'id'
                'stats': stats
            })

        except Exception as e:
            logger.error(f"Error en importar_nominas: {str(e)}", exc_info=True)
            return JsonResponse({
                'success': False,
                'error': f'Error interno del servidor: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'error': 'Método no permitido'
    }, status=405)

def extract_codigo_from_colname(col_name):
    """
    Extrae el código de concepto del nombre de columna.
    Implementa según tu mapeo específico.
    """
    codigo_map = {
        'MTO_VACAC': '1401c',
        'PRM_HJOS': '1101c',
        'DEDUC_FAOV': '20003c',
        # Agrega todos los mapeos necesarios
    }
    return codigo_map.get(col_name, col_name)

from django.shortcuts import get_object_or_404
from django.db.models import Prefetch

from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .models import recibo_pago

from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import Sum
from .models import recibo_pago
import logging

logger = logging.getLogger(__name__)

@require_GET
def obtener_datos_recibo(request, recibo_id):
    try:
        # Optimización de consultas con select_related y prefetch_related
        recibo = (recibo_pago.objects
                .select_related(
                    'cedula',
                    'nomina',
                    'cedula__cargo',
                    'cedula__cargo__familia',
                    'cedula__cargo__nivel'
                )
                .prefetch_related(
                    'detalles__detalle_nomina__codigo',
                    'cedula__cuentas_bancarias__banco'
                )
                .get(pk=recibo_id))

        # Obtener cuenta bancaria activa
        cuenta_activa = recibo.cedula.cuentas_bancarias.filter(activa=True).first()

        # Procesar conceptos
        conceptos = []
        for detalle in recibo.detalles.all():
            concepto = detalle.detalle_nomina
            conceptos.append({
                'codigo': concepto.codigo.codigo,
                'descripcion': concepto.codigo.descripcion,
                'asignacion': float(concepto.monto) if concepto.codigo.tipo_concepto == 'ASIGNACION' else None,
                'deduccion': float(concepto.monto) if concepto.codigo.tipo_concepto == 'DEDUCCION' else None
            })

        # Cálculo de totales
        detalles = recibo.detalles.all()
        total_asignaciones = sum(d.detalle_nomina.monto for d in detalles if d.detalle_nomina.codigo.tipo_concepto == 'ASIGNACION')
        total_deducciones = sum(d.detalle_nomina.monto for d in detalles if d.detalle_nomina.codigo.tipo_concepto == 'DEDUCCION')

        datos = {
            'encabezado': {
                'fecha_ingreso': recibo.cedula.fecha_ingreso.strftime("%d-%b-%y") if recibo.cedula.fecha_ingreso else "N/A",
                'nombre_completo': recibo.cedula.get_nombre_completo(),
                'cedula': recibo.cedula.cedula,
                'numero_cuenta': cuenta_activa.numero_cuenta if cuenta_activa else "No registrado",
                'banco': cuenta_activa.banco.nombre if cuenta_activa else "No especificado",
                'cargo': recibo.cedula.cargo.nombre_completo if recibo.cedula.cargo else "Sin cargo",
                'periodo': recibo.nomina.periodo if recibo.nomina else "Periodo no definido",
                'sueldo_base': next((c['asignacion'] for c in conceptos if c['codigo'] == '1001'), 0)  # Asumiendo que 1001 es sueldo base
            },
            'conceptos': conceptos,
            'totales': {
                'total_asignaciones': total_asignaciones,
                'total_deducciones': total_deducciones,
                'total_nomina': total_asignaciones - total_deducciones
            }
        }
        
        return JsonResponse(datos)

    except recibo_pago.DoesNotExist:
        return JsonResponse({'error': 'Recibo no encontrado'}, status=404)
    except Exception as e:
        logger.error(f"Error al obtener recibo {recibo_id}: {str(e)}", exc_info=True)
        return JsonResponse({'error': 'Error interno del servidor'}, status=500)
    
@login_required
def listado_recibos(request):
    try:
        # Obtener el usuario personalizado
        try:
            usuario_personalizado = usuario.objects.get(email=request.user.email)
        except usuario.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)
        
        # Verificar que tenga empleado asociado
        if not usuario_personalizado.empleado:
            return JsonResponse({'error': 'Usuario no tiene empleado asociado'}, status=400)
        
        recibos = recibo_pago.objects.filter(
            cedula=usuario_personalizado.empleado
        ).select_related(
            'cedula',
            'cedula__cargo',
            'nomina'
        ).order_by('-fecha_generacion')
        
        paginator = Paginator(recibos, 10)
        page_number = request.GET.get('page')
        
        try:
            page_obj = paginator.page(page_number)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)
            
        return render(request, 'menu_principal/subs_menus/recibo_pago.html', {
            'page_obj': page_obj,
            'titulo_pagina': 'Mis Recibos de Pago'
        })
        
    except Exception as e:
        print(f"Error en listado_recibos: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
    


logger = logging.getLogger(__name__)

def generar_prenomina_para_nomina(nomina_instance):
    try:
        if prenomina.objects.filter(nomina=nomina_instance).exists():
            logger.info(f"Prenomina ya existe para la nómina {nomina_instance.id_nomina}")
            return None

        nueva = prenomina.objects.create(nomina=nomina_instance, fecha_creacion=now())

        detalles = detalle_nomina.objects.filter(nomina=nomina_instance)
        if not detalles.exists():
            logger.warning(f"No hay detalles para la nómina {nomina_instance.id_nomina}")

        resumen = detalles.values('codigo').annotate(total=Sum('monto'))
        for item in resumen:
            detalle_prenomina.objects.create(
                prenomina=nueva, codigo_id=item['codigo'], total_monto=item['total']
            )

        logger.info(f"Prenomina generada para la nómina {nomina_instance.id_nomina}")
        return nueva

    except Exception as e:
        logger.error(f"Error generando prenomina {nomina_instance.id_nomina}: {e}", exc_info=True)
        raise