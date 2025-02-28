import { format, formatDistanceToNow } from "date-fns";

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}



export function formatDate(dateString: string | number | Date) {
  const date = new Date(dateString);
  const output = format(date, "dd/MM/yyyy hh:mm");
  return output;
}

export function formatDistanceFromNow(dateString: string | number | Date) {
  const result = formatDistanceToNow(dateString, {
    includeSeconds: true,
    addSuffix: true,
  });
  return result;
}

export function formatCurrency(
  amount: string,
  currency = "USD",
  locale = "en-US"
) {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    // throw new Error("Invalid amount");
    return amount;
  }
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    numericAmount
  );
}

export const formatPhoneNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    const part1 = match[2] ? `(${match[2]}` : "";
    const part2 = match[3] ? `) ${match[3]}` : "";
    const part3 = match[4] ? `-${match[4]}` : "";
    return `${part1}${part2}${part3}`;
  }

  const matchWithoutCountryCode = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (matchWithoutCountryCode) {
    return `(${matchWithoutCountryCode[1]}) ${matchWithoutCountryCode[2]}-${matchWithoutCountryCode[3]}`;
  }

  return value;
};

export const isElectron = () => {
  return !!(window && window.electronAPI && window.electronAPI.isElectron);
};