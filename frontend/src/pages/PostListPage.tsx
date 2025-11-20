import { usePosts } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import { Link } from 'react-router-dom';

export function PostListPage() {
  // 投稿一覧データ取得のフックス
  const { data: posts, isLoading, error } = usePosts();

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  // 取得した投稿データを投稿日で降順ソート
  const sortedPosts = [...(posts || [])].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>投稿一覧</h1>
        <Link
          to="/posts/new"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          新規投稿
        </Link>
      </div>
      {sortedPosts.length === 0 ? (
        <p>投稿がありません</p>
      ) : (
        <div>
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
