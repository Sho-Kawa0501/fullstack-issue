import { useParams, Link } from 'react-router-dom';
import { usePost } from '../hooks/usePosts';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

export function PostDetailPage() {
  // 投稿のIDをURLパラメータから取得
  const { id } = useParams<{ id: string }>();
  // 投稿詳細データ取得のフックス
  const { data: post, isLoading, error } = usePost(id || '');

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  if (!post) return <Error message="投稿が見つかりません" />;

  const date = new Date(post.publishedAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginBottom: '1rem',
          color: '#007bff',
          textDecoration: 'none',
        }}
      >
        ← 一覧に戻る
      </Link>
      <article>
        <h1 style={{ marginBottom: '1rem' }}>{post.title}</h1>
        {post.author && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            {post.author.avatarUrl && (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                style={{ width: '48px', height: '48px', borderRadius: '50%' }}
              />
            )}
            <div>
              <div style={{ fontWeight: 'bold' }}>{post.author.name}</div>
              <time style={{ fontSize: '0.9rem', color: '#666' }}>{date}</time>
            </div>
          </div>
        )}
        <div style={{ marginBottom: '1rem' }}>
          {post.tags.map((tag: string) => (
            <span
              key={tag}
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.5rem',
                marginRight: '0.5rem',
                marginBottom: '0.5rem',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                fontSize: '0.85rem',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div
          style={{
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap',
            padding: '1rem',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
          }}
        >
          {post.body}
        </div>
      </article>
    </div>
  );
}