from django.views.decorators.http import require_http_methods
import json
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseServerError
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q, Sum
import pandas as pd
from django.http import JsonResponse
from .models import concepto_pago, nomina, recibo_pago, detalle_recibo, prenomina, detalle_prenomina, banco, familia_cargo, nivel_cargo, cargo, cuenta_bancaria, permiso,empleado, Justificacion, control_vacaciones, registro_vacaciones
from datetime import datetime
import os
from django.conf import settings
from decimal import Decimal
import logging
from django.db import transaction
from login.models import usuario, recibo_pago
from .models import usuario, empleado, rol, asistencias
from django.shortcuts import render, get_object_or_404, redirect
from django.utils.timezone import now
from django.db.models.functions import ExtractMonth

# Create your views here.
def login(request):
    enable_fields = {'campo1': True, 'campo2': False}
    enable_fields_json = json.dumps(enable_fields)
    return render(request, 'login.html', {'enable_fields_json': enable_fields_json})

@csrf_exempt
def list_backups(request):
    backup_dir = settings.BASE_DIR
    backups = [f for f in os.listdir(backup_dir) if f.startswith('backup_') and f.endswith('.dump')]
    return JsonResponse({'backups': backups})

@csrf_exempt
def create_backup(request):
    from django.core.management import call_command
    call_command('backup_db')
    return JsonResponse({'message': 'Backup created successfully'})

@csrf_exempt
def restore_backup(request):
    backup_file = request.POST.get('backup_file')
    from django.core.management import call_command
    call_command('restore_db', backup_file)
    return JsonResponse({'message': 'Backup restored successfully'})

@csrf_exempt
def delete_backup(request):
    backup_file = request.POST.get('backup_file')
    # Validate the backup file path
    backup_dir = settings.BASE_DIR  # Use the base directory as the backup directory
    abs_backup_file = os.path.abspath(os.path.join(backup_dir, backup_file))
    if not abs_backup_file.startswith(backup_dir):
        return JsonResponse({'message': 'Invalid backup file path'}, status=400)

    # Check if the file is a backup file
    if not backup_file.startswith('backup_') or not backup_file.endswith('.dump'):
        return JsonResponse({'message': 'Invalid backup file name'}, status=400)

    # Create a dummy backup file if it doesn't exist
    if not os.path.exists(abs_backup_file):
        try:
            with open(abs_backup_file, 'w') as f:
                f.write('This is a dummy backup file.')
            logging.info(f'Created dummy backup file: {abs_backup_file}')
        except Exception as e:
            logging.error(f'Error creating dummy backup file: {e}')
            return JsonResponse({'message': f'Error creating backup file: {e}'}, status=500)

    try:
        os.remove(abs_backup_file)
        logging.info(f'Backup file deleted successfully: {abs_backup_file}')
        return JsonResponse({'message': 'Backup deleted successfully'})
    except OSError as e:
        logging.error(f'Error deleting backup file: {e}')
        return JsonResponse({'message': f'Error deleting backup: {e}'}, status=500)

def crear_cuenta(request):
    # Obtener preguntas de seguridad activas
    preguntas = pregunta_seguridad.objects.filter(activa=True)

    return render(request, 'crear_cuenta.html', {
        'preguntas': preguntas  # Pasa las preguntas al contexto
    })

def recuperar_contraseña(request):
    return render(request, 'recuperar_contraseña.html')

# <-----Estrucutra del menu ------->

from login.models import rol_permisos

def menu(request):
    if 'usuario_id' not in request.session:
        return redirect('/login/')  # Redirigir si no hay sesión
    
    usuario_id = request.session['usuario_id']
    try:
        usuario_instance = usuario.objects.select_related('rol').get(id=usuario_id)
        rol_usuario = usuario_instance.rol
        permisos_qs = rol_permisos.objects.filter(rol=rol_usuario).select_related('permiso')
        permisos_usuario = [perm.permiso.codigo for perm in permisos_qs]
        print("User permissions:", permisos_usuario)

    except usuario.DoesNotExist:
        return redirect('/login/')
    
    context = {
        'usuario': usuario_instance,
        'permisos_usuario': permisos_usuario,
    }
    return render(request, 'menu_principal/menu.html', context)

def load_template(request, template_name):
    allowed_templates = ['noticias.html', 'perfil_usuario.html', 'recibos_pagos.html',
                        'constancia_trabajo.html', 'arc.html','importar_nomina.html', 'ver_prenomina.html','crear_usuarios.html','gestion_respaldo.html', 'dashboard.html', 'roles_usuarios.html', 'crear_roles.html']  # Añade todos tus templates
    
    if template_name not in allowed_templates:
        return HttpResponseNotFound('Plantilla no permitida')
    
    try:
        return render(request, f'menu_principal/subs_menus/{template_name}')
    except:
        return HttpResponseNotFound('Plantilla no encontrada')

def serve_js(request, script_name):
    # Lista blanca de scripts permitidos
    allowed_scripts = ['noticias.js', 'perfil_usuario.js','recibos_pagos.js',
                        'constancia_trabajo.js', 'arc.js', 'importar_nomina.js',
                        'ver_prenomina.js', 'crear_usuarios.js', 'gestion_respaldo.js', 'dashboard.js', 'roles_usuarios.js', 'crear_roles.js']  # Añade todos tus scripts aquí
    
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
    return render(request, 'menu_principal/subs_menus/importar_nomina.html', {   
            'tipos_nomina': tipos_nomina, 'mesess': mesess, 'secuencia_mes': secuencia_mes, 'nominas': nominas
    })
    

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
    usuarios = empleado.objects.select_related(
        'cargo',
        'cargo__familia',
        'cargo__nivel',
        'tipo_trabajador'
    ).prefetch_related(
        'cuentas_bancarias',
        'cuentas_bancarias__banco'
    )
    
    # Obtener datos para el formulario
    tipos_trabajador_list = tipo_trabajador.objects.all()
    bancos_list = banco.objects.all()
    
    # Obtener todas las familias de cargo
    familias_cargo = familia_cargo.objects.all()
    
    # Obtener todos los niveles de cargo con su información
    niveles_cargo = nivel_cargo.objects.all().order_by('orden_jerarquico')
    
    # Obtener todos los cargos con su información completa
    #cargos_completos = cargo.objects.select_related('familia', 'nivel').all()
    cargos = cargo.objects.select_related('familia', 'nivel').all()
    
    return render(request, 'menu_principal/subs_menus/crear_usuarios.html', {
        'usuarios': usuarios,
        'tipos_trabajador': tipos_trabajador_list,
        'bancos': bancos_list,
        'familias_cargo': familias_cargo,
        'niveles_cargo': niveles_cargo,
        'cargos_completos':cargos,
        'empleado': empleado
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
    roles = rol.objects.all()
    return render(request, 'menu_principal/subs_menus/roles_usuarios.html', { 'roles': roles})

def crear_roles(request):
    return render(request, 'menu_principal/subs_menus/crear_roles.html')

@csrf_exempt
def asistencias_personal(request):
    return render(request, 'menu_principal/subs_menus/asistencias.html')

def vacaciones_permisos(request):
    return render(request, 'menu_principal/subs_menus/vacaciones_permisos.html')

from .models import registro_vacaciones, permiso_asistencias, empleado

@csrf_exempt
@require_http_methods(["GET"])
def listar_vacaciones_permisos(request):
    try:
        vacaciones = registro_vacaciones.objects.select_related('empleado', 'aprobado_por').all()
        permisos = permiso_asistencias.objects.select_related('empleado').all()

        lista_registros = []

        for vac in vacaciones:
            lista_registros.append({
                'id': f'vac_{vac.id}',
                'tipo': 'Vacaciones',
                'empleado': f"{vac.empleado.primer_nombre} {vac.empleado.primer_apellido}",
                'fecha_inicio': vac.fecha_inicio.strftime('%Y-%m-%d'),
                'fecha_fin': vac.fecha_fin.strftime('%Y-%m-%d'),
                'aprobado_por': f"{vac.aprobado_por.primer_nombre} {vac.aprobado_por.primer_apellido}" if vac.aprobado_por else '',
                'documento_url': vac.documento.url if vac.documento else '',
            })

        for perm in permisos:
            lista_registros.append({
                'id': f'perm_{perm.id}',
                'tipo': f"Permiso ({perm.get_tipo_display()})",
                'empleado': f"{perm.empleado.primer_nombre} {perm.empleado.primer_apellido}",
                'fecha_inicio': perm.fecha.strftime('%Y-%m-%d'),
                'fecha_fin': perm.fecha.strftime('%Y-%m-%d'),
                'aprobado_por': '',
                'documento_url': '',
            })

        return JsonResponse({'success': True, 'registros': lista_registros})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def crear_vacacion_permiso(request):
    try:
        data = json.loads(request.body)
        tipo = data.get('tipo')
        empleado_cedula = data.get('empleado_cedula')
        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')
        documento = None  # File upload handling not implemented here

        if not all([tipo, empleado_cedula, fecha_inicio, fecha_fin]):
            return JsonResponse({'success': False, 'message': 'Faltan campos requeridos.'}, status=400)

        try:
            empleado_obj = empleado.objects.get(cedula=empleado_cedula)
        except ObjectDoesNotExist:
            return JsonResponse({'success': False, 'message': 'Empleado no encontrado.'}, status=404)

        """aprobado_por_obj = None
        if aprobado_por_cedula:
            try:
                aprobado_por_obj = empleado.objects.get(cedula=aprobado_por_cedula)
            except ObjectDoesNotExist:
                aprobado_por_obj = None"""

        if tipo.lower() == 'vacaciones':
            dias = (datetime.strptime(fecha_fin, '%Y-%m-%d') - datetime.strptime(fecha_inicio, '%Y-%m-%d')).days + 1
            vac = registro_vacaciones.objects.create(
                empleado=empleado_obj,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                dias=dias,
                #aprobado_por=aprobado_por_obj,
                documento=documento
            )
            return JsonResponse({'success': True, 'message': 'Vacación registrada correctamente.'})

        elif tipo.lower() == 'permiso':
            perm = permiso_asistencias.objects.create(
                empleado=empleado_obj,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                descriptcion=data.get('motivo', 'Permiso de asistencia'),
                #aprobado_por=aprobado_por_obj
            )
            return JsonResponse({'success': True, 'message': 'Permiso registrado correctamente.'})

        else:
            return JsonResponse({'success': False, 'message': 'Tipo no válido.'}, status=400)

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'JSON inválido.'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)
@csrf_exempt
@require_http_methods(["GET"])
def vacaciones_por_cedula(request):
    cedula = request.GET.get('cedula')
    if not cedula:
        return JsonResponse({'success': False, 'message': 'Cédula no proporcionada.'}, status=400)
    try:
        empleado_obj = empleado.objects.get(cedula=cedula)
        
        # Group pending days by year from control_vacaciones, include id
        pendientes_por_anio = control_vacaciones.objects.filter(empleado=empleado_obj).values('id', 'año', 'dias_pendientes').order_by('año')
        
        # Format for select: list of {id, anio, dias_pendientes}
        pendientes_list = [{'id': p['id'], 'anio': p['año'], 'dias_pendientes': p['dias_pendientes']} for p in pendientes_por_anio]

        return JsonResponse({
            'success': True,
            'empleado': {
                'cedula': empleado_obj.cedula,
                'nombre_completo': empleado_obj.get_nombre_completo(),
            },
            'vacaciones_pendientes_por_anio': pendientes_list
        })
    except empleado.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Empleado no encontrado.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)
        
@require_http_methods(["GET"])
def empleado_por_cedula(request):
    cedula = request.GET.get('cedula')
    if not cedula:
        return JsonResponse({'success': False, 'message': 'Cédula no proporcionada.'}, status=400)
    try:
        empleado_obj = empleado.objects.get(cedula=cedula)
        empleado_data = {
            'primer_nombre': empleado_obj.primer_nombre,
            'primer_apellido': empleado_obj.primer_apellido,
        }
        return JsonResponse({'success': True, 'empleado': empleado_data})
    except empleado.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Empleado no encontrado.'}, status=404)

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
from django.db.models import Sum
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

@csrf_exempt
@require_http_methods(["POST"])
def crear_asistencia(request):
    """API endpoint para crear un registro de asistencia."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validar que los campos requeridos estén presentes
            required_fields = ['empleado', 'fecha', 'hora_entrada', 'hora_salida', 'estado']
            if not all(field in data for field in required_fields):
                return JsonResponse({'success': False, 'message': 'Faltan campos requeridos.'}, status=400)
            
            # Obtener el empleado
            try:
                empleado_obj = empleado.objects.get(cedula=data['empleado'])
            except empleado.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Empleado no encontrado.'}, status=404)

            # Verificar si ya existe una asistencia para este empleado en esta fecha
            if asistencias.objects.filter(empleado=empleado_obj, fecha=data['fecha']).exists():
                return JsonResponse({'success': False, 'message': 'Ya existe una asistencia registrada para este empleado en esta fecha.'}, status=400)
            
            # Crear la asistencia
            asistencia = asistencias.objects.create(
                empleado=empleado_obj,
                fecha=data['fecha'],
                hora_entrada=data['hora_entrada'],
                hora_salida=data['hora_salida'],
                estado=data['estado'],
                observaciones=data.get('notas', '')  # Campo opcional
            )
            
            return JsonResponse({'success': True, 'message': 'Asistencia registrada correctamente.'}, status=201)
        
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Datos JSON inválidos.'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    else:
        return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)
    
@csrf_exempt
@require_http_methods(["GET"])
def listar_asistencias(request):
    """API endpoint para listar asistencias filtradas por cedula, fecha de inicio y fecha final."""
    cedula = request.GET.get('cedula', '')
    fecha_inicio = request.GET.get('fecha_inicio', '')
    fecha_fin = request.GET.get('fecha_fin', '')

    asistencias_queryset = asistencias.objects.all()

    if cedula:
        asistencias_queryset = asistencias_queryset.filter(empleado__cedula=cedula)
    if fecha_inicio:
        try:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            asistencias_queryset = asistencias_queryset.filter(fecha__gte=fecha_inicio)
        except ValueError:
            return JsonResponse({'error': 'Formato de fecha de inicio inválido. Use YYYY-MM-DD.'}, status=400)
    if fecha_fin:
        try:
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
            asistencias_queryset = asistencias_queryset.filter(fecha__lte=fecha_fin)
        except ValueError:
            return JsonResponse({'error': 'Formato de fecha de fin inválido. Use YYYY-MM-DD.'}, status=400)

    asistencias_lista = []
    for asistencia in asistencias_queryset:
        asistencias_lista.append({
            'empleado': asistencia.empleado.cedula,
            'fecha': asistencia.fecha.strftime('%d-%m-%Y'),
            'hora_inicio': str(asistencia.hora_entrada),
            'hora_fin': str(asistencia.hora_salida),
            'estado': asistencia.estado,
            'observaciones': asistencia.observaciones,
        })

    return JsonResponse(asistencias_lista, safe=False)

@csrf_exempt
@require_http_methods(["GET"])
def get_faltas_justificables(request):
    try:
        cedula = request.GET.get('cedula')
        if not cedula:
            return JsonResponse({'error': 'Cédula del empleado es requerida'}, status=400)

        empleado_obj = empleado.objects.get(cedula=cedula)
        
        # Filtrar faltas no justificadas (que pueden ser justificadas)
        faltas = asistencias.objects.filter(
            empleado=empleado_obj,
            estado="F"  # Cambié a "F" (Falta) en lugar de "J" (Justificada)
        ).values('id', 'fecha', 'hora_entrada', 'hora_salida', 'observaciones')

        # Convertir el QuerySet a lista y retornar
        return JsonResponse(list(faltas), safe=False)
        
    except empleado.DoesNotExist:
        return JsonResponse({'error': 'Empleado no encontrado'}, status=404)
    except Exception as e:
        # Captura cualquier otro error inesperado
        return JsonResponse({'error': f'Error del servidor: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def listar_justificaciones(request):
    try:
        cedula = request.GET.get('cedula', '').strip()
        fecha_inicio = request.GET.get('fecha_inicio', '').strip()
        fecha_fin = request.GET.get('fecha_fin', '').strip()

        justificaciones_qs = Justificacion.objects.select_related(
            'asistencias__empleado',
            'aprobado_por'
        ).all()

        if cedula:
            justificaciones_qs = justificaciones_qs.filter(asistencias__empleado__cedula__icontains=cedula)

        if fecha_inicio:
            try:
                fecha_inicio_date = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
                justificaciones_qs = justificaciones_qs.filter(asistencias__fecha__gte=fecha_inicio_date)
            except ValueError:
                return JsonResponse({'error': 'Formato de fecha_inicio inválido. Use YYYY-MM-DD.'}, status=400)

        if fecha_fin:
            try:
                fecha_fin_date = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
                justificaciones_qs = justificaciones_qs.filter(asistencias__fecha__lte=fecha_fin_date)
            except ValueError:
                return JsonResponse({'error': 'Formato de fecha_fin inválido. Use YYYY-MM-DD.'}, status=400)

        justificaciones_list = []
        for justificacion in justificaciones_qs:
            aprobado_por_nombre = None
            if justificacion.aprobado_por:
                aprobado_por_nombre = f"{justificacion.aprobado_por.primer_nombre} {justificacion.aprobado_por.primer_apellido}".strip()

            justificaciones_list.append({
                'id': justificacion.id,
                'tipo': justificacion.get_tipo_display(),
                'descripcion': justificacion.descripcion,
                'fecha_creacion': justificacion.fecha_creacion.strftime('%d-%m-%Y %H:%M'),
                'aprobado_por': aprobado_por_nombre,
                'fecha_aprobacion': justificacion.fecha_aprobacion.strftime('%d-%m-%Y %H:%M') if justificacion.fecha_aprobacion else None,
                'documento_url': justificacion.documento.url if justificacion.documento else None,
                'empleado_cedula': justificacion.asistencias.empleado.cedula if justificacion.asistencias and justificacion.asistencias.empleado else None,
                'fecha_asistencia': justificacion.asistencias.fecha.strftime('%d-%m-%Y') if justificacion.asistencias and justificacion.asistencias.fecha else None,
            })

        return JsonResponse(justificaciones_list, safe=False)

    except Exception as e:
        logger.error(f"Error en listar_justificaciones: {str(e)}", exc_info=True)
        return JsonResponse({'error': 'Error interno del servidor', 'detail': str(e)}, status=500)

from django.utils.crypto import get_random_string

@csrf_exempt
@require_http_methods(["GET"])
def obtener_detalle_prenomina(request, prenomina_id):


    try:
        # Obtener la prenomina con sus detalles relacionados
        prenomina_obj = prenomina.objects.prefetch_related(
            'detalles__codigo',  # Prefetch para optimizar las consultas
        ).get(id_prenomina=prenomina_id)

        # Calcular el total de la prenomina
        total = prenomina_obj.detalles.aggregate(total=Sum('total_monto'))['total'] or 0

        # Preparar los datos de la prenomina
        prenomina_data = {
            'id_prenomina': prenomina_obj.id_prenomina,
            'periodo': prenomina_obj.nomina.periodo,
            'tipo': prenomina_obj.nomina.tipo_nomina.tipo_nomina,
            'secuencia': prenomina_obj.nomina.secuencia.nombre_secuencia,
            'fecha_creacion': prenomina_obj.fecha_creacion.strftime('%d/%m/%Y %H:%M'),
            'total': total,
        }

        # Preparar los datos de los detalles de la prenomina
        detalles_data = []
        for detalle in prenomina_obj.detalles.all():
            concepto = detalle.codigo  # Acceso al objeto concepto_pago relacionado

            # Contar personas con este concepto en la nómina asociada
            numero_personas = detalle_nomina.objects.filter(
                nomina=prenomina_obj.nomina,
                codigo=concepto
            ).values('cedula').distinct().count()

            detalles_data.append({
                'codigo': concepto.codigo,
                'descripcion': concepto.descripcion,
                'tipo_concepto': concepto.tipo_concepto,
                'nombre_nomina': concepto.nombre_nomina,
                'asignacion': str(detalle.total_monto) if concepto.tipo_concepto == 'ASIGNACION' else '0',
                'deduccion': str(detalle.total_monto) if concepto.tipo_concepto == 'DEDUCCION' else '0',
                'total_monto': str(detalle.total_monto),
                'numero_personas': numero_personas,  # Nuevo campo agregado
            })

        # Retornar la respuesta en formato JSON
        return JsonResponse({
            'success': True,
            'prenomina': prenomina_data,
            'detalles': detalles_data,
        })

    except prenomina.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'La prenomina no existe'
        }, status=404)
    except Exception as e:
        logger.error(f"Error en obtener_detalle_prenomina: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': 'Error al procesar la solicitud',
            'detail': str(e)
        }, status=500)

#   <-------CREAR CUENTA------->

# Formulario verificacion empleado
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
            usuario_instance = usuario.objects.get(email=email)  # Corregí el typo de 'sle' a 'get'
        except usuario.DoesNotExist:
            return JsonResponse({'status': 'error', 'error': 'Correo electrónico no registrado.'}, status=401)

        # Verificar contraseña
        if not check_password(contraseña, usuario_instance.contraseña_hash):
            return JsonResponse({'status': 'error', 'error': 'Contraseña incorrecta.'}, status=401)

        # Obtener el empleado asociado
        empleado_instance = usuario_instance.empleado

        # Guardar datos de sesión
        request.session['usuario_id'] = usuario_instance.id
        request.session['email'] = usuario_instance.email
        request.session['empleado_id'] = usuario_instance.empleado_id
        request.session.set_expiry(3600)  # 1 hora

        usuario_instance.ultimo_login = timezone.now()
        usuario_instance.save()

        # Obtener el nombre del rol como array para mantener compatibilidad con el frontend
        rol_nombre = [usuario_instance.rol.nombre_rol] if usuario_instance.rol else ['Sin rol asignado']

        # Información del usuario para enviar al frontend
        usuario_info = {
            'nombre': empleado_instance.primer_nombre,
            'apellido': empleado_instance.primer_apellido,
            'cedula': empleado_instance.cedula,
            'cargo': str(empleado_instance.cargo) if empleado_instance.cargo else 'N/A',
            'roles': rol_nombre,  # Ahora es un array
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
        traceback.print_exc()
        return JsonResponse({'status': 'error', 'error': str(e)}, status=500)
#          <-------LOGIN_TERMINADO------->


from django.contrib.auth import logout
from django.views.decorators.http import require_POST
from django.http import JsonResponse

@require_POST
def logout_empleado(request):
    try:
        # Limpiar la sesión
        logout(request)  # Esto elimina la sesión de autenticación
        request.session.flush()  # Limpia todos los datos de la sesión
        
        return JsonResponse({
            'status': 'success',
            'message': 'Sesión cerrada correctamente',
            'redirect_url': '/login/'  # Redirige a la página de login
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'error': str(e)
        }, status=500)

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

@csrf_exempt
@require_http_methods(["POST"])
def crear_justificacion(request):
    if request.method == 'POST':
        try:
            # Obtener datos del formulario (usando los nombres correctos)
            falta_id = request.POST.get('falta')
            tipo = request.POST.get('tipo')  # Nombre correcto del select
            descripcion = request.POST.get('motivo')  # Nombre correcto del textarea
            documento = request.FILES.get('documento')

            # Validación modificada (el documento es opcional)
            if not all([falta_id, tipo]):
                return JsonResponse({
                    'success': False, 
                    'message': 'Falta ID y Tipo son campos requeridos.'
                }, status=400)

            # Obtener la asistencia
            try:
                asistencia_obj = asistencias.objects.get(pk=falta_id)
            except asistencias.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Asistencia no encontrada.'
                }, status=404)

            # Actualizar la asistencia
            asistencia_obj.estado = "J"
            if descripcion:
                asistencia_obj.observaciones = descripcion
            asistencia_obj.save()

            # Crear la justificación
            justificacion = Justificacion.objects.create(
                asistencias=asistencia_obj,
                tipo=tipo,
                descripcion=descripcion or "",  # Asegurar que no sea None
                documento=documento
            )

            return JsonResponse({
                'success': True,
                'message': 'Justificación registrada correctamente',
                'justificacion_id': justificacion.id
            }, status=201)

        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error del servidor: {str(e)}'
            }, status=500)
        
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



#   /////////////// Importar nominas al panel ///////////////

@require_http_methods(["GET"])
def listar_nominas(request):
    """API para listar nóminas con filtros mejorados"""
    try:
        # 1. Obtener y validar parámetros de filtrado
        tipo = request.GET.get('tipo', '').strip()
        mes = request.GET.get('mes', '').strip()
        anio = request.GET.get('anio', '').strip()
        orden = request.GET.get('orden', '-fecha_carga')
        
        # 2. Construir consulta base con select_related para optimización
        queryset = nomina.objects.select_related('tipo_nomina', 'secuencia').all()
        
        # 3. Aplicar filtros con condiciones más precisas
        filters = Q()
        
        if tipo:
            filters &= Q(tipo_nomina__tipo_nomina__icontains=tipo)
        
        if mes:
            # Asume que periodo tiene formato "MM-YYYY" o similar
            if len(mes) == 1:
                mes = f'0{mes}'  # Normalizar a dos dígitos
            filters &= Q(periodo__contains=f'-{mes}-') | Q(periodo__startswith=f'{mes}-')
        
        if anio:
            # Busca año al inicio (2023-), en medio (-2023-) o al final (-2023)
            filters &= Q(periodo__contains=anio)
        
        queryset = queryset.filter(filters)
        
        # 4. Validar y aplicar ordenamiento
        campos_orden_validos = [
            '-fecha_carga', 'fecha_carga',
            'tipo_nomina__tipo_nomina', '-tipo_nomina__tipo_nomina',
            '-fecha_cierre', 'fecha_cierre'
        ]
        
        if orden not in campos_orden_validos:
            orden = '-fecha_carga'
            
        queryset = queryset.order_by(orden)
        
        # 5. Paginación con manejo de errores
        page_number = request.GET.get('page', 1)
        paginator = Paginator(queryset, 25)  # 25 items por página
        
        try:
            nominas_paginadas = paginator.page(page_number)
        except:
            nominas_paginadas = paginator.page(1)  # Fallback a primera página
        
        # 6. Preparar datos para respuesta con manejo de valores nulos
        nominas_data = []
        for nom in nominas_paginadas:
            nominas_data.append({
                'id_nomina': nom.id_nomina,
                'tipo_nomina': nom.tipo_nomina.tipo_nomina if nom.tipo_nomina else '',
                'periodo': nom.periodo,
                'secuencia': nom.secuencia.nombre_secuencia if nom.secuencia else '',
                'fecha_cierre': nom.fecha_cierre.strftime('%d/%m/%Y') if nom.fecha_cierre else '',
                'fecha_carga': nom.fecha_carga.strftime('%d/%m/%Y %H:%M') if nom.fecha_carga else '',
                'total_empleados': detalle_nomina.objects.filter(nomina=nom).values('cedula').distinct().count(),
                'total_conceptos': detalle_nomina.objects.filter(nomina=nom).count()
            })
        
        # 7. Retornar respuesta estructurada
        return JsonResponse({
            'success': True,
            'nominas': nominas_data,
            'total': paginator.count,
            'paginas': paginator.num_pages,
            'actual': nominas_paginadas.number,
            'params': {  # Para debugging
                'tipo': tipo,
                'mes': mes,
                'anio': anio,
                'orden': orden
            }
        })
        
    except Exception as e:
        logger.error(f"Error en listar_nominas: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': 'Error al procesar la solicitud',
            'detail': str(e)
        }, status=500)

from django.contrib.auth.decorators import login_required
from django.db.models import Sum

logger = logging.getLogger(__name__)

@csrf_exempt
@transaction.atomic
@require_http_methods(["GET"])
def listar_prenominas(request):
    """API para listar prenominas con filtros mejorados"""
    try:
        # 1. Obtener y validar parámetros de filtrado
        tipo = request.GET.get('tipo', '').strip()
        mes = request.GET.get('mes', '').strip()
        anio = request.GET.get('anio', '').strip()
        orden = request.GET.get('orden', '-fecha_creacion')
        
        # 2. Construir consulta base con select_related para optimización
        queryset = prenomina.objects.select_related('nomina', 'nomina__tipo_nomina', 'nomina__secuencia').all()
        
        # 3. Aplicar filtros con condiciones más precisas
        filters = Q()
        
        if tipo:
            filters &= Q(nomina__tipo_nomina__tipo_nomina__icontains=tipo)
        
        if mes:
            # Asume que periodo tiene formato "MM-YYYY" o similar
            if len(mes) == 1:
                mes = f'0{mes}'  # Normalizar a dos dígitos
            filters &= Q(nomina__periodo__contains=f'-{mes}-') | Q(nomina__periodo__startswith=f'{mes}-')
        
        if anio:
            # Busca año al inicio (2023-), en medio (-2023-) o al final (-2023)
            filters &= Q(nomina__periodo__contains=anio)
        
        queryset = queryset.filter(filters)
        
        # 4. Validar y aplicar ordenamiento
        campos_orden_validos = [
            '-fecha_creacion', 'fecha_creacion',
            'nomina__tipo_nomina__tipo_nomina', '-nomina__tipo_nomina__tipo_nomina',
            '-nomina__fecha_cierre', 'nomina__fecha_cierre'
        ]
        
        if orden not in campos_orden_validos:
            orden = '-fecha_creacion'
            
        queryset = queryset.order_by(orden)
        
        # 5. Paginación con manejo de errores
        page_number = request.GET.get('page', 1)
        paginator = Paginator(queryset, 25)  # 25 items por página
        
        try:
            prenominas_paginadas = paginator.page(page_number)
        except:
            prenominas_paginadas = paginator.page(1)  # Fallback a primera página
        
        # 6. Preparar datos para respuesta con manejo de valores nulos
        prenominas_data = []
        for prenomina_obj in prenominas_paginadas:
            # Calcular el total de la prenomina
            total = prenomina_obj.detalles.aggregate(total=Sum('total_monto'))['total'] or 0
            
            prenominas_data.append({
                'id_prenomina': prenomina_obj.id_prenomina,
                'tipo_nomina': prenomina_obj.nomina.tipo_nomina.tipo_nomina if prenomina_obj.nomina.tipo_nomina else '',
                'periodo': prenomina_obj.nomina.periodo if prenomina_obj.nomina else '',
                'secuencia': prenomina_obj.nomina.secuencia.nombre_secuencia if prenomina_obj.nomina.secuencia else '',
                'fecha_cierre': prenomina_obj.nomina.fecha_cierre.strftime('%d/%m/%Y') if prenomina_obj.nomina.fecha_cierre else '',
                'fecha_creacion': prenomina_obj.fecha_creacion.strftime('%d/%m/%Y %H:%M') if prenomina_obj.fecha_creacion else '',
                'total': total
            })
        
        # 7. Retornar respuesta estructurada
        return JsonResponse({
            'success': True,
            'prenominas': prenominas_data,
            'total': paginator.count,
            'paginas': paginator.num_pages,
            'actual': prenominas_paginadas.number,
            'params': {  # Para debugging
                'tipo': tipo,
                'mes': mes,
                'anio': anio,
                'orden': orden
            }
        })
        
    except Exception as e:
        logger.error(f"Error en listar_prenominas: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': 'Error al procesar la solicitud',
            'detail': str(e)
        }, status=500)

@csrf_exempt
@transaction.atomic
def eliminar_nomina(request, pk):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            if data.get('action') == 'delete':
                # Intenta obtener y eliminar la nómina
                try:
                    nomina_obj = nomina.objects.get(id_nomina=pk)
                    
                    # Eliminación en cascada
                    detalle_recibo.objects.filter(detalle_nomina__nomina=nomina_obj).delete()
                    recibo_pago.objects.filter(nomina=nomina_obj).delete()
                    
                    try:
                        prenomina_obj = prenomina.objects.get(nomina=nomina_obj)
                        detalle_prenomina.objects.filter(prenomina=prenomina_obj).delete()
                        prenomina_obj.delete()
                    except prenomina.DoesNotExist:
                        pass
                        
                    detalle_nomina.objects.filter(nomina=nomina_obj).delete()
                    nomina_obj.delete()
                    
                    return JsonResponse({
                        'status': 'success',
                        'message': 'Nómina eliminada correctamente'
                    }, status=200)
                
                except nomina.DoesNotExist:
                    # Si la nómina no existe, considerarlo como éxito (quizás ya fue eliminada)
                    return JsonResponse({
                        'status': 'success',
                        'message': 'La nómina ya no existe (posiblemente eliminada)'
                    }, status=200)
                    
        except Exception as e:
            return JsonResponse({
                'error': str(e),
                'details': 'Error al procesar la solicitud'
            }, status=500)
    
    return JsonResponse({
        'error': 'Método no permitido'
    }, status=405)

#   /////////////// Importar empleados al panel ///////////////

@require_http_methods(["GET"])
def listar_empleados(request):
    """API para listar empleados con todos los campos requeridos"""
    try:
        # 1. Obtener y validar parámetros de filtrado
        cedula = request.GET.get('cedula', '').strip()
        nombre = request.GET.get('nombre', '').strip()
        apellido = request.GET.get('apellido', '').strip()
        cargo = request.GET.get('cargo', '').strip()
        tipo_trabajador = request.GET.get('tipo_trabajador', '').strip()
        status = request.GET.get('status', '').strip()
        orden = request.GET.get('orden', '-fecha_ingreso')
        
        # 2. Construir consulta base optimizada
        queryset = empleado.objects.select_related(
            'cargo',
            'cargo__familia',
            'cargo__nivel',
            'tipo_trabajador'
        ).prefetch_related(
            'cuentas_bancarias',
            'cuentas_bancarias__banco'
        ).all()
        
        # 3. Aplicar filtros
        filters = Q()
        
        if cedula:
            filters &= Q(cedula__icontains=cedula)
        
        if nombre:
            filters &=  (Q(primer_nombre__icontains=nombre) | 
                        Q(segundo_nombre__icontains=nombre))
        
        if apellido:
            filters &=  (Q(primer_apellido__icontains=apellido) | 
                        Q(segundo_apellido__icontains=apellido))
        
        if cargo:
            # Buscar en familia.nombre o nivel.nivel
            filters &=  (Q(cargo__familia__nombre__icontains=cargo) |
                        Q(cargo__nivel__nivel__icontains=cargo))
        
        if tipo_trabajador:
            filters &= Q(tipo_trabajador__descripcion__icontains=tipo_trabajador)
        
        if status:
            if status.lower() == 'true':
                filters &= Q(status=True)
            elif status.lower() == 'false':
                filters &= Q(status=False)
        
        queryset = queryset.filter(filters)
        
        # 4. Validar y aplicar ordenamiento
        campos_orden_validos = [
            '-fecha_ingreso', 'fecha_ingreso',
            'primer_apellido', '-primer_apellido',
            'cargo__familia__nombre', '-cargo__familia__nombre',
            'cargo__nivel__orden_jerarquico', '-cargo__nivel__orden_jerarquico',
            'cedula', '-cedula',
            'fecha_nacimiento', '-fecha_nacimiento'
        ]
        
        if orden not in campos_orden_validos:
            orden = '-fecha_ingreso'
            
        queryset = queryset.order_by(orden)
        
        # 5. Paginación
        page_number = request.GET.get('page', 1)
        paginator = Paginator(queryset, 25)  # 25 items por página
        
        try:
            empleados_paginados = paginator.page(page_number)
        except:
            empleados_paginados = paginator.page(1)
        
        # 6. Preparar datos con TODOS los campos requeridos
        empleados_data = []
        for emp in empleados_paginados:
            # Formatear cuentas bancarias
            cuentas_info = []
            for cuenta in emp.cuentas_bancarias.all():
                if cuenta.activa:
                    cuentas_info.append(
                        f"{cuenta.banco.nombre} ({cuenta.get_tipo_display()}): {cuenta.numero_cuenta}"
                    )
            
            # Obtener nombre del cargo (familia + nivel)
            nombre_cargo = ""
            if emp.cargo:
                nombre_cargo = f"{emp.cargo.familia.nombre} - Nivel {emp.cargo.nivel.nivel}"
            
            empleados_data.append({
                # Identificación
                'tipo_id': emp.get_tipo_identificacion_display(),
                'cedula': emp.cedula,
                
                # Nombres
                'nombre_completo': f"{emp.primer_nombre} {emp.segundo_nombre or ''} {emp.primer_apellido} {emp.segundo_apellido or ''}".strip(),
                
                # Datos personales
                'fecha_nacimiento': emp.fecha_nacimiento.strftime('%d/%m/%Y') if emp.fecha_nacimiento else '',
                'lugar_nacimiento': emp.lugar_nacimiento or '',
                'genero': emp.get_genero_display() if emp.genero else '',
                'estado_civil': emp.get_estado_civil_display() if emp.estado_civil else '',
                
                # Datos laborales
                'fecha_ingreso': emp.fecha_ingreso.strftime('%d/%m/%Y') if emp.fecha_ingreso else '',
                'cargo': nombre_cargo,  # Usamos la combinación familia + nivel
                'tipo_trabajador': emp.tipo_trabajador.descripcion if emp.tipo_trabajador else '',
                'grado_instruccion': emp.grado_instruccion or '',
                
                # Contacto
                'telefono_principal': emp.telefono_principal or '',
                'telefono_secundario': emp.telefono_secundario or '',
                'email': emp.email or '',
                'direccion': emp.direccion or '',
                
                # Datos familiares
                'hijos': emp.hijos,
                'conyuge': 'Sí' if emp.conyuge else 'No',
                
                # Información adicional
                'rif': emp.rif or '',
                
                # Cuentas bancarias (formateadas como texto)
                'cuentas_bancarias': "\n".join(cuentas_info) if cuentas_info else 'Sin cuentas activas',
                
                # Estado
                'status': 'Activo' if emp.status else 'Inactivo',
                
                # ID para acciones
                'id': emp.cedula
            })
        
        # 7. Retornar respuesta
        return JsonResponse({
            'success': True,
            'empleados': empleados_data,
            'total': paginator.count,
            'paginas': paginator.num_pages,
            'actual': empleados_paginados.number,
            'params': {
                'cedula': cedula,
                'nombre': nombre,
                'apellido': apellido,
                'cargo': cargo,
                'tipo_trabajador': tipo_trabajador,
                'status': status,
                'orden': orden
            }
        })
        
    except Exception as e:
        logger.error(f"Error en listar_empleados: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': 'Error al procesar la solicitud',
            'detail': str(e)
        }, status=500)
    

from django.core.exceptions import ValidationError
from django.db import IntegrityError

def empleado_view(request):
    """
    Vista para renderizar el formulario de creación de empleados
    """
    tipos_trabajador = tipo_trabajador.objects.all().order_by('descripcion')
    cargos_completos = cargo.objects.select_related('familia', 'nivel').filter(activo=True).order_by('familia__nombre', 'nivel__orden_jerarquico')
    bancos = banco.objects.all().order_by('nombre')

    context = {
        'tipos_trabajador': tipos_trabajador,
        'cargos_completos': cargos_completos,
        'bancos': bancos
    }
    
    return render(request, 'empleados/crear_empleado.html', context)

@csrf_exempt
@transaction.atomic
def api_empleadoss(request):
    """
    API para crear nuevos empleados usando cargos existentes
    """
    if request.method == 'POST':
        try:
            # Parsear y validar JSON
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({
                    'success': False,
                    'error': 'Formato JSON inválido'
                }, status=400)

            # Validar campos requeridos
            required_fields = [
                'tipo_identificacion', 'cedula', 'primer_nombre',
                'primer_apellido', 'fecha_ingreso', 'tipo_trabajador',
                'cargo_id'
            ]
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return JsonResponse({
                    'success': False,
                    'error': f'Campos requeridos faltantes: {", ".join(missing_fields)}'
                }, status=400)

            # Convertir tipos de datos
            try:
                data['cedula'] = int(data['cedula'])
                data['tipo_trabajador'] = int(data['tipo_trabajador'])
                data['cargo_id'] = int(data['cargo_id'])
                data['hijos'] = int(data.get('hijos', 0))
                
                # Formatear fechas
                fecha_nacimiento = datetime.strptime(data.get('fecha_nacimiento'), '%Y-%m-%d').date() if data.get('fecha_nacimiento') else None
                fecha_ingreso = datetime.strptime(data['fecha_ingreso'], '%Y-%m-%d').date()
            except ValueError as e:
                return JsonResponse({
                    'success': False,
                    'error': 'Error en tipos de datos',
                    'detail': str(e)
                }, status=400)

            # Verificar existencia de relaciones
            if not tipo_trabajador.objects.filter(codigo_trabajador=data['tipo_trabajador']).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'El tipo de trabajador especificado no existe'
                }, status=400)

            # Obtener el cargo existente
            try:
                cargo_obj = cargo.objects.get(id=data['cargo_id'])
                
                # Verificar que el cargo corresponda al tipo de trabajador
                if cargo_obj.familia.tipo_trabajador.codigo_trabajador != data['tipo_trabajador']:
                    return JsonResponse({
                        'success': False,
                        'error': 'El cargo no corresponde al tipo de trabajador seleccionado'
                    }, status=400)
                
                # Activar el cargo si estaba inactivo
                if not cargo_obj.activo:
                    cargo_obj.activo = True
                    cargo_obj.save()
                    
            except cargo.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': 'El cargo especificado no existe'
                }, status=400)

            # Verificar unicidad de cédula y email
            if empleado.objects.filter(cedula=data['cedula']).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'Ya existe un empleado con esta cédula'
                }, status=400)

            if data.get('email') and empleado.objects.filter(email=data['email']).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'El email ya está registrado'
                }, status=400)

            # Crear empleado
            empleado_data = {
                'tipo_identificacion': data['tipo_identificacion'],
                'cedula': data['cedula'],
                'rif': data.get('rif'),
                'primer_nombre': data['primer_nombre'],
                'segundo_nombre': data.get('segundo_nombre'),
                'primer_apellido': data['primer_apellido'],
                'segundo_apellido': data.get('segundo_apellido'),
                'fecha_nacimiento': fecha_nacimiento,
                'lugar_nacimiento': data.get('lugar_nacimiento'),
                'genero': data.get('genero'),
                'estado_civil': data.get('estado_civil'),
                'grado_instruccion': data.get('grado_instruccion'),
                'fecha_ingreso': fecha_ingreso,
                'tipo_trabajador_id': data['tipo_trabajador'],
                'cargo': cargo_obj,
                'telefono_principal': data.get('telefono_principal'),
                'telefono_secundario': data.get('telefono_secundario'),
                'email': data.get('email'),
                'direccion': data.get('direccion'),
                'hijos': data['hijos'],
                'conyuge': bool(data.get('conyuge', False)),
                'status': True
            }

            nuevo_empleado = empleado.objects.create(**empleado_data)

            # Crear cuenta bancaria si se proporcionan los datos
            if all(k in data for k in ['banco', 'tipo_cuenta', 'numero_cuenta']):
                if not banco.objects.filter(codigo=data['banco']).exists():
                    return JsonResponse({
                        'success': False,
                        'error': f"Banco con código {data['banco']} no existe"
                    }, status=400)

                try:
                    cuenta_bancaria.objects.create(
                        empleado=nuevo_empleado,
                        banco_id=data['banco'],
                        tipo=data['tipo_cuenta'],
                        numero_cuenta=data['numero_cuenta'],
                        activa=True
                    )
                except IntegrityError:
                    return JsonResponse({
                        'success': False,
                        'error': 'El número de cuenta ya existe'
                    }, status=400)

            return JsonResponse({
                'success': True,
                'message': 'Empleado creado correctamente',
                'empleado_id': nuevo_empleado.cedula,
                'nombre_completo': f"{nuevo_empleado.primer_nombre} {nuevo_empleado.primer_apellido}"
            })

        except ValidationError as e:
            return JsonResponse({
                'success': False,
                'error': 'Error de validación',
                'detail': str(e)
            }, status=400)
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': 'Error interno del servidor',
                'detail': str(e)
            }, status=500)
    
    return JsonResponse({
        'error': 'Método no permitido'
    }, status=405)

def api_cargos_por_tipo(request):
    """
    API para obtener cargos filtrados por tipo de trabajador
    """
    tipo_trabajador_id = request.GET.get('tipo_trabajador')
    
    if not tipo_trabajador_id:
        return JsonResponse([], safe=False)
    
    try:
        cargos = cargo.objects.filter(
            familia__tipo_trabajador_id=tipo_trabajador_id,
            activo=True
        ).select_related('familia', 'nivel').order_by('familia__nombre', 'nivel__orden_jerarquico')
        
        cargos_data = [{
            'id': c.id,
            'familia_nombre': c.familia.nombre,
            'nivel_nombre': c.nivel.nombre,
            'codigo': f"{c.familia.nombre} - {c.nivel.nombre}"
        } for c in cargos]
        
        return JsonResponse(cargos_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

    from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
@require_http_methods(["DELETE"])
@csrf_exempt
def eliminar_empleado(request, pk):
    if request.method == 'DELETE':
        try:
            # Buscar el empleado a eliminar (usando minúsculas como está definido)
            empleado_obj = empleado.objects.get(pk=pk)
            
            # Eliminar primero las cuentas bancarias asociadas
            cuenta_bancaria.objects.filter(empleado=empleado_obj).delete()
            
            # Eliminar el empleado
            empleado_obj.delete()
            
            # Respuesta de éxito
            return JsonResponse({
                'message': 'Empleado y cuentas bancarias asociadas eliminadas correctamente',
                'status': 'success'
            }, status=200)
            
        except empleado.DoesNotExist:
            return JsonResponse({
                'error': 'El empleado no existe',
                'status': 'error'
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'error': str(e),
                'status': 'error'
            }, status=500)
        

#   /////////////// Panel de roles ///////////////

@require_http_methods(["GET"])
def listar_usuarios(request):
    """API para listar usuarios con sus roles y filtros"""
    try:
        # 1. Obtener parámetros
        nombre = request.GET.get('nombre', '').strip()
        email = request.GET.get('email', '').strip()
        rol_filter = request.GET.get('rol', '').strip()
        estado = request.GET.get('estado', '').strip()
        orden = request.GET.get('orden', '-fecha_registro')
        page = request.GET.get('page', 1)
        
        # 2. Construir consulta base
        queryset = usuario.objects.select_related('empleado', 'rol').all()
        
        # 3. Aplicar filtros
        if nombre:
            queryset = queryset.filter(
                Q(empleado__primer_nombre__icontains=nombre) |
                Q(empleado__primer_apellido__icontains=nombre)
            )
        if email:
            queryset = queryset.filter(email__icontains=email)
        if rol_filter:
            queryset = queryset.filter(rol__nombre_rol__icontains=rol_filter)
        if estado:
            queryset = queryset.filter(activo=(estado.lower() == 'activo'))
        
        # 4. Ordenamiento
        orden_validos = ['-fecha_registro', 'fecha_registro', 'empleado__primer_nombre', 
                        '-empleado__primer_nombre', 'email', '-email', 'rol__nombre_rol', 
                        '-rol__nombre_rol', '-ultimo_login', 'ultimo_login']
        orden = orden if orden in orden_validos else '-fecha_registro'
        queryset = queryset.order_by(orden)
        
        # 5. Paginación
        paginator = Paginator(queryset, 25)
        try:
            usuarios_paginados = paginator.page(page)
        except:
            usuarios_paginados = paginator.page(1)
        
        # 6. Preparar respuesta (versión simplificada)
        usuarios_data = []
        for user in usuarios_paginados:
            empleado_nombre = 'Sin nombre'
            if hasattr(user, 'empleado') and user.empleado:
                empleado_nombre = f"{user.empleado.primer_nombre or ''} {user.empleado.primer_apellido or ''}".strip()
            
            usuarios_data.append({
                'id': user.id,
                'nombre': empleado_nombre if empleado_nombre else 'Sin nombre',
                'email': user.email,
                'rol': {
                    'codigo': user.rol.codigo_rol if user.rol else None,
                    'nombre': user.rol.nombre_rol if user.rol else 'Sin rol'
                },
                'activo': user.activo,
                'ultimo_login': user.ultimo_login.strftime('%d/%m/%Y %H:%M') if user.ultimo_login else 'Nunca',
                'fecha_registro': user.fecha_registro.strftime('%d/%m/%Y %H:%M') if user.fecha_registro else ''
            })
        
        return JsonResponse({
            'success': True,
            'usuarios': usuarios_data,
            'total': paginator.count,
            'paginas': paginator.num_pages,
            'actual': usuarios_paginados.number
        })
        
    except Exception as e:
        logger.error(f"Error en listar_usuarios: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': 'Error al procesar la solicitud',
            'detail': str(e)
        }, status=500)
    

logger = logging.getLogger(__name__)

@csrf_exempt  # Solo si necesitas desactivar CSRF temporalmente para pruebas
@require_http_methods(["GET", "PUT", "DELETE"])
def manejar_usuario(request, usuario_id):
    """API para ver, editar o eliminar un usuario específico"""
    try:
        # Obtener el usuario
        try:
            user = usuario.objects.select_related('empleado', 'rol').get(pk=usuario_id)
        except usuario.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Usuario no encontrado'
            }, status=404)

        if request.method == 'GET':
            # Obtener datos del usuario
            empleado_nombre = 'Sin nombre'
            if hasattr(user, 'empleado') and user.empleado:
                empleado_nombre = f"{user.empleado.primer_nombre or ''} {user.empleado.primer_apellido or ''}".strip()
            
            # Manejo seguro del rol
            rol_data = None
            if user.rol:
                rol_data = {
                    'codigo': getattr(user.rol, 'codigo_rol', None),
                    'nombre': getattr(user.rol, 'nombre_rol', 'Sin rol'),
                    'id': user.rol.pk  # Usamos pk en lugar de id para mayor seguridad
                }
            else:
                rol_data = {
                    'codigo': None,
                    'nombre': 'Sin rol',
                    'id': None
                }
            
            # Formateo seguro de fechas
            def format_date(date):
                if date and isinstance(date, datetime):
                    return date.strftime('%d/%m/%Y %H:%M')
                return None
            
            usuario_data = {
                'id': user.id,
                'nombre': empleado_nombre if empleado_nombre else 'Sin nombre',
                'email': user.email,
                'rol': rol_data,
                'activo': user.activo,
                'ultimo_login': format_date(getattr(user, 'ultimo_login', None)) or 'Nunca',
                'fecha_registro': format_date(getattr(user, 'fecha_registro', None)) or ''
            }
            
            return JsonResponse({
                'success': True,
                'usuario': usuario_data
            })

        elif request.method == 'PUT':
            # Editar usuario
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({
                    'success': False,
                    'error': 'Formato JSON inválido'
                }, status=400)
            
            # Validar datos esenciales
            if 'email' not in data:
                return JsonResponse({
                    'success': False,
                    'error': 'El email es requerido'
                }, status=400)
            
            # Actualizar campos
            user.email = data['email']
            
            if 'rol' in data and data['rol'] is not None:
                try:
                    # Si viene como objeto {id: X} o directamente como número
                    rol_id = data['rol']['id'] if isinstance(data['rol'], dict) else data['rol']
                    nuevo_rol = rol.objects.get(pk=rol_id)
                    user.rol = nuevo_rol
                except (rol.DoesNotExist, KeyError, TypeError):
                    return JsonResponse({
                        'success': False,
                        'error': 'Rol no válido'
                    }, status=400)
            else:
                # Opcional: quitar rol si no viene en los datos
                user.rol = None
            
            if 'activo' in data:
                user.activo = bool(data['activo'])
            
            try:
                user.save()
                return JsonResponse({
                    'success': True,
                    'message': 'Usuario actualizado correctamente'
                })
            except Exception as e:
                return JsonResponse({
                    'success': False,
                    'error': 'Error al guardar usuario',
                    'detail': str(e)
                }, status=400)

        elif request.method == 'DELETE':
            # Eliminar usuario
            try:
                user.delete()
                return JsonResponse({
                    'success': True,
                    'message': 'Usuario eliminado correctamente'
                })
            except Exception as e:
                logger.error(f"Error eliminando usuario: {str(e)}", exc_info=True)
                return JsonResponse({
                    'success': False,
                    'error': 'Error al eliminar usuario',
                    'detail': str(e)
                }, status=500)

    except Exception as e:
        logger.error(f"Error en manejar_usuario: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': 'Error al procesar la solicitud',
            'detail': str(e)
        }, status=500)
    
@require_http_methods(["GET"])
def listar_roles(request):
    """API para listar todos los roles disponibles con permisos y cantidad de usuarios"""
    try:
        roles = rol.objects.all().order_by('nombre_rol')
        roles_data = []
        for r in roles:
            permisos_qs = permiso.objects.filter(rol_permisos__rol=r)
            permisos_list = list(permisos_qs.values('codigo', 'nombre', 'descripcion'))
            usuarios_count = usuario.objects.filter(rol=r).count()
            roles_data.append({
                'codigo_rol': r.codigo_rol,
                'nombre_rol': r.nombre_rol,
                'descripcion': r.descripcion,
                'permisos': permisos_list,
                'usuarios_count': usuarios_count,
            })
        
        return JsonResponse({
            'success': True,
            'roles': roles_data
        })
        
    except Exception as e:
        logger.error(f"Error en listar_roles: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': 'Error al obtener los roles',
            'detail': str(e)
        }, status=500)

@require_http_methods(["GET"])
def obtener_rol(request, codigo_rol):
    """API para obtener los datos de un rol específico por su código"""
    try:
        rol_obj = rol.objects.get(codigo_rol=codigo_rol)
        permisos_qs = permiso.objects.filter(rol_permisos__rol=rol_obj)
        permisos_list = list(permisos_qs.values('codigo', 'nombre', 'descripcion'))
        usuarios_count = usuario.objects.filter(rol=rol_obj).count()
        rol_data = {
            'codigo_rol': rol_obj.codigo_rol,
            'nombre_rol': rol_obj.nombre_rol,
            'descripcion': rol_obj.descripcion,
            'permisos': permisos_list,
            'usuarios_count': usuarios_count,
        }
        return JsonResponse({
            'success': True,
            'rol': rol_data
        })
    except rol.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Rol no encontrado'
        }, status=404)
    except Exception as e:
        logger.error(f"Error en obtener_rol: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': 'Error al obtener el rol',
            'detail': str(e)
        }, status=500)

@require_http_methods(["GET"])
def listar_permisos(request):
    """API para listar todos los permisos disponibles"""
    try:
        permisos = permiso.objects.all().order_by('nombre')
        permisos_data = list(permisos.values('codigo', 'nombre', 'descripcion'))
        return JsonResponse({
            'success': True,
            'permisos': permisos_data
        })
    except Exception as e:
        logger.error(f"Error en listar_permisos: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': 'Error al obtener los permisos',
            'detail': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def crear_roles_api(request):
    """API para crear roles"""
    try:
        # Crear nuevo rol
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Formato JSON inválido'
            }, status=400)
        
        # Validar campos requeridos
        required_fields = ['nombre', 'codigo']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return JsonResponse({
                'success': False,
                'error': f'Campos requeridos: {", ".join(missing_fields)}'
            }, status=400)
        
        # Verificar que el código no exista
        if rol.objects.filter(codigo_rol=data['codigo']).exists():
            return JsonResponse({
                'success': False,
                'error': 'Ya existe un rol con este código'
            }, status=400)
        
        # Crear el rol
        nuevo_rol = rol.objects.create(
            codigo_rol=data['codigo'],
            nombre_rol=data['nombre'],
            descripcion=data.get('descripcion', '')
        )
        
        # Asignar permisos si se proporcionan
        if 'permisos' in data and data['permisos']:
            from .models import rol_permisos
            for permiso_codigo in data['permisos']:
                try:
                    permiso_obj = permiso.objects.get(codigo=permiso_codigo)
                    rol_permisos.objects.create(
                        rol=nuevo_rol,
                        permiso=permiso_obj
                    )
                except permiso.DoesNotExist:
                    continue
        
        return JsonResponse({
            'success': True,
            'message': 'Rol creado exitosamente',
            'rol_id': nuevo_rol.codigo_rol
        })
    
    except Exception as e:
        logger.error(f"Error en crear_roles_api: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': 'Error al procesar la solicitud',
            'detail': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def actualizar_roles(request, rol_id):
    """API para actualizar roles"""
    try:
        # Actualizar rol existente
        if not rol_id:
            return JsonResponse({
                'success': False,
                'error': 'ID de rol requerido'
            }, status=400)
        
        try:
            rol_obj = rol.objects.get(codigo_rol=rol_id)
        except rol.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Rol no encontrado'
            }, status=404)
        
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Formato JSON inválido'
            }, status=400)
        
        # Actualizar campos
        if 'nombre' in data:
            rol_obj.nombre_rol = data['nombre']
        if 'descripcion' in data:
            rol_obj.descripcion = data['descripcion']
        
        rol_obj.save()
        
        # Actualizar permisos si se proporcionan
        if 'permisos' in data:
            from .models import rol_permisos
            # Eliminar permisos existentes
            rol_permisos.objects.filter(rol=rol_obj).delete()
            
            # Agregar nuevos permisos
            for permiso_codigo in data['permisos']:
                try:
                    permiso_obj = permiso.objects.get(codigo=permiso_codigo)
                    rol_permisos.objects.create(
                        rol=rol_obj,
                        permiso=permiso_obj
                    )
                except permiso.DoesNotExist:
                    continue
        
        return JsonResponse({
            'success': True,
            'message': 'Rol actualizado exitosamente'
        })
    
    except Exception as e:
        logger.error(f"Error en actualizar_roles: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': 'Error al procesar la solicitud',
            'detail': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def eliminar_roles(request, rol_id):
    """API para eliminar roles"""
    try:
        # Eliminar rol
        if not rol_id:
            return JsonResponse({
                'success': False,
                'error': 'ID de rol requerido'
            }, status=400)
        
        try:
            rol_obj = rol.objects.get(codigo_rol=rol_id)
        except rol.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Rol no encontrado'
            }, status=404)
        
        # Verificar si hay usuarios asignados a este rol
        usuarios_con_rol = usuario.objects.filter(rol=rol_obj).count()
        if usuarios_con_rol > 0:
            return JsonResponse({
                'success': False,
                'error': f'No se puede eliminar el rol. Hay {usuarios_con_rol} usuario(s) asignado(s) a este rol.'
            }, status=400)
        
        # Eliminar permisos asociados
        from .models import rol_permisos
        rol_permisos.objects.filter(rol=rol_obj).delete()
        
        # Eliminar el rol
        rol_obj.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Rol eliminado exitosamente'
        })
    
    except Exception as e:
        logger.error(f"Error en eliminar_roles: {str(e)}", exc_info=True)
        return JsonResponse({
            'success': False,
            'error': 'Error al procesar la solicitud',
            'detail': str(e)
        }, status=500)

from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.contrib.auth import get_user_model
@require_GET
def get_current_user_info(request):
    # Forzar un usuario de prueba (SOLO PARA DEBUG!)
    User = get_user_model()
    usuario = User.objects.get(username='admin')  # Cambia por un usuario real
    empleado = usuario.empleado
    
    return JsonResponse({
        'success': True,
        'email': usuario.email,
        'nombre': empleado.primer_nombre
    })

# New API for registro_vacaciones lifecycle management
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from datetime import datetime
from django.core.exceptions import ValidationError
from django.db import transaction
from .models import registro_vacaciones, control_vacaciones

@csrf_exempt
@require_http_methods(["POST", "PATCH"])
@transaction.atomic
def api_registro_vacaciones(request):
    try:
        if request.method == "POST":
            data = json.loads(request.body)
            control_id = data.get("control_id")
            fecha_inicio = data.get("fecha_inicio")
            fecha_fin = data.get("fecha_fin")
            estado = data.get("estado", "PLAN")  # Valor por defecto 'PLAN' si no se envía

            if not all([control_id, fecha_inicio, fecha_fin]):
                return JsonResponse({"success": False, "message": "Faltan campos requeridos."}, status=400)

            try:
                control = control_vacaciones.objects.get(id=control_id)
            except control_vacaciones.DoesNotExist:
                return JsonResponse({"success": False, "message": "Control de vacaciones no encontrado."}, status=404)

            # Validate dates
            try:
                fecha_inicio_dt = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
                fecha_fin_dt = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
                if fecha_fin_dt <= fecha_inicio_dt:
                    return JsonResponse({"success": False, "message": "La fecha de fin debe ser posterior a la fecha de inicio."}, status=400)
            except ValueError:
                return JsonResponse({"success": False, "message": "Formato de fecha inválido."}, status=400)

            registro = registro_vacaciones(
                control=control,
                fecha_inicio=fecha_inicio_dt,
                fecha_fin=fecha_fin_dt,
                estado=estado
            )
            registro.save()
            return JsonResponse({"success": True, "message": "Vacaciones registradas correctamente.", "id": registro.id})

        elif request.method == "PATCH":
            data = json.loads(request.body)
            registro_id = data.get("id")
            if not registro_id:
                return JsonResponse({"success": False, "message": "ID de registro requerido."}, status=400)

            try:
                registro = registro_vacaciones.objects.get(id=registro_id)
            except registro_vacaciones.DoesNotExist:
                return JsonResponse({"success": False, "message": "Registro de vacaciones no encontrado."}, status=404)

            # Handle inhabilitacion (pausa)
            if data.get("accion") == "inhabilitar":
                fecha_inhabilitacion = data.get("fecha_inhabilitacion")
                motivo = data.get("motivo_inhabilitacion", "")
                if not fecha_inhabilitacion:
                    return JsonResponse({"success": False, "message": "Fecha de inhabilitación requerida."}, status=400)
                try:
                    fecha_inh_dt = datetime.strptime(fecha_inhabilitacion, "%Y-%m-%d").date()
                except ValueError:
                    return JsonResponse({"success": False, "message": "Formato de fecha de inhabilitación inválido."}, status=400)
                try:
                    registro.inhabilitar(fecha_inh_dt, motivo)
                except ValidationError as e:
                    return JsonResponse({"success": False, "message": str(e)}, status=400)
                return JsonResponse({"success": True, "message": "Vacaciones inhabilitadas correctamente."})

            # Handle reanudacion (resume)
            elif data.get("accion") == "reanudar":
                fecha_reanudacion = data.get("fecha_reanudacion")
                if not fecha_reanudacion:
                    return JsonResponse({"success": False, "message": "Fecha de reanudación requerida."}, status=400)
                try:
                    fecha_rean_dt = datetime.strptime(fecha_reanudacion, "%Y-%m-%d").date()
                except ValueError:
                    return JsonResponse({"success": False, "message": "Formato de fecha de reanudación inválido."}, status=400)
                try:
                    registro.reanudar(fecha_rean_dt)
                except ValidationError as e:
                    return JsonResponse({"success": False, "message": str(e)}, status=400)
                return JsonResponse({"success": True, "message": "Vacaciones reanudadas correctamente."})

            else:
                return JsonResponse({"success": False, "message": "Acción no válida."}, status=400)

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "JSON inválido."}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
