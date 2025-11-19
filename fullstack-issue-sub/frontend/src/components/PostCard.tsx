import { Link } from 'react-router-dom';
import type { GetPostsQuery } from '../graphql/generated';

type Post = GetPostsQuery['posts'][0];

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const date = new Date(post.publishedAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      to={`/posts/${post.id}`}
      style={{
        display: 'block',
        padding: '1rem',
        marginBottom: '1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <h3 style={{ margin: '0 0 0.5rem 0' }}>{post.title}</h3>
      {post.author && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {post.author.avatarUrl && (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              style={{ width: '24px', height: '24px', borderRadius: '50%' }}
            />
          )}
          <span style={{ fontSize: '0.9rem', color: '#666' }}>{post.author.name}</span>
        </div>
      )}
      <time style={{ fontSize: '0.85rem', color: '#999' }}>{date}</time>
    </Link>
  );
}