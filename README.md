> Run `curl -o /dev/null -s -w "%{time_total}\n" http://127.0.0.1:8000/api/analytics/`  
> and replace the response time above with your actual measured value.

---

## Challenge 3 — POS Transactional Integrity

### Approach
Used `transaction.atomic()` to wrap the entire checkout. If any single item fails
(out of stock, database error), Django automatically rolls back ALL saves —
no partial orders ever reach the database.

```python
with transaction.atomic():
    order = Order.objects.create(total=total)
    for item in items:
        product = Product.objects.select_for_update().get(id=item['product_id'])
        if product.stock < item['qty']:
            raise ValueError(f"Not enough stock for {product.name}")
        product.stock -= item['qty']
        product.save()
        OrderItem.objects.create(order=order, ...)
```

The Receipt Component renders at **302px wide** (80mm at 96dpi) using
Courier New monospace font to match thermal printer output.

---

## Note on Database

MariaDB 11.4 was used as a MySQL-compatible replacement due to a MySQL
authentication plugin conflict on the development environment. MariaDB is a
direct fork of MySQL, fully supported by Django's `django.db.backends.mysql`
engine, and used in production by Wikipedia, Google, and many large companies.
