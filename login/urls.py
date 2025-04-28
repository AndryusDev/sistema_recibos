from django.urls import path, include 
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib import admin
#from .views import CustomLoginView

urlpatterns = [
    path('login/', views.login, name='login'),  # Nuevo login JWT
    path('crear_cuenta/', views.crear_cuenta),
    path('menu/', views.menu, name='menu'),
    path('recuperar_contraseña', views.recuperar_contraseña),
    path('verificar_empleado/', views.verificar_empleado, name='verificar_empleado'),
    path('crear_cuenta_empleado/', views.crear_cuenta_empleado, name='crear_cuenta_empleado'),
    path('login_empleado/', views.login_empleado, name='login_empleado'),
    path('completar_registro/', views.completar_registro, name='completar_registro'),
    path('perfil_usuario/', views.perfil_usuario, name= 'perfil_usuario'),
    path('noticias/', views.noticias, name= 'noticias'),
    path('recibo_pago/', views.recibo_pago, name= 'recibo_pago'),
    path('constancia_trabajo/', views.constancia_trabajo, name= 'constancia_trabajo'),


    path('load_template/<str:template_name>/', views.load_template, name='load_template'),
    
    # URLs para servir archivos estáticos en desarrollo (solo para DEBUG=True)
    path('static/javascript/menu_principal/subs_menus/<str:script_name>', views.serve_js, name='serve_js'),
]