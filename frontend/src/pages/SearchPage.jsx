// import React, { useState, useMemo } from 'react';
// import { productsData } from '../data';

// const ALL_PRODUCTS = [
//   ...productsData.thuDong,
//   ...productsData.xuanHe,
//   ...productsData.quanNam,
//   ...productsData.phuKien,
// ];

// const ALL_COLORS = [
//   { name: 'Đen', hex: '#1a1a1a' },
//   { name: 'Trắng', hex: '#f0f0f0', border: true },
//   { name: 'Xám', hex: '#888' },
//   { name: 'Navy', hex: '#1B2A4A' },
//   { name: 'Be', hex: '#D4C5A9' },
// ];

// const PRICE_RANGES = [
//   { label: 'Tất cả', min: 0, max: Infinity },
//   { label: 'Dưới 150.000đ', min: 0, max: 150000 },
//   { label: '150.000 – 300.000đ', min: 150000, max: 300000 },
//   { label: '300.000 – 500.000đ', min: 300000, max: 500000 },
//   { label: 'Trên 500.000đ', min: 500000, max: Infinity },
// ];

// const SORT_OPTIONS = [
//   { label: 'Mới nhất', value: 'newest' },
//   { label: 'Giá tăng dần', value: 'price_asc' },
//   { label: 'Giá giảm dần', value: 'price_desc' },
//   { label: 'Tên A → Z', value: 'name_asc' },
// ];

// const parsePrice = (str = '') => parseInt(str.replace(/,/g, '')) || 0;

// // Dropdown filter
// const FilterDropdown = ({ label, children, isOpen, onToggle }) => (
//   <div style={{ position: 'relative' }}>
//     <button
//       onClick={onToggle}
//       style={{
//         display: 'flex', alignItems: 'center', gap: 6,
//         background: 'none', border: '1px solid #ddd', padding: '6px 14px',
//         fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 2,
//         color: '#333', whiteSpace: 'nowrap',
//       }}
//     >
//       {label} <span style={{ fontSize: 9, marginTop: 1 }}>{isOpen ? '▲' : '▼'}</span>
//     </button>
//     {isOpen && (
//       <div style={{
//         position: 'absolute', top: '110%', left: 0, background: '#fff',
//         border: '1px solid #eee', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
//         zIndex: 100, minWidth: 200, padding: 16, borderRadius: 4,
//       }}>
//         {children}
//       </div>
//     )}
//   </div>
// );

// // Product card
// const ProductCard = ({ product, navigate }) => {
//   const [hovered, setHovered] = useState(false);
//   const productColors = ALL_COLORS.slice(0, (product.id % 3) + 1);

//   return (
//     <div
//       style={{ cursor: 'pointer', marginBottom: 32 }}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       onClick={() => navigate(`/product/${product.id}`)}
//     >
//       <div style={{ position: 'relative', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
//         <img
//           src={product.img}
//           alt={product.name}
//           style={{ width: '100%', display: 'block', transition: 'transform .35s', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
//           onError={e => e.target.src = 'https://via.placeholder.com/300x380?text=Binh+Minh'}
//         />
//         <div style={{
//           position: 'absolute', top: '38%', left: 0, right: 0, textAlign: 'center',
//           fontSize: 10, fontWeight: 700, letterSpacing: 2,
//           color: 'rgba(0,0,0,0.08)', textTransform: 'uppercase', pointerEvents: 'none', lineHeight: 1.8,
//         }}>
//           BINH MINH STORE<br /><span style={{ fontSize: 9 }}>| {product.id} |</span>
//         </div>
//       </div>
//       <div style={{ display: 'flex', gap: 5, marginTop: 10, justifyContent: 'center' }}>
//         {productColors.map(c => (
//           <div key={c.name} style={{
//             width: 13, height: 13, borderRadius: '50%', background: c.hex,
//             border: c.border ? '1px solid #ccc' : 'none',
//           }} title={c.name} />
//         ))}
//       </div>
//       <div style={{ textAlign: 'center', marginTop: 8 }}>
//         <p style={{ fontSize: 12, color: '#333', margin: '0 0 4px', fontWeight: 500, lineHeight: 1.4 }}>{product.name}</p>
//         <p style={{ fontSize: 14, fontWeight: 800, color: '#000', margin: 0 }}>{product.price}đ</p>
//       </div>
//     </div>
//   );
// };

// // ——— MAIN PAGE ———
// const SearchPage = ({ query, navigate }) => {
//   const [openFilter, setOpenFilter] = useState(null);
//   const [selectedColors, setSelectedColors] = useState([]);
//   const [selectedSizes, setSelectedSizes] = useState([]);
//   const [selectedPrice, setSelectedPrice] = useState(PRICE_RANGES[0]);
//   const [sortBy, setSortBy] = useState('newest');

//   const toggleFilter = (key) => setOpenFilter(prev => prev === key ? null : key);
//   const toggleColor = (name) => setSelectedColors(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
//   const toggleSize = (s) => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

//   const results = useMemo(() => {
//     const q = (query || '').toLowerCase().trim();
//     let list = q
//       ? ALL_PRODUCTS.filter(p => p.name.toLowerCase().includes(q))
//       : ALL_PRODUCTS;

//     // Price filter
//     if (selectedPrice.min > 0 || selectedPrice.max !== Infinity) {
//       list = list.filter(p => {
//         const price = parsePrice(p.price);
//         return price >= selectedPrice.min && price <= selectedPrice.max;
//       });
//     }

//     // Sort
//     if (sortBy === 'price_asc') list = [...list].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
//     if (sortBy === 'price_desc') list = [...list].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
//     if (sortBy === 'name_asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name));

//     return list;
//   }, [query, selectedColors, selectedSizes, selectedPrice, sortBy]);

//   const hasActiveFilter = selectedColors.length > 0 || selectedSizes.length > 0 || selectedPrice.min > 0;

//   return (
//     <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 5% 80px', fontFamily: "'Segoe UI', sans-serif" }}>
//       <style>{`
//         .filter-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 0; font-size: 13px; color: #444; }
//         .filter-checkbox:hover { color: #000; }
//         .filter-checkbox input { width: 15px; height: 15px; cursor: pointer; accent-color: #000; }
//         @keyframes srFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
//         .sr-grid { animation: srFadeIn .3s ease; }
//       `}</style>

//       {/* Header tìm kiếm */}
//       <div style={{ textAlign: 'center', marginBottom: 32 }}>
//         <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px', color: '#111' }}>Tìm kiếm</h1>
//         <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
//           Có <strong style={{ color: '#000' }}>{results.length}</strong> sản phẩm cho tìm kiếm
//         </p>
//         <div style={{ width: 40, height: 2, background: '#000', margin: '12px auto 0' }} />
//       </div>

//       <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: 24 }} />

//       {/* Filter bar */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
//           <span style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>Bộ lọc</span>

//           <FilterDropdown
//             label={`Màu sắc${selectedColors.length ? ` (${selectedColors.length})` : ''}`}
//             isOpen={openFilter === 'color'}
//             onToggle={() => toggleFilter('color')}
//           >
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
//               {ALL_COLORS.map(c => (
//                 <label key={c.name} className="filter-checkbox">
//                   <input type="checkbox" checked={selectedColors.includes(c.name)} onChange={() => toggleColor(c.name)} />
//                   <div style={{ width: 14, height: 14, borderRadius: '50%', background: c.hex, border: c.border ? '1px solid #ccc' : 'none', flexShrink: 0 }} />
//                   {c.name}
//                 </label>
//               ))}
//             </div>
//           </FilterDropdown>

//           <FilterDropdown
//             label={`Kích cỡ${selectedSizes.length ? ` (${selectedSizes.length})` : ''}`}
//             isOpen={openFilter === 'size'}
//             onToggle={() => toggleFilter('size')}
//           >
//             <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
//               {['M', 'L', 'XL', '2XL', '3XL'].map(s => (
//                 <button key={s} onClick={() => toggleSize(s)} style={{
//                   padding: '6px 14px', border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 2,
//                   borderColor: selectedSizes.includes(s) ? '#000' : '#ddd',
//                   background: selectedSizes.includes(s) ? '#000' : '#fff',
//                   color: selectedSizes.includes(s) ? '#fff' : '#333',
//                 }}>{s}</button>
//               ))}
//             </div>
//           </FilterDropdown>

//           <FilterDropdown
//             label={selectedPrice.min > 0 ? selectedPrice.label : 'Khoảng giá'}
//             isOpen={openFilter === 'price'}
//             onToggle={() => toggleFilter('price')}
//           >
//             {PRICE_RANGES.map(range => (
//               <label key={range.label} className="filter-checkbox">
//                 <input type="radio" name="price" checked={selectedPrice.label === range.label}
//                   onChange={() => { setSelectedPrice(range); setOpenFilter(null); }} />
//                 {range.label}
//               </label>
//             ))}
//           </FilterDropdown>

//           {hasActiveFilter && (
//             <button onClick={() => { setSelectedColors([]); setSelectedSizes([]); setSelectedPrice(PRICE_RANGES[0]); }}
//               style={{ background: 'none', border: 'none', fontSize: 11, color: '#e53935', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
//               Xóa bộ lọc
//             </button>
//           )}
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
//           <span style={{ color: '#888', fontWeight: 600, fontSize: 12 }}>Sắp xếp theo:</span>
//           <select value={sortBy} onChange={e => setSortBy(e.target.value)}
//             style={{ border: '1px solid #ddd', padding: '6px 12px', fontSize: 13, outline: 'none', cursor: 'pointer', borderRadius: 2, color: '#333' }}>
//             {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
//           </select>
//         </div>
//       </div>

//       {/* Keyword tag */}
//       {query && (
//         <p style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>
//           Kết quả tìm kiếm cho <strong style={{ color: '#000' }}>"{query}"</strong>.
//         </p>
//       )}

//       {/* Grid */}
//       {results.length > 0 ? (
//         <div className="sr-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 20px' }}>
//           {results.map(p => <ProductCard key={p.id} product={p} navigate={navigate} />)}
//         </div>
//       ) : (
//         <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
//           <p style={{ fontSize: 18, marginBottom: 8 }}>😔 Không tìm thấy sản phẩm nào</p>
//           <p style={{ fontSize: 13 }}>Thử lại với từ khóa khác hoặc xóa bộ lọc.</p>
//           <button onClick={() => navigate('/')} style={{ marginTop: 20, padding: '12px 30px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
//             Về trang chủ
//           </button>
//         </div>
//       )}

//       {openFilter && <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setOpenFilter(null)} />}
//     </div>
//   );
// };

// export default SearchPage;



import React, { useState, useMemo, useEffect } from 'react';
import api from '../api/api';

const ALL_COLORS = [
  { name: 'Đen', hex: '#1a1a1a' },
  { name: 'Trắng', hex: '#f0f0f0', border: true },
  { name: 'Xám', hex: '#888' },
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Be', hex: '#D4C5A9' },
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

// Dropdown filter
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
      {label} <span style={{ fontSize: 9, marginTop: 1 }}>{isOpen ? '▲' : '▼'}</span>
    </button>
    {isOpen && (
      <div style={{
        position: 'absolute', top: '110%', left: 0, background: '#fff',
        border: '1px solid #eee', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        zIndex: 100, minWidth: 200, padding: 16, borderRadius: 4,
      }}>
        {children}
      </div>
    )}
  </div>
);

// Product card
const ProductCard = ({ product, navigate }) => {
  const [hovered, setHovered] = useState(false);
  const availableColors = [...new Set(product.variants?.map(v => v.color) || [])];

  return (
    <div
      style={{ cursor: 'pointer', marginBottom: 32 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div style={{ position: 'relative', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ width: '100%', height: '350px', objectFit: 'cover', display: 'block', transition: 'transform .35s', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
          onError={e => e.target.src = 'https://via.placeholder.com/300x380?text=Binh+Minh'}
        />
        <div style={{
          position: 'absolute', top: '38%', left: 0, right: 0, textAlign: 'center',
          fontSize: 10, fontWeight: 700, letterSpacing: 2,
          color: 'rgba(0,0,0,0.08)', textTransform: 'uppercase', pointerEvents: 'none', lineHeight: 1.8,
        }}>
          BINH MINH STORE<br /><span style={{ fontSize: 9 }}>| {product._id?.slice(-6)} |</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5, marginTop: 10, justifyContent: 'center' }}>
        {availableColors.map(colorName => {
          const cObj = ALL_COLORS.find(c => c.name === colorName) || { hex: '#ccc' };
          return (
            <div key={colorName} style={{
              width: 13, height: 13, borderRadius: '50%', background: cObj.hex,
              border: cObj.border ? '1px solid #ccc' : 'none',
            }} title={colorName} />
          );
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <p style={{ fontSize: 12, color: '#333', margin: '0 0 4px', fontWeight: 500, lineHeight: 1.4 }}>{product.name}</p>
        <p style={{ fontSize: 14, fontWeight: 800, color: '#000', margin: 0 }}>{product.price?.toLocaleString()}đ</p>
      </div>
    </div>
  );
};

// ——— MAIN PAGE ———
const SearchPage = ({ query, navigate }) => {
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openFilter, setOpenFilter] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(PRICE_RANGES[0]);
  const [sortBy, setSortBy] = useState('newest');

  // Gọi API lấy toàn bộ hàng để tìm kiếm
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/products');
        if (Array.isArray(data)) setDbProducts(data);
        setLoading(false);
      } catch (err) {
        setDbProducts([]);
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  const toggleFilter = (key) => setOpenFilter(prev => prev === key ? null : key);
  const toggleColor = (name) => setSelectedColors(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
  const toggleSize = (s) => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const results = useMemo(() => {
    const q = (query || '').toLowerCase().trim();
    let list = [...dbProducts];

    // Lọc theo từ khóa tìm kiếm
    if (q) {
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }

    // Lọc theo màu sắc
    if (selectedColors.length > 0) {
      list = list.filter(p => p.variants?.some(v => selectedColors.includes(v.color)));
    }

    // Lọc theo size
    if (selectedSizes.length > 0) {
      list = list.filter(p => p.variants?.some(v => selectedSizes.includes(v.size)));
    }

    // Lọc theo giá
    if (selectedPrice.min > 0 || selectedPrice.max !== Infinity) {
      list = list.filter(p => p.price >= selectedPrice.min && p.price <= selectedPrice.max);
    }

    // Sắp xếp
    if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    if (sortBy === 'name_asc') list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [dbProducts, query, selectedColors, selectedSizes, selectedPrice, sortBy]);

  const hasActiveFilter = selectedColors.length > 0 || selectedSizes.length > 0 || selectedPrice.min > 0;

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Đang tìm kiếm...</div>;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 5% 80px', fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        .filter-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 0; font-size: 13px; color: #444; }
        .filter-checkbox:hover { color: #000; }
        .filter-checkbox input { width: 15px; height: 15px; cursor: pointer; accent-color: #000; }
        @keyframes srFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .sr-grid { animation: srFadeIn .3s ease; }
      `}</style>

      {/* Header tìm kiếm */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px', color: '#111' }}>Tìm kiếm</h1>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
          Có <strong style={{ color: '#000' }}>{results.length}</strong> sản phẩm cho tìm kiếm
        </p>
        <div style={{ width: 40, height: 2, background: '#000', margin: '12px auto 0' }} />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: 24 }} />

      {/* Filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>Bộ lọc</span>

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

          <FilterDropdown
            label={`Kích cỡ${selectedSizes.length ? ` (${selectedSizes.length})` : ''}`}
            isOpen={openFilter === 'size'}
            onToggle={() => toggleFilter('size')}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['M', 'L', 'XL', '2XL', '3XL'].map(s => (
                <button key={s} onClick={() => toggleSize(s)} style={{
                  padding: '6px 14px', border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 2,
                  borderColor: selectedSizes.includes(s) ? '#000' : '#ddd',
                  background: selectedSizes.includes(s) ? '#000' : '#fff',
                  color: selectedSizes.includes(s) ? '#fff' : '#333',
                }}>{s}</button>
              ))}
            </div>
          </FilterDropdown>

          <FilterDropdown
            label={selectedPrice.min > 0 ? selectedPrice.label : 'Khoảng giá'}
            isOpen={openFilter === 'price'}
            onToggle={() => toggleFilter('price')}
          >
            {PRICE_RANGES.map(range => (
              <label key={range.label} className="filter-checkbox">
                <input type="radio" name="price" checked={selectedPrice.label === range.label}
                  onChange={() => { setSelectedPrice(range); setOpenFilter(null); }} style={{ accentColor: '#000' }} />
                {range.label}
              </label>
            ))}
          </FilterDropdown>

          {hasActiveFilter && (
            <button onClick={() => { setSelectedColors([]); setSelectedSizes([]); setSelectedPrice(PRICE_RANGES[0]); }}
              style={{ background: 'none', border: 'none', fontSize: 11, color: '#e53935', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
              Xóa bộ lọc
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <span style={{ color: '#888', fontWeight: 600, fontSize: 12 }}>Sắp xếp theo:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ border: '1px solid #ddd', padding: '6px 12px', fontSize: 13, outline: 'none', cursor: 'pointer', borderRadius: 2, color: '#333' }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Keyword tag */}
      {query && (
        <p style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>
          Kết quả tìm kiếm cho <strong style={{ color: '#000' }}>"{query}"</strong>.
        </p>
      )}

      {/* Grid */}
      {results.length > 0 ? (
        <div className="sr-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 20px' }}>
          {results.map(p => <ProductCard key={p._id} product={p} navigate={navigate} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>😔 Không tìm thấy sản phẩm nào</p>
          <p style={{ fontSize: 13 }}>Thử lại với từ khóa khác hoặc xóa bộ lọc.</p>
          <button onClick={() => navigate('/')} style={{ marginTop: 20, padding: '12px 30px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            Về trang chủ
          </button>
        </div>
      )}

      {openFilter && <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setOpenFilter(null)} />}
    </div>
  );
};

export default SearchPage;