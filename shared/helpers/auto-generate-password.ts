// Generate a random password with 8 characters using numbers and letters

export function autoGeneratePassword(): string {
  return (
    Math.random().toString(36).substring(2, 8) +
    Math.random().toString(36).substring(2, 8)
  );
}
