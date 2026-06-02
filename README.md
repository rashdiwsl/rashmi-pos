# Rashmi POS

## Tech Stack
- **Backend:** Python 3.12, Django 6.0, Django REST Framework
- **Frontend:** React + Vite + Recharts
- **Database:** MariaDB 11.4 (MySQL-compatible)

---


---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/rashdiwsl/rashmi-pos.git
cd rashmi-pos
```

### 2. Setup Backend
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment
Create a `.env` file in the root folder:
```
DB_NAME=rashmi_pos
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

### 4. Setup Database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE rashmi_pos;
EXIT;
```
```bash
python manage.py migrate
```

### 5. Add Sample Products
```bash
python manage.py shell
```
```python
from store.models import Product
Product.objects.create(name="Coffee", price=350.00, stock=50)
Product.objects.create(name="Tea", price=200.00, stock=50)
Product.objects.create(name="Sandwich", price=550.00, stock=30)
Product.objects.create(name="Cake Slice", price=450.00, stock=20)
Product.objects.create(name="Orange Juice", price=300.00, stock=40)
exit()
```

### 6. Run Seed Script (100k transactions)
```bash
python manage.py seed_data
```

### 7. Run Backend
```bash
python manage.py runserver
```

### 8. Setup and Run Frontend
```bash
cd frontend
npm install
npm run dev
```


### 9. Run Load Test
```bash
python load_test.py
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/purchase/ | Flash sale purchase with concurrency lock |
| GET | /api/analytics/ | Daily revenue + top 5 products |
| GET | /api/products/ | List available products |
| GET | /api/products/all/ | List all products including out of stock |
| POST | /api/products/add/ | Add new product |
| DELETE | /api/products/{id}/delete/ | Delete a product |
| POST | /api/products/{id}/restock/ | Add stock to existing product |
| POST | /api/checkout/ | Process cart with transactional integrity |

---

## Challenge Explanations

### Challenge 1 — High Concurrency
Used `select_for_update()` inside `transaction.atomic()`. This places a
row-level lock on the product row so concurrent requests queue up at the
database level instead of all reading the same stale stock value simultaneously.

**Load test result:** 100 concurrent requests → exactly 50 succeeded, 50 returned
out-of-stock. Stock never went negative. ✅

### Challenge 2 — Big Data & Query Optimization
- `bulk_create()` inserts 5000 records per batch — much faster than 100k individual queries
- `db_index=True` on `created_at` enables fast date range filtering
- Composite index on `(created_at, amount)` speeds up aggregation queries
- Django ORM `annotate()` + `Sum()` runs everything in a single SQL query

### Challenge 3 — POS Transactional Integrity
Used `transaction.atomic()` to wrap the entire checkout process. If any single
item fails (out of stock, database error), Django automatically rolls back ALL
saves — no partial orders ever reach the database.

---

## Note on Database
MariaDB 11.4 was used as a MySQL-compatible replacement due to a MySQL
authentication plugin conflict on the development environment. MariaDB is a
direct fork of MySQL, fully supported by Django's `django.db.backends.mysql`
engine, and used in production by Wikipedia, Google, and many large companies.
