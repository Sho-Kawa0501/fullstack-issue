import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreatePost } from '../hooks/usePosts';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import { Link } from 'react-router-dom';

// バリデーション定義
const postSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  body: z.string().min(1, '本文は必須です'),
  tags: z.string().optional(),
  authorId: z.string().min(1, '著者IDは必須です'),
});

type PostFormData = z.infer<typeof postSchema>;

export function NewPostPage() {
  const navigate = useNavigate();
  const createPost = useCreatePost();

  // フォームの初期化
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      // デフォルトでユーザーID 1を使用
      authorId: '1', 
    },
  });

  // 投稿フォーム送信処理
  const onSubmit = async (data: PostFormData) => {
    // タグが入力されている場合、カンマ区切りで配列に格納
    const tags = data.tags
      ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [];

    try {
      // useMutationのmutateAsyncで新規投稿APIを呼ぶ
      await createPost.mutateAsync({
        title: data.title,
        body: data.body,
        tags,
        authorId: data.authorId,
      });
      navigate('/');
    } catch (error) {
      console.error('投稿の作成に失敗しました:', error);
    }
  };

  if (createPost.isPending) return <Loading />;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
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
      <h1>新規投稿</h1>
      {createPost.isError && <Error message={createPost.error?.message} />}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem' }}>
            タイトル
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          {errors.title && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.title.message}</span>}
        </div>
        <div>
          <label htmlFor="body" style={{ display: 'block', marginBottom: '0.5rem' }}>
            本文
          </label>
          <textarea
            id="body"
            {...register('body')}
            rows={10}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'inherit',
            }}
          />
          {errors.body && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.body.message}</span>}
        </div>
        <div>
          <label htmlFor="tags" style={{ display: 'block', marginBottom: '0.5rem' }}>
            タグ（カンマ区切り）
          </label>
          <input
            id="tags"
            type="text"
            {...register('tags')}
            placeholder="例: GraphQL, Rust, Web"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>
        <div>
          <label htmlFor="authorId" style={{ display: 'block', marginBottom: '0.5rem' }}>
            著者ID
          </label>
          <select
            id="authorId"
            {...register('authorId')}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <option value="1">テストユーザー1</option>
            <option value="2">テストユーザー2</option>
          </select>
          {errors.authorId && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.authorId.message}</span>}
        </div>
        <button
          type="submit"
          disabled={createPost.isPending}
          style={{
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          投稿する
        </button>
      </form>
    </div>
  );
}
