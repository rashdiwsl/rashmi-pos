from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Product, Order, OrderItem, Transaction


# ─── Challenge 1: Purchase with concurrency protection ───
@api_view(['POST'])
def purchase(request):
    product_id = request.data.get('product_id', 1)

    with transaction.atomic():
        product = Product.objects.select_for_update().get(id=product_id)

        if product.stock <= 0:
            return Response({'error': 'Out of stock'}, status=400)

        product.stock -= 1
        product.save()

    return Response({'success': True, 'remaining': product.stock})


# ─── Challenge 2: Analytics ───
@api_view(['GET'])
def analytics(request):
    now   = timezone.now()
    start = now - timedelta(days=30)

    daily_revenue = (
        Transaction.objects
        .filter(created_at__gte=start)
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(revenue=Sum('amount'))
        .order_by('day')
    )

    top_products = (
        Transaction.objects
        .filter(created_at__gte=start)
        .values('product__name')
        .annotate(total=Sum('amount'))
        .order_by('-total')[:5]
    )

    return Response({
        'daily_revenue': list(daily_revenue),
        'top_products' : list(top_products)
    })


# ─── Challenge 3: Product list for POS ───
@api_view(['GET'])
def product_list(request):
    products = Product.objects.filter(stock__gt=0)
    data = [
        {
            'id'   : p.id,
            'name' : p.name,
            'price': str(p.price),
            'stock': p.stock
        }
        for p in products
    ]
    return Response(data)


# ─── Challenge 3: Checkout with transaction integrity ───
@api_view(['POST'])
def checkout(request):
    items = request.data.get('items', [])
    total = request.data.get('total', 0)

    if not items:
        return Response({'error': 'Cart is empty'}, status=400)

    try:
        with transaction.atomic():
            order = Order.objects.create(total=total)

            for item in items:
                product = Product.objects.select_for_update().get(
                    id=item['product_id']
                )
                if product.stock < item['qty']:
                    raise ValueError(f"Not enough stock for {product.name}")

                product.stock -= item['qty']
                product.save()

                OrderItem.objects.create(
                    order    = order,
                    product  = product,
                    quantity = item['qty'],
                    price    = item['price']
                )

                Transaction.objects.create(
                    product    = product,
                    amount     = float(item['price']) * item['qty'],
                    created_at = timezone.now()
                )

        return Response({'success': True, 'order_id': order.id, 'total': total})

    except ValueError as e:
        return Response({'error': str(e)}, status=400)