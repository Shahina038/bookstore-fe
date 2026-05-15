'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import styles from './orders.module.css';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openOrder(id) {
    try {
      setDetailLoading(true);
      const res = await api.get(`/order/${id}`);
      setSelectedOrder(res.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  if (detailLoading) {
    return <div className={styles.container}><p>Loading...</p></div>;
  }

  if (selectedOrder) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => setSelectedOrder(null)}>
            ← Back to Orders
          </button>
          <button className={styles.booksBtn} onClick={() => router.push('/books')}>
            Browse Books
          </button>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <div>
              <p className={styles.orderId}>Order #{selectedOrder.id?.slice(0, 8)}</p>
              <p className={styles.orderDate}>{formatDate(selectedOrder.created_at)}</p>
            </div>
            <span className={styles.status}>{selectedOrder.status}</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.itemList}>
            {selectedOrder.items?.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <p className={styles.itemTitle}>{item.book?.title}</p>
                  <p className={styles.itemAuthor}>{item.book?.author}</p>
                </div>
                <div className={styles.itemRight}>
                  <p className={styles.itemQty}>x{item.quantity}</p>
                  <p className={styles.itemPrice}>${(item.unit_price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.divider} />

          <div className={styles.totalRow}>
            <span>Total</span>
            <span className={styles.totalAmount}>${selectedOrder.total_amount?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Orders</h1>
        <button className={styles.booksBtn} onClick={() => router.push('/books')}>
          Browse Books
        </button>
      </div>

      {loading && <p>Loading orders...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && orders.length === 0 && (
        <p className={styles.empty}>You have no orders yet.</p>
      )}

      <div className={styles.orderList}>
        {orders.map((order) => (
          <div
            key={order.id}
            className={styles.orderCard}
            onClick={() => openOrder(order.id)}
          >
            <div className={styles.orderLeft}>
              <p className={styles.orderId}>Order #{order.id?.slice(0, 8)}</p>
              <p className={styles.orderDate}>{formatDate(order.created_at)}</p>
            </div>
            <div className={styles.orderRight}>
              <p className={styles.orderTotal}>${order.total_amount?.toFixed(2)}</p>
              <span className={styles.status}>{order.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
