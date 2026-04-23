import React, { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Products.css';

export default function Products() {
  const { isAdmin, user } = useAuth();

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [searchQ, setSearchQ] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', stock: '' });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (searchQ.trim()) {
        res = await productAPI.search(searchQ);
        setProducts(res.data);
        setTotalPages(1);
      } else if (minPrice && maxPrice) {
        res = await productAPI.filter(minPrice, maxPrice);
        setProducts(res.data);
        setTotalPages(1);
      } else {
        res = await productAPI.list(page, 6);
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, searchQ, minPrice, maxPrice]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      setSuccess('Product deleted');
      loadProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Delete failed - admin only');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await productAPI.create({
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
      });
      setSuccess('Product created!');
      setShowCreate(false);
      setNewProduct({ name: '', description: '', price: '', stock: '' });
      loadProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Create failed');
    }
  };

  const clearFilters = () => {
    setSearchQ('');
    setMinPrice('');
    setMaxPrice('');
    setPage(0);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h1>Products</h1>
          <p className="products-sub">
            Browsing as <span className={isAdmin() ? 'role-admin' : 'role-user'}>
              {isAdmin() ? 'Admin' : 'User'}
            </span>
          </p>
        </div>
        {isAdmin() && (
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : '+ New Product'}
          </button>
        )}
      </div>

      {showCreate && isAdmin() && (
        <div className="card create-form">
          <h3>Create Product</h3>
          <form onSubmit={handleCreate} className="create-grid">
            <input className="input" placeholder="Product name" value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
            <input className="input" placeholder="Description" value={newProduct.description}
              onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
            <input className="input" type="number" placeholder="Price (USD)" value={newProduct.price}
              onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
            <input className="input" type="number" placeholder="Stock qty" value={newProduct.stock}
              onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} required />
            <button className="btn btn-success" type="submit">Save Product</button>
          </form>
        </div>
      )}

      <div className="filters card">
        <input className="input" placeholder="Search by name..." value={searchQ}
          onChange={e => { setSearchQ(e.target.value); setPage(0); }} />
        <input className="input" type="number" placeholder="Min price" value={minPrice}
          onChange={e => { setMinPrice(e.target.value); setPage(0); }} />
        <input className="input" type="number" placeholder="Max price" value={maxPrice}
          onChange={e => { setMaxPrice(e.target.value); setPage(0); }} />
        <button className="btn btn-outline" onClick={clearFilters}>Clear</button>
      </div>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {loading ? (
        <div className="loading-state">Loading products...</div>
      ) : (
        <>
          <div className="products-grid">
            {products.length === 0 ? (
              <div className="empty-state">No products found</div>
            ) : products.map(p => (
              <div className="product-card card" key={p.id}>
                <div className="product-card-top">
                  <span className="product-id">#{p.id}</span>
                  <span className="product-price">${p.price?.toFixed(2)}</span>
                </div>
                <h3 className="product-name">{p.name}</h3>
                <p className="product-desc">{p.description}</p>
                <div className="product-footer">
                  <span className="product-stock">
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                  </span>
                  {isAdmin() && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                ← Prev
              </button>
              <span className="page-info">Page {page + 1} of {totalPages}</span>
              <button className="btn btn-outline" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
