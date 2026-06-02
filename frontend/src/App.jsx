import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000/api";

const fmt = (amount) =>
  `Rs. ${parseFloat(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const CATEGORY_ICONS = {
  coffee: "☕", tea: "🍵", sandwich: "🥪", cake: "🍰",
  juice: "🧃", rice: "🍚", water: "💧", milk: "🥛",
  burger: "🍔", pizza: "🍕", default: "🛒"
};

function getIcon(name) {
  const n = name.toLowerCase();
  return Object.entries(CATEGORY_ICONS).find(([k]) => n.includes(k))?.[1] ?? CATEGORY_ICONS.default;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #0f1117; color: #e2e8f0; }
  .pos-root { display: flex; height: 100vh; overflow: hidden; }
  .sidebar-left { width: 220px; background: #161b27; border-right: 1px solid #1e2536; display: flex; flex-direction: column; padding: 24px 16px; flex-shrink: 0; }
  .logo { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.5px; margin-bottom: 8px; }
  .logo span { color: #3b82f6; }
  .logo-sub { font-size: 11px; color: #4b5563; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 32px; }
  .nav-label { font-size: 10px; color: #374151; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; font-weight: 600; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #6b7280; margin-bottom: 4px; transition: all 0.15s; border: none; background: none; width: 100%; }
  .nav-item.active { background: #1d2d50; color: #3b82f6; font-weight: 600; }
  .nav-item:hover { background: #1a2236; color: #e2e8f0; }
  .products-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .products-header { padding: 20px 24px 0; display: flex; align-items: center; justify-content: space-between; }
  .products-title { font-size: 20px; font-weight: 700; color: #f1f5f9; }
  .products-count { font-size: 12px; color: #4b5563; background: #1e2536; padding: 4px 10px; border-radius: 20px; }
  .search-bar { margin: 16px 24px; position: relative; }
  .search-bar input { width: 100%; background: #161b27; border: 1px solid #1e2536; border-radius: 10px; padding: 10px 16px 10px 40px; color: #e2e8f0; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; transition: border 0.2s; }
  .search-bar input:focus { border-color: #3b82f6; }
  .search-bar input::placeholder { color: #374151; }
  .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #374151; font-size: 14px; }
  .products-grid { flex: 1; overflow-y: auto; padding: 0 24px 24px; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; align-content: start; }
  .products-grid::-webkit-scrollbar { width: 4px; }
  .products-grid::-webkit-scrollbar-track { background: transparent; }
  .products-grid::-webkit-scrollbar-thumb { background: #1e2536; border-radius: 4px; }
  .product-card { background: #161b27; border: 1px solid #1e2536; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.15s; user-select: none; }
  .product-card:hover { border-color: #3b82f6; background: #1a2236; transform: translateY(-1px); }
  .product-card:active { transform: scale(0.97); }
  .product-icon { font-size: 28px; margin-bottom: 10px; }
  .product-name { font-size: 13px; font-weight: 600; color: #e2e8f0; margin-bottom: 6px; line-height: 1.3; }
  .product-price { font-size: 14px; font-weight: 700; color: #3b82f6; margin-bottom: 4px; font-family: 'DM Mono', monospace; }
  .product-stock { font-size: 10px; color: #374151; }
  .product-stock.low { color: #f59e0b; }
  .cart-panel { width: 340px; background: #161b27; border-left: 1px solid #1e2536; display: flex; flex-direction: column; flex-shrink: 0; }
  .cart-header { padding: 20px 20px 16px; border-bottom: 1px solid #1e2536; display: flex; justify-content: space-between; align-items: center; }
  .cart-title { font-size: 16px; font-weight: 700; color: #f1f5f9; }
  .cart-badge { background: #3b82f6; color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; font-family: 'DM Mono', monospace; }
  .cart-items { flex: 1; overflow-y: auto; padding: 12px; }
  .cart-items::-webkit-scrollbar { width: 3px; }
  .cart-items::-webkit-scrollbar-thumb { background: #1e2536; border-radius: 4px; }
  .cart-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #374151; }
  .cart-empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.4; }
  .cart-empty p { font-size: 13px; }
  .cart-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: #0f1117; border-radius: 10px; margin-bottom: 8px; border: 1px solid #1e2536; }
  .cart-item-icon { font-size: 22px; flex-shrink: 0; }
  .cart-item-info { flex: 1; min-width: 0; }
  .cart-item-name { font-size: 12px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cart-item-price { font-size: 11px; color: #4b5563; font-family: 'DM Mono', monospace; margin-top: 2px; }
  .cart-item-subtotal { font-size: 12px; font-weight: 700; color: #3b82f6; font-family: 'DM Mono', monospace; }
  .qty-controls { display: flex; align-items: center; gap: 6px; }
  .qty-btn { width: 24px; height: 24px; border-radius: 6px; border: 1px solid #1e2536; background: #161b27; color: #e2e8f0; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.1s; flex-shrink: 0; }
  .qty-btn:hover { background: #1d2d50; border-color: #3b82f6; color: #3b82f6; }
  .qty-num { font-size: 13px; font-weight: 700; min-width: 16px; text-align: center; font-family: 'DM Mono', monospace; }
  .cart-footer { padding: 16px 20px; border-top: 1px solid #1e2536; }
  .cart-summary { margin-bottom: 16px; }
  .summary-row { display: flex; justify-content: space-between; font-size: 12px; color: #4b5563; margin-bottom: 6px; }
  .summary-row.total { font-size: 18px; font-weight: 700; color: #f1f5f9; margin-top: 10px; padding-top: 10px; border-top: 1px solid #1e2536; }
  .summary-row.total span:last-child { color: #3b82f6; font-family: 'DM Mono', monospace; }
  .checkout-btn { width: 100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; letter-spacing: 0.3px; transition: all 0.15s; }
  .checkout-btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.4); }
  .checkout-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .receipt-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
  .receipt-paper { width: 302px; background: #fff; color: #111; padding: 24px 20px; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
  .receipt-header { text-align: center; margin-bottom: 12px; }
  .receipt-store { font-size: 20px; font-weight: 700; letter-spacing: 3px; color: #111; }
  .receipt-sub { font-size: 10px; color: #666; margin-top: 2px; }
  .receipt-divider { border: none; border-top: 1px dashed #ccc; margin: 10px 0; }
  .receipt-row { display: flex; justify-content: space-between; margin: 5px 0; font-size: 11px; }
  .receipt-row.header { color: #888; font-size: 10px; }
  .receipt-item-name { flex: 1; }
  .receipt-item-qty { width: 30px; text-align: center; color: #666; }
  .receipt-item-price { width: 80px; text-align: right; }
  .receipt-total-row { display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; margin: 8px 0 4px; }
  .receipt-footer { text-align: center; font-size: 10px; color: #888; margin-top: 12px; line-height: 1.6; }
  .receipt-order { font-size: 10px; color: #bbb; text-align: center; margin: 4px 0; }
  .receipt-actions { display: flex; gap: 8px; margin-top: 16px; }
  .receipt-btn { flex: 1; padding: 10px; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .receipt-btn.print { background: #f3f4f6; color: #374151; }
  .receipt-btn.new { background: #2563eb; color: white; }
`;

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart]         = useState({});
  const [receipt, setReceipt]   = useState(null);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    axios.get(`${API}/products/`).then(r => setProducts(r.data));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: { product, qty: (prev[product.id]?.qty || 0) + 1 }
    }));
  };

  const changeQty = (id, delta) => {
    setCart(prev => {
      const newQty = (prev[id]?.qty || 0) + delta;
      if (newQty <= 0) { const u = { ...prev }; delete u[id]; return u; }
      return { ...prev, [id]: { ...prev[id], qty: newQty } };
    });
  };

  const cartItems    = Object.values(cart);
  const itemCount    = cartItems.reduce((s, { qty }) => s + qty, 0);
  const subtotal     = cartItems.reduce((s, { product, qty }) => s + parseFloat(product.price) * qty, 0);
  const tax          = subtotal * 0.0;
  const grandTotal   = subtotal + tax;

  const handleCheckout = async () => {
    const items = cartItems.map(({ product, qty }) => ({
      product_id: product.id, qty, price: product.price
    }));
    try {
      const res = await axios.post(`${API}/checkout/`, {
        items, total: grandTotal.toFixed(2)
      });
      setReceipt({ items: cartItems, subtotal, grandTotal, order_id: res.data.order_id });
      setCart({});
    } catch (e) {
      alert(e.response?.data?.error || "Checkout failed");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="pos-root">

        {/* Sidebar */}
        <div className="sidebar-left">
          <div className="logo">Rashmi<span>POS</span></div>
          <div className="logo-sub">Point of Sale</div>
          <div className="nav-label">Menu</div>
          <button className="nav-item active">🧾 New Sale</button>
          <button className="nav-item">📊 Analytics</button>
          <button className="nav-item">📦 Products</button>
          <button className="nav-item">⚙️ Settings</button>
        </div>

        {/* Products */}
        <div className="products-area">
          <div className="products-header">
            <div className="products-title">Products</div>
            <div className="products-count">{products.length} items</div>
          </div>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="products-grid">
            {filtered.map(p => (
              <div key={p.id} className="product-card" onClick={() => addToCart(p)}>
                <div className="product-icon">{getIcon(p.name)}</div>
                <div className="product-name">{p.name}</div>
                <div className="product-price">{fmt(p.price)}</div>
                <div className={`product-stock ${p.stock < 10 ? "low" : ""}`}>
                  {p.stock < 10 ? `⚠ ${p.stock} left` : `${p.stock} in stock`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="cart-panel">
          <div className="cart-header">
            <div className="cart-title">Current Order</div>
            {itemCount > 0 && <div className="cart-badge">{itemCount}</div>}
          </div>

          <div className="cart-items">
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <p>No items yet</p>
              </div>
            ) : (
              cartItems.map(({ product, qty }) => (
                <div key={product.id} className="cart-item">
                  <div className="cart-item-icon">{getIcon(product.name)}</div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{product.name}</div>
                    <div className="cart-item-price">{fmt(product.price)} each</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                    <div className="cart-item-subtotal">{fmt(parseFloat(product.price)*qty)}</div>
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => changeQty(product.id, -1)}>−</button>
                      <span className="qty-num">{qty}</span>
                      <button className="qty-btn" onClick={() => changeQty(product.id, +1)}>+</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal ({itemCount} items)</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{fmt(grandTotal)}</span>
              </div>
            </div>
            <button
              className="checkout-btn"
              disabled={cartItems.length === 0}
              onClick={handleCheckout}>
              Checkout →
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {receipt && (
        <div className="receipt-overlay" onClick={e => e.target === e.currentTarget && setReceipt(null)}>
          <div className="receipt-paper">
            <div className="receipt-header">
              <div className="receipt-store">RASHMI POS</div>
              <div className="receipt-sub">Colombo, Sri Lanka</div>
              <div className="receipt-sub">{new Date().toLocaleString("en-LK")}</div>
            </div>
            <hr className="receipt-divider" />
            <div className="receipt-row header">
              <span className="receipt-item-name">ITEM</span>
              <span className="receipt-item-qty">QTY</span>
              <span className="receipt-item-price">AMOUNT</span>
            </div>
            <hr className="receipt-divider" />
            {receipt.items.map(({ product, qty }) => (
              <div key={product.id} className="receipt-row">
                <span className="receipt-item-name">{product.name}</span>
                <span className="receipt-item-qty">{qty}</span>
                <span className="receipt-item-price">{fmt(parseFloat(product.price)*qty)}</span>
              </div>
            ))}
            <hr className="receipt-divider" />
            <div className="receipt-total-row">
              <span>TOTAL</span>
              <span>{fmt(receipt.grandTotal)}</span>
            </div>
            <div className="receipt-order">Order #{receipt.order_id}</div>
            <hr className="receipt-divider" />
            <div className="receipt-footer">
              Thank you for your purchase!<br />
              Please come again 🙏<br />
              www.rashmipos.lk
            </div>
            <div className="receipt-actions">
              <button className="receipt-btn print" onClick={() => window.print()}>🖨 Print</button>
              <button className="receipt-btn new" onClick={() => setReceipt(null)}>New Sale</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}