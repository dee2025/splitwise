export function formatIndianCurrency(value, options = {}) {
  const amount = Number(value || 0);
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  });

  return formatter.format(Number.isFinite(amount) ? amount : 0);
}

export function formatPaiseAsIndianCurrency(valueInPaise, options = {}) {
  return formatIndianCurrency(Number(valueInPaise || 0) / 100, options);
}
