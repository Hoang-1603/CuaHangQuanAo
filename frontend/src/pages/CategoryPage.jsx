import React, { useState, useMemo, useEffect } from 'react';

// Map slug → cấu hình tiêu đề và danh mục con
const CATEGORY_MAP = {
  'ao-thu-dong': {
    title: 'Áo Thu Đông',
    subCats: ['Tất cả', 'Áo Nỉ / Áo Thun Dài Tay', 'Áo Len', 'Áo Khoác', 'Cardigan', 'Áo Hoodie'],
  },
  'ao-xuan-he': {
    title: 'Áo Xuân Hè',
    subCats: ['Tất cả', 'Áo Phông', 'Áo Polo', 'Áo Sơ Mi Ngắn Tay', 'Áo Tank Top', 'Áo Sơ Mi Dài Tay'],
  },
  'quan': {
    title: 'Quần Nam',
    subCats: ['Tất cả', 'Quần Dài', 'Quần Short'],
  },
  'phu-kien': {
    title: 'Phụ Kiện',
    subCats: ['Tất cả', 'Túi/Balo', 'Giày Dép', 'Dây Lưng', 'Mũ', 'Tất'],
  },
};

const ALL_COLORS = [
  { name: 'Đen',  hex: '#1a1a1a' },
  { name: 'Trắng', hex: '#f0f0f0', border: true },
  { name: 'Xám',  hex: '#888' },
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Be',   hex: '#D4C5A9' },
  { name: 'Nâu',  hex: '#7B5B3A' },
  { name: 'Xanh', hex: '#2196F3' }
];

const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 150.000đ', min: 0, max: 150000 },
  { label: '150.000 – 300.000đ', min: 150000, max: 300000 },
  { label: '300.000 – 500.000đ', min: 300000, max: 500000 },
  { label: 'Trên 500.000đ', min: 500000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Giá tăng dần', value: 'price_asc' },
  { label: 'Giá giảm dần', value: 'price_desc' },
  { label: 'Tên A → Z', value: 'name_asc' },
];

const parsePrice = (str = '') => {
  if (typeof str === 'number') return str;
  return parseInt((str || '').toString().replace(/,/g, '')) || 0;
};

// ——— Dropdown Filter Component ———
const FilterDropdown = ({ label, children, isOpen, onToggle }) => (
  <div style={{ position: 'relative' }}>
    <button
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: '1px solid #ddd', padding: '6px 14px',
        fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 2,
        color: '#333', whiteSpace: 'nowrap',
      }}
    >
      {label}
      <span style={{ fontSize: 9, marginTop: 1 }}>{isOpen ? '▲' : '▼'}</span>
    </button>
    {isOpen && (
      <div style={{
        position: 'absolute', top: '110%', left: 0, background: '#fff',
        border: '1px solid #eee', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        zIndex: 100, minWidth: 220, padding: 16, borderRadius: 4,
      }}>
        {children}
      </div>
    )}
  </div>
);

// ——— Product Card ———
const ProductCard = ({ product, navigate }) => {
  const [hovered, setHovered] = useState(false);
  const [activeColor, setActiveColor] = useState(0);

  // Tương thích với cả data.js và database thật
  const pId = product._id || product.id;
  const pImg = product.images && product.images.length > 0 ? product.images[0] : product.img;

  // Lấy màu ngẫu nhiên không bị lỗi
  const charCode = pId ? String(pId).charCodeAt(0) : 0;
  const productColors = ALL_COLORS.slice(0, (charCode % 3) + 1);

  return (
    <div
      style={{ cursor: 'pointer', marginBottom: 32 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${pId}`)}
    >
      {/* KHÓA TỶ LỆ KHUNG HÌNH 3/4 */}
      <div style={{ position: 'relative', backgroundColor: '#f5f5f5', overflow: 'hidden', aspectRatio: '3/4' }}>
        <img
          src={pImg}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .35s', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
          onError={e => e.target.src = 'https://via.placeholder.com/300x400?text=Binh+Minh'}
        />
        <div style={{
          position: 'absolute', top: '38%', left: 0, right: 0,
          textAlign: 'center', fontSize: 10, fontWeight: 700,
          letterSpacing: 2, color: 'rgba(0,0,0,0.08)', textTransform: 'uppercase',
          pointerEvents: 'none', userSelect: 'none', lineHeight: 1.8,
        }}>
          BINH MINH STORE<br />
          <span style={{ fontSize: 9 }}>| {String(pId).slice(-4)} |</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 5, marginTop: 10, justifyContent: 'center' }}>
        {productColors.map((c, i) => (
          <div
            key={c.name}
            onClick={e => { e.stopPropagation(); setActiveColor(i); }}
            style={{
              width: 14, height: 14, borderRadius: '50%', background: c.hex, cursor: 'pointer',
              border: c.border ? '1px solid #ccc' : 'none',
              outline: activeColor === i ? '2px solid #000' : '2px solid transparent',
              outlineOffset: 2, transition: '.15s',
            }}
            title={c.name}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        {/* CẮT TÊN QUÁ DÀI BẰNG DẤU ... */}
        <p style={{ fontSize: 12, color: '#333', margin: '0 0 4px', fontWeight: 500, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 5px' }}>
          {product.name}
        </p>
        <p style={{ fontSize: 14, fontWeight: 800, color: '#000', margin: 0 }}>
          {product.price?.toLocaleString()}đ
        </p>
      </div>
    </div>
  );
};

// ——— MAIN PAGE ———
const CategoryPage = ({ slug, initialSubCat = 'Tất cả', navigate }) => {
  const category = CATEGORY_MAP[slug];

  const [dbProducts, setDbProducts] = useState([]); 
  const [openFilter, setOpenFilter] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(PRICE_RANGES[0]);
  const [sortBy, setSortBy] = useState('newest');
  const [activeSubCat, setActiveSubCat] = useState(initialSubCat);

  // Gọi API kéo dữ liệu thật từ MongoDB
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbProducts(data);
      })
      .catch(err => console.error("Lỗi gọi API Category:", err));
  }, []);

  const toggleFilter = (key) => setOpenFilter(prev => prev === key ? null : key);

  const toggleColor = (name) => setSelectedColors(prev =>
    prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
  );
  const toggleSize = (s) => setSelectedSizes(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  );

  const products = useMemo(() => {
    if (!category) return [];

    // BƯỚC 1: LỌC TRỰC TIẾP TỪ DATABASE (Bỏ hoàn toàn việc gộp dữ liệu giả)
    const validSubCats = category.subCats;
    let list = dbProducts.filter(p => {
      if (slug === 'ao-thu-dong') return p.category === 'Áo Thu Đông' || validSubCats.includes(p.category);
      if (slug === 'ao-xuan-he') return p.category === 'Áo Xuân Hè' || p.category === 'Áo Polo' || p.category === 'Áo Phông' || validSubCats.includes(p.category);
      if (slug === 'quan') return p.category === 'Quần Nam' || p.category === 'Quần' || validSubCats.includes(p.category);
      if (slug === 'phu-kien') return p.category === 'Phụ Kiện' || validSubCats.includes(p.category);
      return false;
    });

    // BƯỚC 2: Lọc sản phẩm theo Tab Danh mục con đang chọn
    if (activeSubCat && activeSubCat !== 'Tất cả') {
      list = list.filter(p => p.subCategory === activeSubCat || p.category === activeSubCat);
    }

    // BƯỚC 3: Lọc theo khoảng giá
    if (selectedPrice.max !== Infinity || selectedPrice.min > 0) {
      list = list.filter(p => {
        const price = parsePrice(p.price);
        return price >= selectedPrice.min && price <= selectedPrice.max;
      });
    }

    // BƯỚC 4: Sắp xếp thứ tự hiển thị
    if (sortBy === 'price_asc') list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (sortBy === 'price_desc') list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    if (sortBy === 'name_asc') list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [slug, activeSubCat, selectedColors, selectedSizes, selectedPrice, sortBy, dbProducts, category]);

  if (!category) {
    return (
      <div style={{ padding: '80px 10%', textAlign: 'center' }}>
        <h2>Danh mục không tồn tại</h2>
        <button onClick={() => navigate('/')} style={{ marginTop: 16, padding: '12px 30px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>
          ← Về trang chủ
        </button>
      </div>
    );
  }

  const hasActiveFilter = selectedColors.length > 0 || selectedSizes.length > 0 || selectedPrice.min > 0;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 5% 80px', fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        .cat-subcat { font-size: 12px; font-weight: 600; cursor: pointer; color: #888; padding: 4px 12px; border-radius: 20px; transition: .2s; border: 1px solid transparent; }
        .cat-subcat:hover { color: #000; }
        .cat-subcat.active { color: #000; border-color: #000; }
        .filter-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 0; font-size: 13px; color: #444; }
        .filter-checkbox:hover { color: #000; }
        .filter-checkbox input { width: 15px; height: 15px; cursor: pointer; accent-color: #000; }
        @keyframes catFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .cat-grid { animation: catFadeIn .3s ease; }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#888', marginBottom: 20, alignItems: 'center' }}>
        <span style={{ cursor: 'pointer', color: '#555' }} onClick={() => navigate('/')}>Trang chủ</span>
        <span>/</span>
        <span style={{ color: '#111', fontWeight: 600 }}>{category.title}</span>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 20px', color: '#111', letterSpacing: 0.5 }}>
        {category.title}
      </h1>

      {/* Sub-categories */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {category.subCats.map(cat => (
          <span
            key={cat}
            className={`cat-subcat ${activeSubCat === cat ? 'active' : ''}`}
            onClick={() => setActiveSubCat(cat)}
          >{cat}</span>
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: 20 }} />

      {/* Filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>Bộ lọc</span>

          {/* Color filter */}
          <FilterDropdown
            label={`Màu sắc${selectedColors.length ? ` (${selectedColors.length})` : ''}`}
            isOpen={openFilter === 'color'}
            onToggle={() => toggleFilter('color')}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {ALL_COLORS.map(c => (
                <label key={c.name} className="filter-checkbox">
                  <input type="checkbox" checked={selectedColors.includes(c.name)} onChange={() => toggleColor(c.name)} />
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: c.hex, border: c.border ? '1px solid #ccc' : 'none', flexShrink: 0 }} />
                  {c.name}
                </label>
              ))}
            </div>
          </FilterDropdown>

          {/* Size filter */}
          <FilterDropdown
            label={`Kích cỡ${selectedSizes.length ? ` (${selectedSizes.length})` : ''}`}
            isOpen={openFilter === 'size'}
            onToggle={() => toggleFilter('size')}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['M', 'L', 'XL', '2XL', '3XL'].map(s => (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  style={{
                    padding: '6px 14px', border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 2,
                    borderColor: selectedSizes.includes(s) ? '#000' : '#ddd',
                    background: selectedSizes.includes(s) ? '#000' : '#fff',
                    color: selectedSizes.includes(s) ? '#fff' : '#333',
                  }}
                >{s}</button>
              ))}
            </div>
          </FilterDropdown>

          {/* Price filter */}
          <FilterDropdown
            label={selectedPrice.min > 0 ? selectedPrice.label : 'Khoảng giá'}
            isOpen={openFilter === 'price'}
            onToggle={() => toggleFilter('price')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {PRICE_RANGES.map(range => (
                <label key={range.label} className="filter-checkbox">
                  <input
                    type="radio"
                    name="price"
                    checked={selectedPrice.label === range.label}
                    onChange={() => { setSelectedPrice(range); setOpenFilter(null); }}
                    style={{ accentColor: '#000' }}
                  />
                  {range.label}
                </label>
              ))}
            </div>
          </FilterDropdown>

          {/* Clear filters */}
          {hasActiveFilter && (
            <button
              onClick={() => { setSelectedColors([]); setSelectedSizes([]); setSelectedPrice(PRICE_RANGES[0]); }}
              style={{ background: 'none', border: 'none', fontSize: 11, color: '#e53935', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <span style={{ color: '#888', fontWeight: 600, fontSize: 12 }}>Sắp xếp theo:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ border: '1px solid #ddd', padding: '6px 12px', fontSize: 13, outline: 'none', cursor: 'pointer', borderRadius: 2, color: '#333' }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Product count */}
      <p style={{ fontSize: 12, color: '#888', marginBottom: 24 }}>
        Hiển thị <strong style={{ color: '#000' }}>{products.length}</strong> sản phẩm
      </p>

      {/* Product grid */}
      {products.length > 0 ? (
        <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 20px' }}>
          {products.map(p => (
            <ProductCard key={p._id || p.id} product={p} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          <p style={{ fontSize: 16, marginBottom: 12 }}>Không có sản phẩm phù hợp với bộ lọc.</p>
          <button
            onClick={() => { setSelectedColors([]); setSelectedSizes([]); setSelectedPrice(PRICE_RANGES[0]); }}
            style={{ padding: '10px 24px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {openFilter && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50 }}
          onClick={() => setOpenFilter(null)}
        />
      )}
    </div>
  );
};

export default CategoryPage;