export function formatCredit(n: number): string {
  if (n < 10000) return n.toLocaleString("en-US");
  if (n < 100000) return (n / 1000).toFixed(2) + "K";
  if (n < 1000000) return (n / 1000).toFixed(1) + "K";
  return (n / 1000000).toFixed(2) + "M";
}
