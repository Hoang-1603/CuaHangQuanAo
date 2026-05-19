import React, { useState, useEffect } from 'react';

// --- SUB-COMPONENT: PRODUCT CARD ---
const ProductCard = ({ product, onQuickView, navigate }) => {
  const [showActions, setShowActions] = useState(false);
  
  // Tương thích với cả data.js (dùng id, img) và database thật (dùng _id, images mảng)
  const pId = product._id || product.id;
  const pImg = product.images && product.images.length > 0 ? product.images[0] : product.img;

  return (
    <div
      style={{ width: '23.5%', marginBottom: '40px', position: 'relative' }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* KHÓA TỶ LỆ KHUNG HÌNH 3/4 VÀ CẮT ẢNH GỌN GÀNG */}
      <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4', backgroundColor: '#f5f5f5' }}>
        <img 
          src={pImg} 
          alt={product.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
          onError={e => e.target.src = 'https://via.placeholder.com/300x400?text=Binh+Minh'}
        />
        {showActions && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', display: 'flex', background: '#000', alignItems: 'center', zIndex: 10 }}>
            <button
              onClick={() => onQuickView(product)}
              style={{ flex: 1, border: 'none', padding: '12px 0', background: 'none', color: '#fff', cursor: 'pointer', fontWeight: '500', fontSize: '11px' }}
            >
              MUA NHANH
            </button>
            <div style={{ width: '1px', height: '14px', background: '#555' }}></div>
            <button
              onClick={() => navigate(`/product/${pId}`)}
              style={{ flex: 1, border: 'none', padding: '12px 0', background: 'none', color: '#fff', cursor: 'pointer', fontWeight: '500', fontSize: '11px' }}
            >
              XEM CHI TIẾT
            </button>
          </div>
        )}
      </div>
      <div
        style={{ textAlign: 'center', marginTop: '15px', cursor: 'pointer' }}
        onClick={() => navigate(`/product/${pId}`)}
      >
        {/* CẮT TÊN QUÁ DÀI BẰNG DẤU ... */}
        <div style={{ fontSize: '13px', color: '#333', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 5px' }}>
          {product.name}
        </div>
        <div style={{ fontWeight: '700', fontSize: '14px', color: '#000' }}>
          {product.price?.toLocaleString()}đ
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: QUICK VIEW MODAL ---
const QuickViewModal = ({ product, onClose, navigate, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState('L');
  const [added, setAdded] = useState(false);
  if (!product) return null;

  const pId = product._id || product.id;
  const pImg = product.images && product.images.length > 0 ? product.images[0] : product.img;

  const handleBuy = () => {
    if (onAddToCart) onAddToCart(product, selectedSize, 'Đen', 1);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 900);
  };

  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      onClick={e => {
        // Chỉ đóng modal khi click ra ngoài vùng trắng
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{ backgroundColor: '#fff', width: '850px', padding: '40px', display: 'flex', position: 'relative', gap: '40px' }}
      >
        <button
          style={{ position: 'absolute', right: '15px', top: '10px', border: 'none', background: 'none', fontSize: '28px', cursor: 'pointer', color: '#ccc' }}
          onClick={onClose}
        >&times;</button>
        <div style={{ flex: 1.2 }}>
          <img src={pImg} alt={product.name} style={{ width: '100%' }} onError={e => e.target.src = 'https://via.placeholder.com/600x750?text=Binh+Minh'} />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '5px' }}>{product.name}</h2>
          <p style={{ color: '#888', fontSize: '12px', marginBottom: '15px' }}>Tình trạng: <span style={{ color: '#000' }}>Còn hàng</span></p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#000', marginBottom: '25px' }}>{product.price?.toLocaleString()}đ</p>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>MÀU SẮC</p>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #000', padding: '2px', cursor: 'pointer' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#333' }}></div>
            </div>
          </div>
          <div style={{ marginBottom: '30px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>KÍCH THƯỚC</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['M', 'L', 'XL', '2XL', '3XL'].map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{ padding: '8px 15px', border: selectedSize === size ? '1px solid #000' : '1px solid #eee', background: selectedSize === size ? '#000' : '#fff', color: selectedSize === size ? '#fff' : '#000', cursor: 'pointer', fontSize: '12px', fontWeight: selectedSize === size ? '700' : '400' }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleBuy}
            style={{ width: '100%', padding: '16px', background: added ? '#555' : '#000', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '13px', letterSpacing: '1px', transition: 'background .2s' }}
          >
            {added ? '✓ ĐÃ THÊM VÀO GIỎ' : 'SỞ HỮU NGAY'}
          </button>
          <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <span
              onClick={() => { onClose(); navigate(`/product/${pId}`); }}
              style={{ fontSize: '12px', color: '#888', textDecoration: 'none', display: 'block', textAlign: 'center', cursor: 'pointer' }}
            >
              Xem chi tiết sản phẩm &gt;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
const Home = ({ navigate, onAddToCart }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dbProducts, setDbProducts] = useState([]); // Chứa 100% dữ liệu từ Database

  // Kéo dữ liệu từ API Backend khi load trang
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbProducts(data);
      })
      .catch(err => console.error("Lỗi kết nối API:", err));
  }, []);

  // Map tiêu đề section → category slug
  const SECTION_SLUG = {
    "ÁO THU ĐÔNG": "ao-thu-dong",
    "ÁO XUÂN HÈ": "ao-xuan-he",
    "QUẦN NAM": "quan",
    "PHỤ KIỆN": "phu-kien",
  };

  // Khai báo các từ khóa để lọc chuẩn xác cho từng nhóm
  const catThuDong = ['Áo Thu Đông', 'Áo Nỉ / Áo Thun Dài Tay', 'Áo Len', 'Áo Khoác', 'Cardigan', 'Áo Hoodie'];
  const catXuanHe = ['Áo Xuân Hè', 'Áo Phông', 'Áo Polo', 'Áo Sơ Mi Ngắn Tay', 'Áo Tank Top', 'Áo Sơ Mi Dài Tay'];
  const catQuan = ['Quần Nam', 'Quần', 'Quần Dài', 'Quần Short'];
  const catPhuKien = ['Phụ Kiện', 'Túi/Balo', 'Túi / Balo', 'Giày Dép', 'Dây Lưng', 'Mũ', 'Tất'];

  // Bóc tách sản phẩm theo từng nhóm hoàn toàn bằng dữ liệu thật
  const listThuDong = dbProducts.filter(p => catThuDong.includes(p.category));
  const listXuanHe = dbProducts.filter(p => catXuanHe.includes(p.category));
  const listQuanNam = dbProducts.filter(p => catQuan.includes(p.category));
  const listPhuKien = dbProducts.filter(p => catPhuKien.includes(p.category));

  const renderSection = (title, subCats, products) => {
    const slug = SECTION_SLUG[title] || '';
    return (
      <div style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '25px' }}>
          <h2
            style={{ fontSize: '22px', fontWeight: '800', margin: 0, cursor: slug ? 'pointer' : 'default' }}
            onClick={() => slug && navigate(`/category/${slug}`)}
            title={slug ? `Xem tất cả ${title}` : ''}
          >
            {title}
          </h2>
          <div style={{ display: 'flex' }}>
            {subCats.map(cat => (
              <span
                key={cat}
                onClick={() => slug && navigate(`/category/${slug}?sub=${encodeURIComponent(cat)}`)}
                style={{
                  fontSize: '13px', fontWeight: '500', cursor: 'pointer', position: 'relative',
                  marginLeft: '20px', transition: '0.2s', color: '#888',
                  borderBottom: '1px solid transparent', paddingBottom: '2px',
                }}
                onMouseEnter={e => { e.target.style.color = '#000'; e.target.style.borderBottomColor = '#000'; }}
                onMouseLeave={e => { e.target.style.color = '#888'; e.target.style.borderBottomColor = 'transparent'; }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        {/* Render danh sách sản phẩm */}
        {products.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2%' }}>
            {products.map(item => (
              <ProductCard key={item._id || item.id} product={item} onQuickView={setSelectedProduct} navigate={navigate} />
            ))}
          </div>
        ) : (
          <p style={{ color: '#aaa', fontSize: '14px', fontStyle: 'italic', margin: '20px 0' }}>Chưa có sản phẩm nào trong mục này.</p>
        )}
      </div>
    );
  };

  return (
    <main style={{ width: '100%' }}>
      <section style={{ width: '100%', lineHeight: 0 }}>
        <img
          src="/images/banner.jpg"
          alt="Banner"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </section>

      <div style={{ padding: '50px 7%' }}>
        {renderSection("ÁO THU ĐÔNG", ["Áo Nỉ / Áo Thun Dài Tay", "Áo Len", "Áo Khoác"], listThuDong)}
        {renderSection("ÁO XUÂN HÈ", ["Áo Phông", "Áo Polo", "Áo Sơ Mi Ngắn Tay"], listXuanHe)}
        {renderSection("QUẦN NAM", ["Quần Dài", "Quần Short"], listQuanNam)}
        {renderSection("PHỤ KIỆN", ["Túi / Balo", "Giày Dép", "Dây Lưng", "Mũ", "Tất"], listPhuKien)}
      </div>

      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        navigate={navigate}
        onAddToCart={onAddToCart}
      />
    </main>
  );
};

export default Home;