import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import AccountPage from "./pages/AccountPage";
import EditProfilePage from "./pages/EditProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import OrdersPage from "./pages/OrdersPage";
import WishlistPage from "./pages/WishlistPage";
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminCustomers from './pages/Admin/AdminCustomers';
import AdminCoupons from './pages/Admin/AdminCoupons';

// ——— CUSTOM ROUTER HOOK ———
function useRouter() {
  const getState = () => ({ path: window.location.pathname, search: window.location.search });
  const [loc, setLoc] = useState(getState);
  
  useEffect(() => {
    const onPop = () => setLoc(getState());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (to) => {
    window.history.pushState(null, "", to);
    setLoc(getState());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  return { path: loc.path, search: loc.search, navigate };
}

// Helper: lấy cart key theo email
const cartKey = (email) => `cart_${email}`;
const wishlistKey = (email) => `wishlist_${email}`;

function App() {
  const { path, search, navigate } = useRouter();

  // ——— USER AUTH ———
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });

  const [pendingAction, setPendingAction] = useState(null);
  const [pendingWishlist, setPendingWishlist] = useState(null);

  // ——— STATE GIỎ HÀNG — khởi tạo từ localStorage nếu đã đăng nhập ———
  const [cartItems, setCartItems] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      const saved = localStorage.getItem(cartKey(u.email));
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [orders, setOrders] = useState([]);

  // ——— WISHLIST — khởi tạo từ localStorage ———
  const [wishlist, setWishlist] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      const saved = localStorage.getItem(wishlistKey(u.email));
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // ——— PERSIST CART vào localStorage mỗi khi thay đổi ———
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(cartKey(user.email), JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // ——— PERSIST WISHLIST vào localStorage ———
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(wishlistKey(user.email), JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  // ——— XỬ LÝ ĐĂNG NHẬP / ĐĂNG XUẤT ———
  const handleLogin = (u) => {
    localStorage.setItem('userInfo', JSON.stringify(u));

    // Load cart và wishlist từ localStorage của user này
    const savedCart = localStorage.getItem(cartKey(u.email));
    const savedWishlist = localStorage.getItem(wishlistKey(u.email));

    setUser(u);
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
    setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);

    // Xử lý các hành động chờ
    if (pendingWishlist) {
      const { product, returnPath } = pendingWishlist;
      setWishlist(prev => {
        const exists = prev.find(p => p._id === product._id);
        return exists ? prev : [...prev, product];
      });
      setPendingWishlist(null);
      navigate(returnPath || '/');
    }

    if (pendingAction) {
      const { product, size, color, qty, openCart, returnPath } = pendingAction;
      addToCart(product, size, color, qty, openCart);
      setPendingAction(null);
      if (!openCart) navigate('/checkout');
      else { setIsCartOpen(true); navigate(returnPath || '/'); }
    } else if (window.location.pathname === '/login') {
      if (u.isAdmin || u.role) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  const handleLogout = () => {
    // Cart đã được lưu vào localStorage theo email, không cần xóa — user F5 lại vẫn còn
    localStorage.removeItem('userInfo');
    setUser(null);
    setCartItems([]);
    setOrders([]);
    setWishlist([]);
    setIsCartOpen(false);
    navigate('/');
  };

  const handleUpdateUser = (u) => {
    setUser(u);
    localStorage.setItem('userInfo', JSON.stringify(u));
  };

  // ——— QUẢN LÝ GIỎ HÀNG ———
  const addToCart = (product, size, color, qty, openCart = true) => {
    if (!user) {
      setPendingAction({ product, size, color, qty, openCart, returnPath: window.location.pathname });
      navigate('/login');
      return;
    }
    setCartItems(prev => {
      const key = (product._id || product.id) + '-' + size + '-' + color;
      const ex = prev.find(i => i.key === key);
      if (ex) return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { key, product, size, color, qty }];
    });
    if (openCart) setIsCartOpen(true);
  };

  const removeFromCart = (key) => setCartItems(prev => prev.filter(i => i.key !== key));
  const updateQty = (key, delta) => setCartItems(prev =>
    prev.map(i => i.key === key ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
  );
  const clearCart = () => setCartItems([]);

  // ——— QUẢN LÝ ĐƠN HÀNG & YÊU THÍCH ———
  const addOrder = (orderData) => {
    setOrders(prev => [orderData, ...prev]);
  };

  const cancelOrder = (orderId) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Đã hủy' } : o));
  };

  const toggleWishlist = (product) => {
    if (!user) {
      setPendingWishlist({ product, returnPath: window.location.pathname });
      navigate('/login');
      return;
    }
    setWishlist(prev => {
      const exists = prev.find(p => p._id === product._id);
      return exists ? prev.filter(p => p._id !== product._id) : [...prev, product];
    });
  };

  const isWishlisted = (productId) => wishlist.some(p => p._id === productId);

  // ——— TÍNH TOÁN TỔNG ———
  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) =>
    s + (i.product.price || 0) * i.qty, 0
  );

  const requireAuth = (page) => {
    if (!user) { navigate('/login'); return null; }
    if (!user.isAdmin && !user.role) { navigate('/'); return null; }
    return page;
  };

  // ——— ĐỊNH NGHĨA ROUTES ———
  const productMatch  = path.match(/^\/product\/([a-f\d]{24})$/);
  const categoryMatch = path.match(/^\/category\/([^/]+)$/);
  const q = new URLSearchParams(search);

  const renderPage = () => {
    if (productMatch)  return <ProductDetail productId={productMatch[1]} navigate={navigate} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} isWishlisted={isWishlisted} />;
    if (categoryMatch) return <CategoryPage slug={categoryMatch[1]} initialSubCat={q.get("sub") || "Tất cả"} navigate={navigate} />;
    
    switch (path) {
      case "/search":                return <SearchPage query={q.get("q") || ""} navigate={navigate} />;
      case "/checkout":              return requireAuth(<CheckoutPage cartItems={cartItems} totalPrice={totalPrice} navigate={navigate} removeFromCart={removeFromCart} updateQty={updateQty} clearCart={clearCart} addOrder={addOrder} user={user} />);
      case "/login":                 return <LoginPage navigate={navigate} onLogin={handleLogin} />;
      case "/account":               return requireAuth(<AccountPage user={user} onLogout={handleLogout} navigate={navigate} />);
      case "/account/edit":          return requireAuth(<EditProfilePage user={user} onUpdateUser={handleUpdateUser} navigate={navigate} />);
      case "/account/change-password": return requireAuth(<ChangePasswordPage navigate={navigate} />);
      case "/account/orders":        return requireAuth(<OrdersPage navigate={navigate} orders={orders} cancelOrder={cancelOrder} />);
      case "/account/wishlist":      return requireAuth(<WishlistPage navigate={navigate} wishlist={wishlist} onToggleWishlist={toggleWishlist} onAddToCart={addToCart} />);
      case "/admin/dashboard":       return requireAuth(<AdminDashboard user={user} navigate={navigate} onLogout={handleLogout} />);
      case "/admin/products":        return requireAuth(<AdminProducts user={user} navigate={navigate} onLogout={handleLogout} />);
      case "/admin/orders":          return requireAuth(<AdminOrders user={user} navigate={navigate} onLogout={handleLogout} />);
      case "/admin/customers":       return requireAuth(<AdminCustomers user={user} navigate={navigate} onLogout={handleLogout} />);
      case "/admin/coupons":         return requireAuth(<AdminCoupons user={user} navigate={navigate} onLogout={handleLogout} />);
      default:                       return <Home navigate={navigate} onAddToCart={addToCart} />;
    }
  };

  const isAdminRoute = path.startsWith('/admin');

  return (
    <div style={{ paddingTop: "100px", backgroundColor: "#fff" }}>
      <Header
        navigate={navigate}
        currentQuery={path === "/search" ? q.get("q") || "" : ""}
        cartItems={cartItems} totalItems={totalItems} totalPrice={totalPrice}
        isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen}
        removeFromCart={removeFromCart} updateQty={updateQty}
        user={user} onLogout={handleLogout}
      />
      {renderPage()}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;