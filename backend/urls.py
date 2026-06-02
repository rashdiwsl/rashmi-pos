from django.contrib import admin
from django.urls import path
from store import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/purchase/',              views.purchase),
    path('api/analytics/',             views.analytics),
    path('api/products/',              views.product_list),
    path('api/products/add/',          views.product_add),
    path('api/products/all/',          views.product_list_all),
    path('api/products/<int:pk>/delete/',   views.product_delete),
    path('api/products/<int:pk>/restock/',  views.product_restock),
    path('api/checkout/',              views.checkout),
]