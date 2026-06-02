from django.core.management.base import BaseCommand
from store.models import Product, Transaction
from django.utils import timezone
import random
import datetime

class Command(BaseCommand):
    help = 'Seed 100k transactions'

    def handle(self, *args, **kwargs):
        products = list(Product.objects.all())
        if not products:
            self.stdout.write("No products found. Create some first.")
            return

        now = timezone.now()
        batch = []
        self.stdout.write("Seeding 100,000 transactions...")

        for i in range(100_000):
            days_ago = random.randint(0, 180)
            batch.append(Transaction(
                product=random.choice(products),
                amount=round(random.uniform(10, 500), 2),
                created_at=now - datetime.timedelta(
                    days=days_ago,
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59)
                )
            ))

            # Insert every 5000 records — much faster than one by one
            if len(batch) == 5000:
                Transaction.objects.bulk_create(batch)
                batch = []
                self.stdout.write(f"  {i+1} inserted...")

        if batch:
            Transaction.objects.bulk_create(batch)

        self.stdout.write(self.style.SUCCESS("Done! 100k transactions created."))