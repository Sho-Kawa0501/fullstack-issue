import { DocumentNode } from 'graphql';
import { print } from 'graphql';

const GRAPHQL_ENDPOINT = 'http://localhost:8000/graphql';

// リクエスト送信用関数
export async function graphqlRequest<TData = any, TVariables = Record<string, any>>(
  document: DocumentNode,
  variables?: TVariables
): Promise<TData> {
  const query = print(document);
  // リクエストボディのqueryに実行したいGraphQLのクエリ、variablesに変数値（投稿詳細取得、新規投稿のみ）を指定
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'GraphQL error');
  }

  return result.data as TData;
}