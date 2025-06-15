from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib import admin
#from .views import CustomLoginView

from django.contrib.auth.decorators import login_required
from .views import listado_recibos

urlpatterns = [
    path('login/', views.login, name='login'),  # Nuevo login JWT
    path('crear_cuenta/', views.crear_cuenta),
    path('menu/', views.menu, name='menu'),
    path('recuperar_contraseña', views.recuperar_contraseña),
    path('verificar_empleado/', views.verificar_empleado, name='verificar_empleado'),
    path('crear_cuenta_empleado/', views.crear_cuenta_empleado, name='crear_cuenta_empleado'),
    path('login_empleado/', views.login_empleado, name='login_empleado'),
    path('completar_registro/', views.completar_registro, name='completar_registro'),\
    
    path('dashboard/', views.dashboard, name='dashboard'),
    path('api/nominas/chart-data/', views.chart_data, name='chart_data'),

    path('perfil_usuario/', views.perfil_usuario, name= 'perfil_usuario'),
    path('noticias/', views.noticias, name= 'noticias'),
    path('recibos_pagos/', views.recibos_pagos, name= 'recibos_pagos'),
    path('constancia_trabajo/', views.constancia_trabajo, name= 'constancia_trabajo'),
    path('arc/', views.arc, name= 'arc'),
    
    path('importar_nomina/', views.importar_nomina, name= 'importar_nomina'),
    path('api/nominas/', views.listar_nominas, name='listar_nominas'),
    path('api/nominas/<int:pk>/', views.eliminar_nomina, name='eliminar_nomina'),
    #path('api/nominas/importar/', views.importar_nominas, name= 'importar_nominas'),

    path('ver_prenomina/', views.ver_prenomina, name= 'ver_prenomina'),
    path('listar_prenominas/', views.listar_prenominas, name= 'listar_prenominas'),
    path('api/prenomina/<int:prenomina_id>/', views.obtener_detalle_prenomina, name='obtener_detalle_prenomina'),


    path('gestion_respaldo/', views.gestion_respaldo, name= 'gestion_respaldo'),
    
    path('crear_usuarios/', views.crear_usuarios, name= 'crear_usuarios'),
    path('api/empleados/', views.listar_empleados, name= 'listar_empleados'),
    path('api/empleadoss/', views.api_empleadoss, name='api_empleadoss'),
    path('api/cargos_tipo/', views.api_cargos_por_tipo, name='api_cargos_por_tipo'),
    path('empleados/nuevo/', views.empleado_view, name='crear_empleado'),
    path('api/empleado/<int:pk>/', views.eliminar_empleado, name='eliminar_empleado'),

    path('roles_usuarios/', views.roles_usuarios, name='roles_usuarios'),
    path('api/usuarios/', views.listar_usuarios, name='listar_usuarios'),
    path('api/usuarios/<int:usuario_id>/', views.manejar_usuario, name='manejar_usuario'),
    path('api/roles/', views.listar_roles, name='listar_roles'),

    # Rutas de roles
    path('crear_roles/', views.crear_roles, name='crear_roles'),
    path('api/roles_listar/', views.listar_roles, name='listar_roles'),

    path('api/roles/crear/', views.crear_roles_api, name='crear_roles'),
    path('api/roles/actualizar/<str:rol_id>/', views.actualizar_roles, name='actualizar_roles'),
    path('api/roles/eliminar/<str:rol_id>/', views.eliminar_roles, name='eliminar_roles'),
    
    path('api/permisos/', views.listar_permisos, name='listar_permisos'),
    path('api/roles/<str:codigo_rol>/', views.obtener_rol, name='obtener_rol'),
    
    path('logout/', views.logout_empleado, name='logout'),
    

    path('recibos/', login_required(listado_recibos), name='listado_recibos'),
    path('api/recibos/<int:recibo_id>/', views.obtener_datos_recibo, name='obtener_datos_recibo'),

    path('load_template/<str:template_name>/', views.load_template, name='load_template'),
    
    # URLs para servir archivos estáticos en desarrollo (solo para DEBUG=True)
    path('static/javascript/menu_principal/subs_menus/<str:script_name>', views.serve_js, name='serve_js'),

    path('list_backups/', views.list_backups, name='list_backups'),
    path('create_backup/', views.create_backup, name='create_backup'),
    path('restore_backup/', views.restore_backup, name='restore_backup'),
    path('delete_backup/', views.delete_backup, name='delete_backup'),

    path('asistencias/', views.asistencias_personal, name='asistencias'),
    path('api/asistencias/', views.crear_asistencia, name='crear_asistencias'),
    path('api/asistencias_listar/', views.listar_asistencias, name='asistencias_listar'),
    
    path('api/get_faltas_justificables/', views.get_faltas_justificables, name='get_faltas_justificables'),
    path('api/justificaciones/', views.crear_justificacion, name = 'crear_justificacion'),
    path('justificacion/', views.listar_justificaciones, name='justificacion'),

    path('vacaciones_permisos/', views.vacaciones_permisos, name='vacaciones_permisos'),
    path('api/vacaciones_permisos/', views.vacaciones_por_cedula, name='vacaciones_por_cedula'),
    path('api/vacaciones_permisos/crear_vacaciones/', views.api_registro_vacaciones, name='vacaciones_permiso_crear'),

    path('api/vacaciones_permisos/listar/', views.listar_permisos_asistencia, name='listar_permisos_asistencia'),
    path('api/vacaciones_permisos/crear/', views.crear_vacacion_permiso, name='crear_vacacion_permiso'),
    path('api/empleado_por_cedula/', views.empleado_por_cedula, name='empleado_por_cedula'),
    path('api/vacaciones_listar/' ,views.listar_registros_vacaciones, name = 'listar_registros_vacaciones'),
    path('api/generar_nomina_automatica/', views.generar_nomina_automatica, name = 'generar_nomina_automatica'),

    #path('api/control_vacaciones/', views.api_control_vacaciones, name='api_control_vacaciones'),
]
