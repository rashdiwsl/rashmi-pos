from django.db import models

class Product(models.Model):
    name  = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class Order(models.Model):
    total      = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

class OrderItem(models.Model):
    order    = models.ForeignKey(Order, on_delete=models.CASCADE)
    product  = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price    = models.DecimalField(max_digits=10, decimal_places=2)

class Transaction(models.Model):
    product    = models.ForeignKey(Product, on_delete=models.CASCADE)
    amount     = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['created_at', 'amount'])
        ]