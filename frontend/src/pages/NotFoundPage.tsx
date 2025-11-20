import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '4rem', margin: '0' }}>404</h1>
      <h2 style={{ marginTop: '1rem' }}>ページが見つかりません</h2>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        お探しのページは存在しないか、移動された可能性があります。
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
        }}
      >
        ホームに戻る
      </Link>
    </div>
  );
}
