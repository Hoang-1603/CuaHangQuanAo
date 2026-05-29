import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';


const CATEGORY_MAP = {
  'ao-thu-dong': {
    title: 'Áo Thu Đông',
    subCats: ['Áo Nỉ / Áo Thun Dài Tay', 'Áo Len', 'Áo Khoác', 'Cardigan', 'Áo Hoodie'],
  },
  'ao-xuan-he': {
    title: 'Áo Xuân Hè',
    subCats: ['Áo Phông', 'Áo Polo', 'Áo Sơ Mi Ngắn Tay', 'Áo Tank Top', 'Áo Sơ Mi Dài Tay'],
  },
  'quan': {
    title: 'Quần Nam',
    subCats: ['Quần Dài', 'Quần Short'],
  },
  'phu-kien': {
    title: 'Phụ Kiện',
    subCats: ['Túi/Balo', 'Giày Dép', 'Dây Lưng', 'Mũ', 'Tất'],
  },
};

const ALL_COLORS = [
  { name: 'Đen',   hex: '#1a1a1a' },
  { name: 'Trắng', hex: '#f0f0f0', border: true },
  { name: 'Xám',   hex: '#888' },
  { name: 'Navy',  hex: '#1B2A4A' },
  { name: 'Be',    hex: '#D4C5A9' },
  { name: 'Nâu',   hex: '#7B5B3A' },
  { name: 'Xanh',  hex: '#2196F3' }
];

const AdminProducts = ({ user, navigate, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Các state lọc tìm kiếm
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  // State quản lý Modal Form (Thêm/Sửa)
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  
  // State lưu trữ dữ liệu Form sản phẩm
  const [form, setForm] = useState({
    name: '', price: 0, brand: '', category: '', gender: 'Unisex',
    material: '', description: '', images: '', variants: []
  });

  // State lưu biến thể tạm thời để bấm Thêm
  const [tempVariant, setTempVariant] = useState({ size: 'M', color: 'Đen', stock: 10, sku: '' });

// --- LOGIC: CHỌN DẢI SIZE THEO DANH MỤC ---
  const getAvailableSizes = () => {
    const cat = form.category;
    if (['Quần Dài', 'Quần Short', 'Quần Nam'].includes(cat)) {
      return ['28', '29', '30', '31', '32', '33', '34'];
    }
    if (cat === 'Giày Dép') {
      return ['38', '39', '40', '41', '42', '43', '44'];
    }
    if (['Túi/Balo', 'Dây Lưng', 'Mũ', 'Tất', 'Phụ Kiện'].includes(cat)) {
      return ['Freesize'];
    }
    return ['S', 'M', 'L', 'XL', '2XL', '3XL']; // Mặc định cho Áo Thu Đông, Áo Xuân Hè...
  };

  const availableSizes = getAvailableSizes();

  // Tự động chuyển đổi giá trị Size hiển thị trên Form khi đổi danh mục
  useEffect(() => {
    // Chỉ cập nhật nếu size hiện tại không thuộc dải size mới
    if (!availableSizes.includes(tempVariant.size)) {
       setTempVariant(prev => ({ ...prev, size: availableSizes[0] }));
    }
  }, [form.category, availableSizes]);

  // State quản lý xem đánh giá (Reviews)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [selectedProductName, setSelectedProductName] = useState('');

  // Hàm tải danh sách sản phẩm từ database thật
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('https://cuahangquanao.onrender.com/api/products');
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || (!user.isAdmin && !user.role)) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  // Xử lý Xóa mềm sản phẩm (Soft Delete)
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn đưa sản phẩm này vào thùng rác?')) {
      try {
        await api.delete(`/api/products/${id}`);
        alert('Đã đưa sản phẩm vào thùng rác thành công!');
        fetchProducts();
      } catch (error) {
        alert('Lỗi khi xóa sản phẩm');
      }
    }
  };

  // Mở modal thêm sản phẩm mới
  const openAddModal = () => {
    setIsEdit(false);
    setForm({
      name: '', price: 0, brand: '', category: '', gender: 'Unisex',
      material: '', description: '', images: '', variants: []
    });
    setTempVariant({ size: availableSizes[0], color: 'Đen', stock: 10, sku: '' });
    setShowModal(true);
  };

  // Mở modal sửa thông tin sản phẩm
  const openEditModal = (product) => {
    setIsEdit(true);
    setCurrentProductId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      brand: product.brand,
      category: product.category,
      gender: product.gender,
      material: product.material || '',
      description: product.description,
      images: product.images?.join(', ') || '',
      variants: product.variants || []
    });

    setTempVariant({ size: availableSizes[0], color: 'Đen', stock: 10, sku: '' });
    setShowModal(true);
  };

  // Mở modal xem danh sách đánh giá của khách hàng
  const openReviewModal = (product) => {
    setSelectedProductName(product.name);
    setSelectedReviews(product.reviews || []);
    setShowReviewModal(true);
  };

  // Thêm một hàng biến thể mới vào danh sách
  const addVariant = () => {
    if (!tempVariant.sku) {
      alert('Vui lòng nhập SKU cho biến thể để dễ quản lý kho');
      return;
    }
    setForm({ ...form, variants: [...form.variants, { ...tempVariant }] });
    setTempVariant({ size: availableSizes[0], color: 'Đen', stock: 10, sku: '' });
  };

  // Xóa biến thể khỏi danh sách form tạm
  const removeVariant = (index) => {
    const updated = form.variants.filter((_, i) => i !== index);
    setForm({ ...form, variants: updated });
  };

  // Gửi dữ liệu tạo mới hoặc cập nhật lên Backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    const imageArray = form.images.split(',').map(img => img.trim()).filter(img => img !== '');

    const productData = {
      ...form,
      images: imageArray.length > 0 ? imageArray : ['/images/default-product.png']
    };

    try {
      if (isEdit) {
        await api.put(`/api/products/${currentProductId}`, productData);
        alert('Cập nhật thông tin sản phẩm thành công!');
      } else {
        await api.post('https://cuahangquanao.onrender.com/api/products', productData);
        alert('Thêm sản phẩm mới lên kệ thành công!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi lưu thông tin sản phẩm');
    }
  };

  // Thực hiện bộ lọc nhanh trực tiếp trên giao diện quản trị
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    const matchesGender = genderFilter ? p.gender === genderFilter : true;
    return matchesSearch && matchesCategory && matchesGender;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f5f7fa' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <AdminSidebar activePath={window.location.pathname} navigate={navigate} onLogout={onLogout} />

      {/* KHU VỰC HIỂN THỊ CHÍNH */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>Danh sách Sản phẩm</h1>
          <button onClick={openAddModal} style={{ padding: '12px 24px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            + Thêm sản phẩm mới
          </button>
        </div>

        {/* KHUNG TÌM KIẾM & BỘ LỌC */}
        <div style={{ display: 'flex', gap: 15, background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: 30 }}>
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm theo tên, nhãn hiệu..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 2, padding: '10px 15px', border: '1px solid #ddd', borderRadius: 6, outline: 'none' }}
          />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: 6, outline: 'none', cursor: 'pointer' }}>
            <option value="">Tất cả danh mục</option>
            <option value="Áo Thu Đông">Áo Thu Đông</option>
            <option value="Áo Xuân Hè">Áo Xuân Hè</option>
            <option value="Quần Nam">Quần Nam</option>
            <option value="Phụ Kiện">Phụ Kiện</option>
          </select>
          <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: 6, outline: 'none', cursor: 'pointer' }}>
            <option value="">Phân loại giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>

        {/* BẢNG DỮ LIỆU SẢN PHẨM */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>Đang kết nối kho dữ liệu...</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Ảnh</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Tên sản phẩm</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Danh mục</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Giới tính</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Giá niêm yết</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555' }}>Tồn kho</th>
                  <th style={{ padding: '15px 20px', fontSize: 13, color: '#555', textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Không tìm thấy quần áo nào khớp với điều kiện tìm kiếm.</td>
                  </tr>
                ) : (
                  filteredProducts.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px 20px' }}>
                        <img src={p.images?.[0]} alt={p.name} style={{ width: 45, height: 55, objectFit: 'cover', borderRadius: 4 }} />
                      </td>
                      <td style={{ padding: '15px 20px', fontWeight: 600, color: '#111' }}>
                        {p.name}
                        <div style={{ fontSize: 11, color: '#777', fontWeight: 400, marginTop: 2 }}>Brand: {p.brand}</div>
                      </td>
                      <td style={{ padding: '15px 20px', color: '#555', fontSize: 14 }}>{p.category}</td>
                      <td style={{ padding: '15px 20px', color: '#555', fontSize: 14 }}>{p.gender}</td>
                      <td style={{ padding: '15px 20px', fontWeight: 700, color: '#111' }}>{p.price?.toLocaleString()}đ</td>
                      <td style={{ padding: '15px 20px', fontWeight: 600, color: p.countInStock < 10 ? '#d32f2f' : '#2e7d32' }}>{p.countInStock} chiếc</td>
                      <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                          <button onClick={() => openReviewModal(p)} style={{ padding: '6px 12px', fontSize: 12, background: '#1565C0', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                            ⭐ Feedback ({p.numReviews || 0})
                          </button>
                          <button onClick={() => openEditModal(p)} style={{ padding: '6px 12px', fontSize: 12, background: '#f57c00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                            Sửa
                          </button>
                          <button onClick={() => handleDelete(p._id)} style={{ padding: '6px 12px', fontSize: 12, background: '#c62828', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL THÊM / SỬA SẢN PHẨM (DỮ LIỆU ĐỘNG) */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', width: '700px', maxHeight: '90vh', overflowY: 'auto', borderRadius: 12, padding: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 800 }}>{isEdit ? 'Chỉnh sửa thông tin sản phẩm' : 'Đăng bán sản phẩm mới'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Tên quần áo *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Giá bán (đ) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Danh mục nhóm *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6 }} required>
                    <option value="">Chọn danh mục chi tiết</option>
                    
                    {/* Render danh sách nhóm tự động từ CATEGORY_MAP */}
                    {Object.values(CATEGORY_MAP).map(group => (
                      <optgroup key={group.title} label={group.title}>
                        {group.subCats.map(subCat => (
                          <option key={subCat} value={subCat}>{subCat}</option>
                        ))}
                      </optgroup>
                    ))}
                    
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Nhãn hiệu (Brand)</label>
                  <input type="text" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Đối tượng giới tính</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6 }}>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 15 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Chất liệu vải (Ví dụ: 100% Cotton, Vải thô...)</label>
                  <input type="text" value={form.material} onChange={e => setForm({...form, material: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Link hình ảnh (Nếu có nhiều ảnh, hãy phân tách bằng dấu phẩy ",")</label>
                  <input type="text" value={form.images} onChange={e => setForm({...form, images: e.target.value})} placeholder="/images/sp1.jpg, /images/sp1_detail.jpg" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 5 }}>Mô tả thông số chi tiết</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="3" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
              </div>

              {/* THIẾT LẬP KHO CHI TIẾT TỪNG BIẾN THỂ */}
              <div style={{ border: '1px solid #eee', padding: 15, borderRadius: 8, background: '#fafafa' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700 }}>Phân phối kích cỡ & Màu sắc (Variants)</h4>
                
                <div style={{ display: 'flex', gap: 10, alignItems: 'end', marginBottom: 15 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>Size</label>
                    <select 
                      value={tempVariant.size} 
                      onChange={e => setTempVariant({...tempVariant, size: e.target.value})} 
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 4 }}
                    >
                      {/* 👉 SỬ DỤNG DẢI SIZE ĐỘNG TẠI ĐÂY */}
                      {availableSizes.map(sizeOption => (
                        <option key={sizeOption} value={sizeOption}>{sizeOption}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>Màu sắc</label>
                    <select 
                      value={tempVariant.color} 
                      onChange={e => setTempVariant({...tempVariant, color: e.target.value})} 
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 4 }}
                    >
                      {ALL_COLORS.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>Số lượng nhập</label>
                    <input type="number" value={tempVariant.stock} onChange={e => setTempVariant({...tempVariant, stock: Number(e.target.value)})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1.5 }}>
                    <label style={{ fontSize: 11, display: 'block', marginBottom: 3 }}>Mã SKU sản phẩm</label>
                    <input type="text" placeholder="VD: SM-DEN-M" value={tempVariant.sku} onChange={e => setTempVariant({...tempVariant, sku: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
                  </div>
                  <button type="button" onClick={addVariant} style={{ padding: '9px 15px', background: '#111', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>+ Add</button>
                </div>

                {/* Hiển thị danh sách các biến thể đã tạo để chuẩn bị lưu */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.variants.map((v, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: 4, border: '1px solid #eee', fontSize: 13 }}>
                      <span>Kích cỡ: <strong>{v.size}</strong> | Màu: <strong>{v.color}</strong> | Số lượng kho: <strong>{v.stock}</strong> | SKU: <code>{v.sku}</code></span>
                      <button type="button" onClick={() => removeVariant(idx)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 700 }}>Gỡ bỏ</button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}>Đóng lại</button>
                <button type="submit" style={{ padding: '10px 25px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT REVIEW KHÁCH HÀNG */}
      {showReviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', width: '550px', maxHeight: '80vh', overflowY: 'auto', borderRadius: 12, padding: 30 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Phản hồi về: <span style={{ color: '#1565C0' }}>{selectedProductName}</span></h3>
              <button onClick={() => setShowReviewModal(false)} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer', color: '#aaa' }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {selectedReviews.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', fontSize: 14, padding: '20px 0' }}>Sản phẩm này chưa ghi nhận đánh giá nào từ khách mua hàng.</p>
              ) : (
                selectedReviews.map(r => (
                  <div key={r._id} style={{ borderBottom: '1px solid #eee', paddingBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <strong style={{ fontSize: 13 }}>{r.name}</strong>
                      <span style={{ color: '#ffb300', fontWeight: 700 }}>{r.rating} ⭐</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.5 }}>{r.comment}</p>
                    <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;