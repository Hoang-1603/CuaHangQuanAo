import React from 'react';

const WishlistPage = ({ navigate, wishlist = [], onToggleWishlist, onAddToCart }) => {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 5% 80px', fontFamily: "'Segoe UI', sans-serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 8, color: '#111' }}>Sản phẩm yêu thích</h1>
      <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginBottom: 40 }}>
        <span style={{ cursor: 'pointer', color: '#555' }} onClick={() => navigate('/account')}>Tài khoản</span>
        {' / '}Sản phẩm yêu thích
      </p>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤍</div>
          <p style={{ fontSize: 15, marginBottom: 24 }}>Bạn chưa có sản phẩm yêu thích nào.</p>
          <button onClick={() => navigate('/')}
            style={{ padding: '12px 32px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {wishlist.map(product => (
            <div key={product._id} style={{ position: 'relative' }}>
              {/* Nút xóa khỏi yêu thích */}
              <button
                onClick={() => onToggleWishlist && onToggleWishlist(product)}
                style={{
                  position: 'absolute', top: 10, right: 10, zIndex: 2,
                  background: '#fff', border: 'none', borderRadius: '50%',
                  width: 32, height: 32, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', fontSize: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
                title="Bỏ yêu thích"
              >❤️</button>

              {/* Ảnh sản phẩm */}
              <div
                style={{ backgroundColor: '#f5f5f5', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => navigate('/product/' + product._id)}
              >
                <img
                  src={product.images?.[0] || product.image || product.img}
                  alt={product.name}
                  style={{ width: '100%', height: '350px', objectFit: 'cover', display: 'block', transition: 'transform .3s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  onError={e => e.target.src = 'https://via.placeholder.com/300x380?text=IMG'}
                />
              </div>

              {/* Info */}
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#333', margin: '0 0 4px', fontWeight: 500, cursor: 'pointer' }}
                  onClick={() => navigate('/product/' + product._id)}>
                  {product.name}
                </p>
                <p style={{ fontWeight: 800, fontSize: 14, color: '#000', margin: '0 0 10px' }}>{product.price?.toLocaleString()}đ</p>
                <button
                  onClick={() => {
                    // Lấy size và màu mặc định từ variants của DB
                    const defaultSize = product.variants?.[0]?.size || 'L';
                    const defaultColor = product.variants?.[0]?.color || 'Đen';
                    if (onAddToCart) onAddToCart(product, defaultSize, defaultColor, 1);
                  }}
                  style={{ width: '100%', padding: '9px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 11, letterSpacing: 1 }}>
                  THÊM VÀO GIỎ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;