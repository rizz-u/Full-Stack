// frontend/src/components/ProductList.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import '../styles/ProductList.css';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/products');
        if (mounted) setProducts(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
        if (mounted) setError('Failed to load products. Try again.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProducts();

    // cleanup
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="pl-wrap">Loading products...</div>;
  if (error) return <div className="pl-wrap error">{error}</div>;

  return (
    <div className="pl-wrap">
      <h2>Product List</h2>
      <div className="pl-grid">
        {products.map(p => (
          <div className="pl-card" key={p.id}>
            <h3>{p.name}</h3>
            <p className="pl-price">Price: ${p.price}</p>
            <p className="pl-desc">{p.description}</p>
            <button className="pl-btn">Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}
