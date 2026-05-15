'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import styles from './book.module.css';

export default function BookDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await api.get(`/book/${id}`);
        setBook(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchBook();
  }, [id]);

  async function addToCart() {
    try {
      setAdding(true);
      await api.post('/cart-items', { book_id: id, quantity: 1 });
      alert('Added to cart!');
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className={styles.container}><p>Loading...</p></div>;
  if (error) return <div className={styles.container}><p className={styles.error}>{error}</p></div>;
  if (!book) return null;

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => router.push('/books')}>
        ← Back to Books
      </button>

      <div className={styles.card}>
        <span className={styles.genre}>{book.genre}</span>
        <h1 className={styles.title}>{book.title}</h1>
        <p className={styles.author}>by {book.author}</p>

        <div className={styles.divider} />

        <div className={styles.meta}>
          <div>
            <span className={styles.label}>Price</span>
            <p className={styles.price}>${book.price?.toFixed(2)}</p>
          </div>
          <div>
            <span className={styles.label}>Stock</span>
            <p className={book.stock > 0 ? styles.inStock : styles.outOfStock}>
              {book.stock > 0 ? `${book.stock} available` : 'Out of stock'}
            </p>
          </div>
        </div>

        <button
          className={styles.addBtn}
          onClick={addToCart}
          disabled={adding || book.stock === 0}
        >
          {adding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
