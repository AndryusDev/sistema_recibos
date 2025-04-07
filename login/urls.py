from django.urls import path, include 
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib import admin
from .views import CustomLoginView  # Importa la vista personalizada

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='login'),  # Nuevo login JWT
    path('crear_cuenta/', views.crear_cuenta),
    path('recuperar_contraseña', views.recuperar_contraseña)
]