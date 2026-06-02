import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from "recharts";

const API = "http://localhost:8000/api";

const fmt = (amount) =>
  `Rs. ${parseFloat(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  })}`;

function getIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("coffee"))  return "☕";
  if (n.includes("tea"))     return "🍵";
  if (n.includes("sandwich")) return "🥪";
  if (n.includes("cake"))    return "🍰";
  if (n.includes("juice"))   return "🧃";
  if (n.includes("rice"))    return "🍚";
  if (n.includes("water"))   return "💧";
  if (n.includes("milk"))    return "🥛";
  if (n.includes("burger"))  return "🍔";
  if (n.includes("pizza"))   return "🍕";
  if (n.includes("kottu"))   return "🍛";
  if (n.includes("roti"))    return "🫓";
  return "🛒";
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:#0a0f1e;color:#e2e8f0;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#1e2d45;border-radius:4px;}

  .app{display:flex;height:100vh;overflow:hidden;}

  /* Sidebar */
  .sidebar{width:230px;background:#0d1526;border-right:1px solid #1a2540;display:flex;flex-direction:column;padding:20px 12px;flex-shrink:0;}
  .brand{padding:8px 12px 24px;}
  .brand-name{font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;}
  .brand-name span{color:#3b82f6;}
  .brand-sub{font-size:10px;color:#334155;text-transform:uppercase;letter-spacing:2px;margin-top:2px;}
  .nav-section{margin-bottom:24px;}
  .nav-label{font-size:10px;color:#334155;text-transform:uppercase;letter-spacing:1.5px;padding:0 12px;margin-bottom:6px;font-weight:600;}
  .nav-btn{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border:none;background:none;color:#64748b;font-size:13px;font-family:'Inter',sans-serif;border-radius:8px;cursor:pointer;transition:all 0.15s;text-align:left;margin-bottom:2px;}
  .nav-btn:hover{background:#111d35;color:#e2e8f0;}
  .nav-btn.active{background:#1a2d50;color:#3b82f6;font-weight:600;}
  .nav-btn .icon{font-size:16px;width:20px;text-align:center;}
  .sidebar-footer{margin-top:auto;padding:12px;background:#0a0f1e;border-radius:10px;}
  .sidebar-footer p{font-size:11px;color:#334155;text-align:center;}

  /* Main content */
  .main{flex:1;display:flex;overflow:hidden;}

  /* POS Page */
  .pos-products{flex:1;display:flex;flex-direction:column;overflow:hidden;background:#0a0f1e;}
  .page-header{padding:20px 24px 0;display:flex;align-items:center;justify-content:space-between;}
  .page-title{font-size:22px;font-weight:700;color:#f1f5f9;}
  .page-subtitle{font-size:12px;color:#475569;margin-top:2px;}
  .search-wrap{padding:14px 24px;}
  .search-input{width:100%;background:#0d1526;border:1px solid #1a2540;border-radius:10px;padding:10px 16px 10px 40px;color:#e2e8f0;font-size:13px;font-family:'Inter',sans-serif;outline:none;transition:border 0.2s;}
  .search-input:focus{border-color:#3b82f6;}
  .search-input::placeholder{color:#334155;}
  .search-wrap{position:relative;}
  .search-icon{position:absolute;left:38px;top:50%;transform:translateY(-50%);color:#334155;pointer-events:none;}
  .product-grid{flex:1;overflow-y:auto;padding:0 24px 24px;display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:10px;align-content:start;}
  .product-card{background:#0d1526;border:1px solid #1a2540;border-radius:12px;padding:16px 14px;cursor:pointer;transition:all 0.15s;user-select:none;position:relative;}
  .product-card:hover{border-color:#3b82f6;background:#111d35;transform:translateY(-2px);box-shadow:0 4px 16px rgba(59,130,246,0.15);}
  .product-card:active{transform:scale(0.96);}
  .product-card.out-of-stock{opacity:0.4;cursor:not-allowed;}
  .product-card.out-of-stock:hover{transform:none;border-color:#1a2540;}
  .p-icon{font-size:30px;margin-bottom:10px;}
  .p-name{font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:6px;line-height:1.3;}
  .p-price{font-size:14px;font-weight:700;color:#3b82f6;font-family:'JetBrains Mono',monospace;margin-bottom:4px;}
  .p-stock{font-size:10px;color:#475569;}
  .p-stock.low{color:#f59e0b;}
  .p-stock.out{color:#ef4444;}
  .cart-badge-dot{position:absolute;top:10px;right:10px;width:8px;height:8px;background:#3b82f6;border-radius:50%;display:none;}
  .product-card.in-cart .cart-badge-dot{display:block;}

  /* Cart */
  .cart{width:320px;background:#0d1526;border-left:1px solid #1a2540;display:flex;flex-direction:column;flex-shrink:0;}
  .cart-head{padding:18px 18px 14px;border-bottom:1px solid #1a2540;display:flex;justify-content:space-between;align-items:center;}
  .cart-title{font-size:15px;font-weight:700;color:#f1f5f9;}
  .cart-count{background:#3b82f6;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;font-family:'JetBrains Mono',monospace;}
  .clear-btn{background:none;border:1px solid #1a2540;color:#475569;font-size:11px;padding:4px 10px;border-radius:6px;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.15s;}
  .clear-btn:hover{border-color:#ef4444;color:#ef4444;}
  .cart-body{flex:1;overflow-y:auto;padding:10px;}
  .cart-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#334155;gap:8px;}
  .cart-empty-icon{font-size:44px;opacity:0.3;}
  .cart-item{display:flex;align-items:center;gap:10px;padding:10px;background:#0a0f1e;border-radius:10px;margin-bottom:6px;border:1px solid #1a2540;transition:all 0.15s;}
  .cart-item:hover{border-color:#1e3a5f;}
  .ci-icon{font-size:22px;flex-shrink:0;}
  .ci-info{flex:1;min-width:0;}
  .ci-name{font-size:12px;font-weight:600;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .ci-unit{font-size:11px;color:#475569;margin-top:1px;font-family:'JetBrains Mono',monospace;}
  .ci-right{display:flex;flex-direction:column;align-items:flex-end;gap:5px;}
  .ci-sub{font-size:12px;font-weight:700;color:#3b82f6;font-family:'JetBrains Mono',monospace;}
  .qty-ctrl{display:flex;align-items:center;gap:5px;}
  .qty-btn{width:22px;height:22px;border-radius:6px;border:1px solid #1a2540;background:#0d1526;color:#e2e8f0;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.1s;flex-shrink:0;}
  .qty-btn:hover{background:#1a2d50;border-color:#3b82f6;color:#3b82f6;}
  .qty-num{font-size:13px;font-weight:700;min-width:16px;text-align:center;font-family:'JetBrains Mono',monospace;}
  .cart-foot{padding:14px 18px;border-top:1px solid #1a2540;}
  .summary{margin-bottom:14px;}
  .sum-row{display:flex;justify-content:space-between;font-size:12px;color:#475569;margin-bottom:5px;}
  .sum-row.total{font-size:18px;font-weight:700;color:#f1f5f9;border-top:1px solid #1a2540;padding-top:10px;margin-top:8px;}
  .sum-row.total span:last-child{color:#3b82f6;font-family:'JetBrains Mono',monospace;}
  .checkout-btn{width:100%;padding:13px;background:#2563eb;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.15s;}
  .checkout-btn:hover:not(:disabled){background:#1d4ed8;box-shadow:0 4px 16px rgba(37,99,235,0.35);}
  .checkout-btn:disabled{opacity:0.3;cursor:not-allowed;}

  /* Receipt */
  .receipt-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(6px);}
  .receipt-paper{width:302px;background:#fff;color:#111;padding:22px 18px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:12px;box-shadow:0 24px 64px rgba(0,0,0,0.6);}
  .r-center{text-align:center;}
  .r-store{font-size:18px;font-weight:700;letter-spacing:3px;}
  .r-sub{font-size:10px;color:#666;margin-top:2px;}
  .r-div{border:none;border-top:1px dashed #bbb;margin:10px 0;}
  .r-row{display:flex;justify-content:space-between;margin:5px 0;font-size:11px;}
  .r-total{display:flex;justify-content:space-between;font-weight:700;font-size:15px;margin:8px 0;}
  .r-footer{text-align:center;font-size:10px;color:#888;margin-top:10px;line-height:1.7;}
  .r-actions{display:flex;gap:8px;margin-top:14px;}
  .r-btn{flex:1;padding:10px;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;}
  .r-btn.print{background:#f3f4f6;color:#374151;}
  .r-btn.new{background:#2563eb;color:#fff;}

  /* Analytics Page */
  .page-content{flex:1;overflow-y:auto;padding:24px;}
  .stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin-bottom:28px;}
  .stat-card{background:#0d1526;border:1px solid #1a2540;border-radius:12px;padding:18px;}
  .stat-label{font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;}
  .stat-value{font-size:24px;font-weight:700;color:#f1f5f9;font-family:'JetBrains Mono',monospace;}
  .stat-value.blue{color:#3b82f6;}
  .stat-value.green{color:#10b981;}
  .chart-card{background:#0d1526;border:1px solid #1a2540;border-radius:12px;padding:20px;margin-bottom:20px;}
  .chart-title{font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:16px;}
  .top-table{width:100%;border-collapse:collapse;}
  .top-table th{text-align:left;font-size:11px;color:#475569;text-transform:uppercase;padding:8px 12px;border-bottom:1px solid #1a2540;}
  .top-table td{padding:10px 12px;font-size:13px;border-bottom:1px solid #0f172a;}
  .top-table tr:last-child td{border-bottom:none;}
  .rank-badge{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:#1a2d50;color:#3b82f6;font-size:11px;font-weight:700;margin-right:8px;}
  .rank-badge.gold{background:#422006;color:#f59e0b;}
  .rank-badge.silver{background:#1e293b;color:#94a3b8;}
  .rank-badge.bronze{background:#2c1810;color:#b45309;}

  /* Products Page */
  .add-form{background:#0d1526;border:1px solid #1a2540;border-radius:12px;padding:20px;margin-bottom:24px;}
  .form-title{font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:16px;}
  .form-grid{display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:12px;align-items:end;}
  .form-group{display:flex;flex-direction:column;gap:6px;}
  .form-label{font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:1px;font-weight:600;}
  .form-input{background:#0a0f1e;border:1px solid #1a2540;border-radius:8px;padding:10px 14px;color:#e2e8f0;font-size:13px;font-family:'Inter',sans-serif;outline:none;transition:border 0.2s;}
  .form-input:focus{border-color:#3b82f6;}
  .add-btn{background:#2563eb;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;white-space:nowrap;transition:all 0.15s;height:40px;}
  .add-btn:hover{background:#1d4ed8;}
  .products-list{background:#0d1526;border:1px solid #1a2540;border-radius:12px;overflow:hidden;}
  .list-header{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 120px;padding:12px 16px;border-bottom:1px solid #1a2540;}
  .list-header span{font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:1px;font-weight:600;}
  .list-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 120px;padding:12px 16px;border-bottom:1px solid #0a0f1e;transition:background 0.1s;align-items:center;}
  .list-row:hover{background:#0f172a;}
  .list-row:last-child{border-bottom:none;}
  .list-name{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:500;color:#e2e8f0;}
  .list-price{font-size:13px;color:#3b82f6;font-family:'JetBrains Mono',monospace;}
  .list-stock{font-size:13px;color:#e2e8f0;font-family:'JetBrains Mono',monospace;}
  .stock-badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;}
  .stock-badge.ok{background:#052e16;color:#10b981;}
  .stock-badge.low{background:#2d1b00;color:#f59e0b;}
  .stock-badge.out{background:#2d0a0a;color:#ef4444;}
  .del-btn{background:none;border:none;color:#334155;cursor:pointer;font-size:16px;padding:4px 8px;border-radius:6px;transition:all 0.15s;}
  .del-btn:hover{background:#2d0a0a;color:#ef4444;}

  /* Loading */
  .loading{display:flex;align-items:center;justify-content:center;height:200px;color:#334155;font-size:14px;}
  .toast{position:fixed;bottom:24px;right:24px;background:#10b981;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:300;animation:slideIn 0.3s ease;}
  .toast.error{background:#ef4444;}
  @keyframes slideIn{from{transform:translateX(100px);opacity:0;}to{transform:translateX(0);opacity:1;}}
`;

// ─── TOAST ───
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`toast ${type === "error" ? "error" : ""}`}>{msg}</div>;
}

// ─── RECEIPT ───
function Receipt({ receipt, onClose }) {
  return (
    <div className="receipt-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="receipt-paper">
        <div className="r-center">
          <div className="r-store">RASHMI POS</div>
          <div className="r-sub">Colombo, Sri Lanka</div>
          <div className="r-sub">{new Date().toLocaleString("en-LK")}</div>
        </div>
        <hr className="r-div" />
        <div className="r-row" style={{color:"#888",fontSize:10}}>
          <span style={{flex:1}}>ITEM</span><span style={{width:30,textAlign:"center"}}>QTY</span>
          <span style={{width:90,textAlign:"right"}}>AMOUNT</span>
        </div>
        <hr className="r-div" />
        {receipt.items.map(({ product, qty }) => (
          <div key={product.id} className="r-row">
            <span style={{flex:1}}>{product.name}</span>
            <span style={{width:30,textAlign:"center"}}>{qty}</span>
            <span style={{width:90,textAlign:"right"}}>{fmt(parseFloat(product.price)*qty)}</span>
          </div>
        ))}
        <hr className="r-div" />
        <div className="r-total"><span>TOTAL</span><span>{fmt(receipt.total)}</span></div>
        <div className="r-center r-sub" style={{marginTop:4}}>Order #{receipt.order_id}</div>
        <hr className="r-div" />
        <div className="r-footer">Thank you for shopping!<br/>Please come again 🙏</div>
        <div className="r-actions">
          <button className="r-btn print" onClick={() => window.print()}>🖨 Print</button>
          <button className="r-btn new" onClick={onClose}>New Sale</button>
        </div>
      </div>
    </div>
  );
}

// ─── POS PAGE ───
function POSPage({ toast }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart]         = useState({});
  const [receipt, setReceipt]   = useState(null);
  const [search, setSearch]     = useState("");

  const loadProducts = () =>
    axios.get(`${API}/products/`).then(r => setProducts(r.data));

  useEffect(() => { loadProducts(); }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (p) => {
    if (p.stock <= 0) return;
    setCart(prev => ({
      ...prev,
      [p.id]: { product: p, qty: (prev[p.id]?.qty || 0) + 1 }
    }));
  };

  const changeQty = (id, delta) => {
    setCart(prev => {
      const newQty = (prev[id]?.qty || 0) + delta;
      if (newQty <= 0) { const u = { ...prev }; delete u[id]; return u; }
      return { ...prev, [id]: { ...prev[id], qty: newQty } };
    });
  };

  const cartItems  = Object.values(cart);
  const itemCount  = cartItems.reduce((s, { qty }) => s + qty, 0);
  const grandTotal = cartItems.reduce((s, { product, qty }) =>
    s + parseFloat(product.price) * qty, 0);

  const handleCheckout = async () => {
    try {
      const res = await axios.post(`${API}/checkout/`, {
        items: cartItems.map(({ product, qty }) => ({
          product_id: product.id, qty, price: product.price
        })),
        total: grandTotal.toFixed(2)
      });
      setReceipt({ items: cartItems, total: grandTotal, order_id: res.data.order_id });
      setCart({});
      loadProducts(); // ← refresh stock after purchase
      toast("Order completed successfully!");
    } catch (e) {
      toast(e.response?.data?.error || "Checkout failed", "error");
    }
  };

  return (
    <div className="main">
      <div className="pos-products">
        <div className="page-header">
          <div>
            <div className="page-title">New Sale</div>
            <div className="page-subtitle">{products.length} products available</div>
          </div>
        </div>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search products..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="product-grid">
          {filtered.map(p => (
            <div key={p.id}
              className={`product-card ${p.stock <= 0 ? "out-of-stock" : ""} ${cart[p.id] ? "in-cart" : ""}`}
              onClick={() => addToCart(p)}>
              <div className="cart-badge-dot" />
              <div className="p-icon">{getIcon(p.name)}</div>
              <div className="p-name">{p.name}</div>
              <div className="p-price">{fmt(p.price)}</div>
              <div className={`p-stock ${p.stock === 0 ? "out" : p.stock < 10 ? "low" : ""}`}>
                {p.stock === 0 ? "Out of stock" : p.stock < 10 ? `⚠ ${p.stock} left` : `${p.stock} in stock`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="cart">
        <div className="cart-head">
          <div className="cart-title">Cart {itemCount > 0 && <span className="cart-count">{itemCount}</span>}</div>
          {cartItems.length > 0 &&
            <button className="clear-btn" onClick={() => setCart({})}>Clear</button>}
        </div>
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p style={{fontSize:13}}>No items yet</p>
              <p style={{fontSize:11,color:"#1e293b"}}>Click products to add</p>
            </div>
          ) : cartItems.map(({ product, qty }) => (
            <div key={product.id} className="cart-item">
              <div className="ci-icon">{getIcon(product.name)}</div>
              <div className="ci-info">
                <div className="ci-name">{product.name}</div>
                <div className="ci-unit">{fmt(product.price)} each</div>
              </div>
              <div className="ci-right">
                <div className="ci-sub">{fmt(parseFloat(product.price)*qty)}</div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => changeQty(product.id,-1)}>−</button>
                  <span className="qty-num">{qty}</span>
                  <button className="qty-btn" onClick={() => changeQty(product.id,+1)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-foot">
          <div className="summary">
            <div className="sum-row"><span>{itemCount} items</span><span>{fmt(grandTotal)}</span></div>
            <div className="sum-row total"><span>Total</span><span>{fmt(grandTotal)}</span></div>
          </div>
          <button className="checkout-btn" disabled={cartItems.length === 0}
            onClick={handleCheckout}>Checkout →</button>
        </div>
      </div>

      {receipt && <Receipt receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

// ─── ANALYTICS PAGE ───
function AnalyticsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/analytics/`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content"><div className="loading">Loading analytics...</div></div>;
  if (!data)   return <div className="page-content"><div className="loading">Failed to load</div></div>;

  const totalRevenue = data.daily_revenue.reduce((s, d) => s + parseFloat(d.revenue || 0), 0);
  const avgDaily     = data.daily_revenue.length > 0 ? totalRevenue / data.daily_revenue.length : 0;
  const topRevenue   = data.top_products[0]?.total || 0;

  const chartData = data.daily_revenue.map(d => ({
    day: new Date(d.day).toLocaleDateString("en-LK", { month: "short", day: "numeric" }),
    revenue: parseFloat(d.revenue || 0).toFixed(0)
  }));

  return (
    <div className="page-content">
      <div className="page-header" style={{marginBottom:20}}>
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-subtitle">Last 30 days performance</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue (30d)</div>
          <div className="stat-value green">{fmt(totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Daily Average</div>
          <div className="stat-value blue">{fmt(avgDaily)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Top Product Revenue</div>
          <div className="stat-value">{fmt(topRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Days with Sales</div>
          <div className="stat-value">{data.daily_revenue.length}</div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-title">📈 Daily Revenue — Last 30 Days</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{top:5,right:10,left:10,bottom:5}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
            <XAxis dataKey="day" tick={{fill:"#475569",fontSize:10}} tickLine={false} />
            <YAxis tick={{fill:"#475569",fontSize:10}} tickLine={false} axisLine={false}
              tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{background:"#0d1526",border:"1px solid #1a2540",borderRadius:8,color:"#e2e8f0"}}
              formatter={v => [fmt(v), "Revenue"]} />
            <Bar dataKey="revenue" fill="#2563eb" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <div className="chart-title">🏆 Top 5 Products by Revenue</div>
        <table className="top-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product</th>
              <th style={{textAlign:"right"}}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.top_products.map((p, i) => (
              <tr key={i}>
                <td>
                  <span className={`rank-badge ${i===0?"gold":i===1?"silver":i===2?"bronze":""}`}>
                    {i+1}
                  </span>
                </td>
                <td style={{color:"#e2e8f0"}}>{getIcon(p.product__name)} {p.product__name}</td>
                <td style={{textAlign:"right",color:"#3b82f6",fontFamily:"'JetBrains Mono',monospace",fontSize:13}}>
                  {fmt(p.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PRODUCTS PAGE ───
function ProductsPage({ toast }) {
  const [products, setProducts] = useState([]);
  const [form, setForm]         = useState({ name:"", price:"", stock:"" });

  const load = () =>
    axios.get(`${API}/products/all/`).then(r => setProducts(r.data));

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.price || !form.stock) {
      toast("Please fill all fields", "error"); return;
    }
    try {
      await axios.post(`${API}/products/add/`, {
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock)
      });
      setForm({ name:"", price:"", stock:"" });
      load();
      toast(`${form.name} added successfully!`);
    } catch (e) {
      toast("Failed to add product", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await axios.delete(`${API}/products/${id}/delete/`);
      load();
      toast(`${name} deleted`);
    } catch { toast("Failed to delete", "error"); }
  };

  return (
    <div className="page-content">
      <div className="page-header" style={{marginBottom:20}}>
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">Manage your product catalog</div>
        </div>
      </div>

      <div className="add-form">
        <div className="form-title">➕ Add New Product</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input className="form-input" placeholder="e.g. Kottu Roti"
              value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Price (Rs.)</label>
            <input className="form-input" type="number" placeholder="350"
              value={form.price} onChange={e => setForm({...form, price:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Stock</label>
            <input className="form-input" type="number" placeholder="50"
              value={form.stock} onChange={e => setForm({...form, stock:e.target.value})} />
          </div>
          <button className="add-btn" onClick={handleAdd}>Add Product</button>
        </div>
      </div>

      <div className="products-list">
        <div className="list-header">
  <span>Product</span><span>Price</span><span>Stock</span>
  <span>Status</span><span>Actions</span>
</div>
        {products.map(p => (
  <div key={p.id} className="list-row">
    <div className="list-name">
      <span style={{fontSize:20}}>{getIcon(p.name)}</span>{p.name}
    </div>
    <div className="list-price">{fmt(p.price)}</div>
    <div className="list-stock">{p.stock}</div>
    <div>
      <span className={`stock-badge ${p.stock===0?"out":p.stock<10?"low":"ok"}`}>
        {p.stock===0?"Out of Stock":p.stock<10?"Low Stock":"In Stock"}
      </span>
    </div>
    <div style={{display:"flex", gap:6}}>
      <button className="add-btn"
        style={{height:30, padding:"0 10px", fontSize:11}}
        onClick={() => {
          const amt = prompt(`Add stock for ${p.name}:`);
          if (amt && !isNaN(amt) && parseInt(amt) > 0) {
            axios.post(`${API}/products/${p.id}/restock/`, { amount: parseInt(amt) })
              .then(() => { load(); toast(`Added ${amt} units to ${p.name}`); })
              .catch(() => toast("Failed to restock", "error"));
          }
        }}>+Stock</button>
      <button className="del-btn" onClick={() => handleDelete(p.id, p.name)}>🗑</button>
    </div>
  </div>
))}
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ───
function SettingsPage() {
  return (
    <div className="page-content">
      <div className="page-header" style={{marginBottom:20}}>
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">System configuration</div>
        </div>
      </div>
      <div className="add-form">
        <div className="form-title">🏪 Store Information</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:8}}>
          {[["Store Name","Rashmi POS"],["Location","Colombo, Sri Lanka"],
            ["Currency","LKR (Rs.)"],["Tax Rate","0%"]].map(([l,v]) => (
            <div key={l} className="form-group">
              <label className="form-label">{l}</label>
              <input className="form-input" defaultValue={v} />
            </div>
          ))}
        </div>
        <button className="add-btn" style={{marginTop:16}}
          onClick={() => alert("Settings saved!")}>Save Settings</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [page, setPage]   = useState("pos");
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = "success") => setToastMsg({ msg, type });

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="sidebar">
          <div className="brand">
            <div className="brand-name">Rashmi<span>POS</span></div>
            <div className="brand-sub">Point of Sale</div>
          </div>
          <div className="nav-section">
            <div className="nav-label">Menu</div>
            {[
              { id:"pos",       icon:"🧾", label:"New Sale" },
              { id:"analytics", icon:"📊", label:"Analytics" },
              { id:"products",  icon:"📦", label:"Products" },
              { id:"settings",  icon:"⚙️",  label:"Settings" }
            ].map(n => (
              <button key={n.id}
                className={`nav-btn ${page === n.id ? "active" : ""}`}
                onClick={() => setPage(n.id)}>
                <span className="icon">{n.icon}</span>{n.label}
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <p>Rashmi POS v1.0</p>
            <p style={{marginTop:4}}>© 2026 All rights reserved</p>
          </div>
        </div>

        {page === "pos"       && <POSPage toast={showToast} />}
        {page === "analytics" && <AnalyticsPage />}
        {page === "products"  && <ProductsPage toast={showToast} />}
        {page === "settings"  && <SettingsPage />}
      </div>

      {toastMsg && (
        <Toast msg={toastMsg.msg} type={toastMsg.type}
          onClose={() => setToastMsg(null)} />
      )}
    </>
  );
}