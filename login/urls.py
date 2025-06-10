from django.urls import path, include 
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
    path('api/nominas/importar/', views.importar_nominas, name= 'importar_nominas'),

    path('ver_prenomina/', views.ver_prenomina, name= 'ver_prenomina'),
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

    path('crear_roles/', views.crear_roles, name='crear_roles'),
    path('api/crear_roles/', views.manejar_usuario, name = 'manejar_usuario'),
    path('api/roles_listar/', views.listar_roles, name = 'listar_roles'),

    
    path('logout/', views.logout_empleado, name='logout'),
    

    path('recibos/', login_required(listado_recibos), name='listado_recibos'),
    path('api/recibos/<int:recibo_id>/', views.obtener_datos_recibo, name='obtener_datos_recibo'),

    path('load_template/<str:template_name>/', views.load_template, name='load_template'),
    
    # URLs para servir archivos estáticos en desarrollo (solo para DEBUG=True)
    path('static/javascript/menu_principal/subs_menus/<str:script_name>', views.serve_js, name='serve_js'),
]