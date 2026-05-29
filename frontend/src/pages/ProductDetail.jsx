import React, { useState, useEffect } from 'react';
import api from '../api/api';
 
// Từ điển ánh xạ tên màu → mã HEX
const colorDictionary = {
  'Đen': '#1a1a1a',
  'Xám': '#888888',
  'Navy': '#1B2A4A',
  'Trắng': '#ffffff',
  'Đỏ': '#e53935',
  'Vàng': '#ffb300',
  'Xanh lá': '#43a047',
  'Be': '#f5f5dc',
  'Nâu': '#795548',
  'Hồng': '#f48fb1',
  'Xanh': '#2196F3',
};
 
const productExtras = {
  default: {
    colors: [
      { name: 'Đen', hex: '#1a1a1a' },
      { name: 'Xám', hex: '#888888' },
      { name: 'Navy', hex: '#1B2A4A' },
    ],
    sizes: ['M', 'L', 'XL', '2XL', '3XL'],
    description: `
      <p>Sản phẩm được làm từ chất liệu cao cấp, thoáng mát và bền bỉ. Thiết kế hiện đại, phù hợp với nhiều dịp khác nhau từ đi học, đi làm đến dạo phố.</p>
      <ul>
        <li>Chất liệu: Cotton 100% cao cấp</li>
        <li>Kiểu dáng: Regular / Relaxed fit</li>
        <li>Phong cách: Casual, streetwear</li>
        <li>Bảo quản: Giặt máy ở nhiệt độ thấp, không dùng chất tẩy mạnh</li>
      </ul>
    `,
    sizeGuide: [
      { size: 'M',   chest: '88–94',   waist: '72–78', height: '160–168' },
      { size: 'L',   chest: '94–100',  waist: '78–84', height: '168–175' },
      { size: 'XL',  chest: '100–106', waist: '84–90', height: '175–182' },
      { size: '2XL', chest: '106–112', waist: '90–96', height: '182–188' },
      { size: '3XL', chest: '112–120', waist: '96–104', height: '188–195' },
    ],
  },
};
 
const ProductDetail = ({ productId, navigate, onAddToCart, onToggleWishlist, isWishlisted }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState('');
  const [dbProducts, setDbProducts] = useState([]); // Toàn bộ sản phẩm từ DB
 
  const extras = productExtras.default;
 
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
 
  // Gọi API lấy tất cả sản phẩm (dùng cho cả chi tiết lẫn related)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
 
    api.get('/api/products')
      .then(res => {
        if (Array.isArray(res.data)) {
          setDbProducts(res.data);
          const found = res.data.find(p => String(p._id) === String(productId));
          setProduct(found || null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi kết nối API:', err);
        setLoading(false);
      });
  }, [productId]);
 
  // Cập nhật ảnh và variants khi có sản phẩm
  useEffect(() => {
    if (product) {
      const firstImg = product.images && product.images.length > 0 ? product.images[0] : '';
      setMainImg(firstImg);
 
      const hasVariants = product.variants && product.variants.length > 0;
      
      let uniqueColors = [];
      let uniqueSizes = [];
 
      if (hasVariants) {
        const colorSet = new Set(product.variants.map(v => v.color));
        const sizeSet = new Set(product.variants.map(v => v.size));
        uniqueColors = Array.from(colorSet).map(cName => ({
          name: cName,
          hex: colorDictionary[cName] || '#cccccc'
        }));
        uniqueSizes = Array.from(sizeSet);
      } else {
        uniqueColors = extras.colors;
        uniqueSizes = extras.sizes;
      }
 
      setAvailableColors(uniqueColors);
      setAvailableSizes(uniqueSizes);
 
      if (uniqueColors.length > 0) setSelectedColor(uniqueColors[0]);
      if (uniqueSizes.length > 0) setSelectedSize(uniqueSizes[0]);
      setQty(1);
    }
  }, [product]);
 
  if (loading) return <div style={{ padding: '120px 10%', textAlign: 'center' }}>Đang tải sản phẩm...</div>;
 
  if (!product) {
    return (
      <div style={{ padding: '120px 10%', textAlign: 'center' }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <button onClick={() => navigate('/')} style={{ marginTop: 16, padding: '12px 30px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          ← Về trang chủ
        </button>
      </div>
    );
  }
 
  // Related: thuật toán scoring — ưu tiên sản phẩm liên quan nhất
  const getRelatedScore = (p) => {
    let score = 0;
    if (p.category === product.category) score += 40;       // cùng danh mục: +40
    if (p.gender === product.gender) score += 20;           // cùng giới tính: +20
    if (p.brand === product.brand && p.brand) score += 15; // cùng thương hiệu: +15
    if (p.material === product.material && p.material) score += 10; // cùng chất liệu: +10
    // Cùng từ khóa trong tên (vd: "áo ni", "quần âu"...)
    const words = (product.name || '').toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const pName = (p.name || '').toLowerCase();
    const matchedWords = words.filter(w => pName.includes(w)).length;
    score += matchedWords * 5;
    // Cùng khoảng giá (±30%)
    if (product.price && p.price) {
      const ratio = p.price / product.price;
      if (ratio >= 0.7 && ratio <= 1.3) score += 5;
    }
    return score;
  };
 
  const relatedFallback = dbProducts
    .filter(p => String(p._id) !== String(productId))
    .map(p => ({ ...p, _score: getRelatedScore(p) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 4);
 
  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert('Vui lòng chọn màu sắc và kích thước!');
      return;
    }
    if (onAddToCart) onAddToCart(product, selectedSize, selectedColor.name, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };
 
  const galleryImages = product.images && product.images.length > 0 ? product.images : [];
 
  const currentVariant = product.variants?.find(
    v => v.color === selectedColor?.name && v.size === selectedSize
  );
  const displayPrice = currentVariant?.price ? currentVariant.price : product.price;
 
  return (
    <div style={{ paddingTop: 0, fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        .pd-breadcrumb a { color: #888; font-size: 12px; text-decoration: none; }
        .pd-breadcrumb a:hover { color: #000; }
        .pd-thumb { cursor: pointer; border: 2px solid transparent; transition: .2s; }
        .pd-thumb:hover, .pd-thumb.active { border-color: #000; }
        .pd-color-dot { width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; padding: 2px; transition: .2s; }
        .pd-color-dot.active { border-color: #000; }
        .pd-size-btn { padding: 8px 14px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-size: 12px; font-weight: 500; transition: .2s; min-width: 50px; }
        .pd-size-btn:hover { border-color: #000; }
        .pd-size-btn.active { border: 1.5px solid #000; font-weight: 700; background: #000; color: #fff; }
        .pd-tab-btn { background: none; border: none; border-bottom: 2px solid transparent; padding: 10px 0; cursor: pointer; font-size: 13px; font-weight: 600; margin-right: 30px; color: #888; transition: .2s; }
        .pd-tab-btn.active { border-bottom-color: #000; color: #000; }
        .pd-related-card { cursor: pointer; }
        .pd-related-card:hover img { transform: scale(1.05) !important; }
        .size-table td, .size-table th { padding: 8px 16px; border: 1px solid #eee; font-size: 12px; text-align: center; }
        .size-table th { background: #f5f5f5; font-weight: 700; }
        .qty-btn { width: 34px; height: 34px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
        .qty-btn:hover { background: #f5f5f5; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .pd-root { animation: fadeIn .35s ease; }
      `}</style>
 
      <div className="pd-root" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 5% 60px' }}>
 
        <div className="pd-breadcrumb" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24, fontSize: 12 }}>
          <a href="#" onClick={e => { e.preventDefault(); navigate('/'); }}>Trang chủ</a>
          <span style={{ color: '#ccc' }}>/</span>
          <span style={{ color: '#333' }}>{product.name}</span>
        </div>
 
        <div style={{ display: 'flex', gap: 50, alignItems: 'flex-start', marginBottom: 60 }}>
 
          {/* LEFT: Gallery */}
          <div style={{ flex: '0 0 55%', display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {galleryImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Thumbnail ${i}`}
                  onClick={() => setMainImg(src)}
                  className={`pd-thumb ${mainImg === src ? 'active' : ''}`}
                  style={{ width: 72, height: 90, objectFit: 'cover', display: 'block' }}
                  onError={e => e.target.src = 'https://via.placeholder.com/72x90?text=IMG'}
                />
              ))}
            </div>
 
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
              <img
                src={mainImg}
                alt={product.name}
                style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                onError={e => e.target.src = 'https://via.placeholder.com/600x750?text=Binh+Minh'}
              />
              <div style={{ position: 'absolute', top: 12, left: 12, background: '#e53935', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 2 }}>
                MỚI
              </div>
            </div>
          </div>
 
          {/* RIGHT: Thông tin sản phẩm */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', color: '#111', letterSpacing: 0.3 }}>{product.name}</h1>
 
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#000' }}>{displayPrice?.toLocaleString()}đ</span>
            </div>
 
            <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: 20 }} />
 
            {/* Màu sắc */}
            {availableColors.length > 0 && selectedColor && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10, color: '#333' }}>
                  Màu sắc: <span style={{ color: '#000', fontWeight: 900 }}>{selectedColor.name}</span>
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {availableColors.map(c => (
                    <div
                      key={c.name}
                      className={`pd-color-dot ${selectedColor.name === c.name ? 'active' : ''}`}
                      onClick={() => setSelectedColor(c)}
                      title={c.name}
                    >
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: c.hex }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
 
            {/* Size */}
            {availableSizes.length > 0 && selectedSize && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#333', margin: 0 }}>
                    Kích thước: <span style={{ color: '#000', fontWeight: 900 }}>{selectedSize}</span>
                  </p>
                  <span onClick={() => setShowSizeGuide(!showSizeGuide)} style={{ fontSize: 11, color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>
                    📏 Hướng dẫn chọn size
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {availableSizes.map(s => (
                    <button key={s} className={`pd-size-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
                  ))}
                </div>
 
                {showSizeGuide && (
                  <div style={{ marginTop: 16, border: '1px solid #eee', padding: 16, borderRadius: 4, background: '#fafafa' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#333' }}>BẢNG SIZE (cm)</p>
                    <table className="size-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <thead>
                        <tr><th>Size</th><th>Vòng ngực</th><th>Vòng eo</th><th>Chiều cao</th></tr>
                      </thead>
                      <tbody>
                        {extras.sizeGuide.map(row => (
                          <tr key={row.size} style={{ background: row.size === selectedSize ? '#fff8f0' : 'transparent' }}>
                            <td style={{ fontWeight: row.size === selectedSize ? 700 : 400 }}>{row.size}</td>
                            <td>{row.chest}</td><td>{row.waist}</td><td>{row.height}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
 
            {/* Số lượng */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#333', textTransform: 'uppercase' }}>Số lượng:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span style={{ width: 40, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(currentVariant?.stock || 99, q + 1))}>+</button>
              </div>
              <span style={{ fontSize: 12, color: '#888' }}>
                {currentVariant ? `Còn ${currentVariant.stock} sản phẩm` : 'Còn hàng'}
              </span>
            </div>
 
            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button
                onClick={handleAddToCart}
                disabled={currentVariant && currentVariant.stock === 0}
                style={{
                  flex: 1, padding: '15px', border: '1.5px solid #000',
                  background: currentVariant?.stock === 0 ? '#f5f5f5' : '#fff',
                  color: currentVariant?.stock === 0 ? '#aaa' : '#000',
                  fontWeight: 700, fontSize: 13, cursor: currentVariant?.stock === 0 ? 'not-allowed' : 'pointer',
                  letterSpacing: 1, transition: '.2s'
                }}
              >
                {addedToCart ? '✓ ĐÃ THÊM VÀO GIỎ' : (currentVariant?.stock === 0 ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG')}
              </button>
              <button
                disabled={currentVariant && currentVariant.stock === 0}
                onClick={() => {
                  if (onAddToCart) onAddToCart(product, selectedSize, selectedColor.name, qty, false);
                  navigate('/checkout');
                }}
                style={{
                  flex: 1, padding: '15px', background: currentVariant?.stock === 0 ? '#ccc' : '#000',
                  color: '#fff', fontWeight: 700, fontSize: 13, border: 'none',
                  cursor: currentVariant?.stock === 0 ? 'not-allowed' : 'pointer', letterSpacing: 1
                }}
              >
                MUA NGAY
              </button>
              {/* Nút y��u thích */}
              <button
                onClick={() => onToggleWishlist && onToggleWishlist(product)}
                title={isWishlisted && isWishlisted(product?._id) ? 'Bỏ y��u thích' : 'Thêm vào y��u thích'}
                style={{
                  width: 50, height: 50, borderRadius: '50%', border: '1.5px solid #ddd',
                  background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, transition: 'border-color .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#e53935'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#ddd'}
              >
                <svg width='20' height='20' viewBox='0 0 24 24' fill={isWishlisted && isWishlisted(product?._id) ? '#e53935' : 'none'} stroke={isWishlisted && isWishlisted(product?._id) ? '#e53935' : '#555'} strokeWidth='2'>
                  <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'/>
                </svg>
              </button>
            </div>
 
            {/* Chính sách */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['🚚', 'Miễn phí vận chuyển cho đơn từ 500.000đ'],
                ['🔄', 'Đổi trả miễn phí trong 7 ngày'],
                ['✅', 'Hàng chính hãng 100%, cam kết chất lượng'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#555' }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
 
        {/* Tabs mô tả */}
        <div style={{ borderTop: '2px solid #000', marginBottom: 40 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingTop: 8 }}>
            {[
              { key: 'desc', label: 'Mô tả sản phẩm' },
              { key: 'care', label: 'Hướng dẫn bảo quản' },
            ].map(t => (
              <button key={t.key} className={`pd-tab-btn ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ padding: '24px 0', fontSize: 13, color: '#444', lineHeight: 1.8 }}>
            {activeTab === 'desc' && <div dangerouslySetInnerHTML={{ __html: product.description || extras.description }} />}
            {activeTab === 'care' && (
              <div>
                <p>🧺 Giặt máy ở nhiệt độ dưới 30°C</p>
                <p>🚫 Không dùng thuốc tẩy</p>
                <p>👕 Phơi nơi thoáng mát, tránh ánh nắng trực tiếp</p>
                <p>♨️ Ủi ở nhiệt độ thấp nếu cần</p>
              </div>
            )}
          </div>
        </div>
 
        {/* Sản phẩm liên quan — lấy từ DB, sắp xếp theo độ liên quan */}
        {relatedFallback.length > 0 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, textAlign: 'center', letterSpacing: 2, marginBottom: 0, color: '#222', textTransform: 'uppercase' }}>
              Sản phẩm liên quan
            </h3>
            <div style={{ width: 60, height: 2, background: '#000', margin: '10px auto 28px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
              {relatedFallback.map(p => {
                const pImg = p.images && p.images.length > 0 ? p.images[0] : '';
                const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='375' viewBox='0 0 300 375'%3E%3Crect width='300' height='375' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23bbb' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
                return (
                  <div key={p._id} className="pd-related-card" onClick={() => navigate(`/product/${p._id}`)}
                    style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Khung ảnh cố định tỉ lệ 4:5, mọi ảnh đều cùng chiều cao */}
                    <div style={{
                      width: '100%',
                      paddingTop: '125%',   /* tỉ lệ 4:5 = 125% */
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: '#f5f5f5',
                      flexShrink: 0,
                    }}>
                      <img
                        src={pImg || PLACEHOLDER}
                        alt={p.name}
                        style={{
                          position: 'absolute',
                          top: 0, left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform .3s',
                        }}
                        onError={e => e.target.src = PLACEHOLDER}
                      />
                    </div>
                    {/* Thông tin — luôn nằm dưới ảnh, thẳng hàng */}
                    <div style={{ paddingTop: 12, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                      <p style={{ fontSize: 12, color: '#333', margin: '0 0 6px', fontWeight: 500, lineHeight: 1.4,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.name}
                      </p>
                      <p style={{ fontWeight: 800, fontSize: 14, color: '#000', margin: 0 }}>
                        {p.price?.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default ProductDetail;