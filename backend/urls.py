from django.contrib import admin
from django.urls import path
from store import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/purchase/', views.purchase),
    path('api/analytics/', views.analytics),
    path('api/products/', views.product_list),
    path('api/checkout/', views.checkout),
]