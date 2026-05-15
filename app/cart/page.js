'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import styles from './carts.module.css';

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    try {
      setLoading(true);
      const res = await api.get('/cart-items');
      setItems(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(id, quantity) {
    if (quantity < 1) return;
    try {
      await api.patch(`/cart-item/${id}`, { quantity });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    } catch (err) {
      alert(err.message);
    }
  }

  async function removeItem(id) {
    try {
      await api.delete(`/cart-item/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  async function checkout() {
    try {
      setCheckingOut(true);
      await api.post('/orders', {});
      alert('Order placed successfully!');
      router.push('/orders');
    } catch (err) {
      alert(err.message);
    } finally {
      setCheckingOut(false);
    }
  }

  const total = items.reduce((sum, item) => {
    const price = item.book?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Cart</h1>
        <button className={styles.backBtn} onClick={() => router.push('/books')}>
          ← Back to Books
        </button>
      </div>

      {loading && <p>Loading cart...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && items.length === 0 && (
        <p className={styles.empty}>Your cart is empty.</p>
      )}

      {items.length > 0 && (
        <>
          <div className={styles.itemList}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemTitle}>{item.book?.title}</h3>
                  <p className={styles.itemAuthor}>{item.book?.author}</p>
                  <p className={styles.itemPrice}>${item.book?.price?.toFixed(2)}</p>
                </div>
                <div className={styles.itemActions}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className={styles.qty}>{item.quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <p className={styles.total}>Total: ${total.toFixed(2)}</p>
            <button
              className={styles.checkoutBtn}
              onClick={checkout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Placing Order...' : 'Checkout'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
