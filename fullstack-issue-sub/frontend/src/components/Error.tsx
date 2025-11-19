interface ErrorProps {
  message?: string;
}

export function Error({ message = 'エラーが発生しました' }: ErrorProps) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
      <p>{message}</p>
    </div>
  );
}
