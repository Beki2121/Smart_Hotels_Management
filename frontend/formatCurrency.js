// Format a number as Ethiopian Birr
// Usage: formatETB(1250) → "ETB 1,250.00"
export function formatETB(amount) {
  if (amount === null || amount === undefined) return "ETB 0.00";
  return (
    "ETB " +
    Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
