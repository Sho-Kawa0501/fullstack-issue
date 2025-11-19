import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlRequest } from '../lib/graphql';
import { GetPostsDocument, GetPostDocument, CreatePostDocument } from '../graphql/generated';
import type { GetPostsQuery, CreatePostInput } from '../graphql/generated';

// 投稿一覧取得
export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const data = await graphqlRequest(GetPostsDocument);
      return data.posts;
    },
  });
}

// 投稿詳細取得
export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const data = await graphqlRequest(GetPostDocument, { id });
      return data.post;
    },
    // idがある場合に実行
    enabled: !!id,
  });
}

// 投稿新規登録
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    // 新規投稿データをサーバーへ送信
    mutationFn: async (input: CreatePostInput) => {
      const data = await graphqlRequest(CreatePostDocument, { input });
      return data.createPost;
    },
    // データの更新が成功することを期待して先に画面を更新（楽観的更新）
    onMutate: async (newPost) => {
      // クエリの進行中の更新をキャンセル
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // 復元用データを取得
      const previousPosts = queryClient.getQueryData<GetPostsQuery['posts']>(['posts']);

      // 新しい投稿を追加
      if (previousPosts) {
        queryClient.setQueryData<GetPostsQuery['posts']>(['posts'], (old) => {
          if (!old) return old;
          // 新しい投稿を一時的に追加（postのidは後で更新される）
          const optimisticPost = {
            id: 'temp',
            title: newPost.title,
            publishedAt: new Date().toISOString(),
            author: {
              id: newPost.authorId,
              name: 'Loading...',
              avatarUrl: null,
            },
          };
          return [optimisticPost, ...old];
        });
      }
      return { previousPosts };
    },
    onError: (_err, _newPost, context) => {
      // エラー時はロールバック
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
    },
    onSuccess: () => {
      // 成功時にキャッシュを無効化して再取得
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}