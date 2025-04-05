from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
#from .views import CustomTokenObtainPairView

urlpatterns = [
    path('login/', views.login, name='login'),  # Nuevo login JWT
    path('crear_cuenta/', views.crear_cuenta),
    path('recuperar_contraseña', views.recuperar_contraseña)
]