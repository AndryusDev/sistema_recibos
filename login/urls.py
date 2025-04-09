from django.urls import path, include 
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib import admin
#from .views import CustomLoginView

urlpatterns = [
    path('login/', views.login, name='login'),  # Nuevo login JWT
    path('crear_cuenta/', views.crear_cuenta),
    path('recuperar_contraseña', views.recuperar_contraseña),
    path('verificar_empleado/', views.verificar_empleado, name='verificar_empleado'),
    path('crear_cuenta_usuario/', views.crear_cuenta_empleado, name='crear_cuenta_empleado'),
]