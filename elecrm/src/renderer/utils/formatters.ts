export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return "";
  // Remove any non-digit characters and remove +1 prefix if it exists
  const cleaned = phoneNumber?.replace(/\D/g, "")?.replace(/^1/, "");

  // Check if it's a valid 10-digit number
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  // Return original if not a valid 10-digit number
  return phoneNumber;
};

export const capitalizeFullName = (
  firstName?: string,
  lastName?: string
): string => {
  const formatName = (name?: string) =>
    name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "";

  return [formatName(firstName), formatName(lastName)]
    .filter(Boolean)
    .join(" ");
};
