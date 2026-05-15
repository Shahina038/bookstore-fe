'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import styles from './books.module.css';

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [genre, setGenre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, [genre]);

  async function fetchBooks() {
    try {
      setLoading(true);
      const url = genre ? `/books?genre=${genre}` : '/books';
      const res = await api.get(url);
      setBooks(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(e, bookId) {
    e.stopPropagation();
    try {
      await api.post('/cart-items', { book_id: bookId, quantity: 1 });
      alert('Added to cart!');
    } catch (err) {
      alert(err.message);
    }
  }

  function logout() {
    document.cookie = 'token=; max-age=0; path=/';
    router.push('/login');
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Browse Books</h1>
        <div className={styles.headerActions}>
          <button className={styles.cartBtn} onClick={() => router.push('/cart')}>
            My Cart
          </button>
          <button className={styles.cartBtn} onClick={() => router.push('/orders')}
            style={{ backgroundColor: '#7c3aed' }}>
            My Orders
          </button>
          <button className={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All Genres</option>
          <option value="Technology">Technology</option>
          <option value="Self-Help">Self-Help</option>
        </select>
      </div>

      {loading && <p>Loading books...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && books.length === 0 && (
        <p className={styles.empty}>No books found.</p>
      )}

      <div className={styles.grid}>
        {books.map((book) => (
          <div
            key={book.id}
            className={styles.card}
            onClick={() => router.push(`/books/${book.id}`)}
          >
            <span className={styles.genre}>{book.genre}</span>
            <h3 className={styles.bookTitle}>{book.title}</h3>
            <p className={styles.author}>{book.author}</p>
            <p className={styles.price}>${book.price}</p>
            <p className={styles.stock}>{book.stock} in stock</p>
            <button
              className={styles.addBtn}
              onClick={(e) => addToCart(e, book.id)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
