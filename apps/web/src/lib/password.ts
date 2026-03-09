export type PasswordChecks = {
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasDigit: boolean;
  hasSpecialChar: boolean;
  hasMinLength: boolean;
};

export function evaluatePassword(value: string): PasswordChecks {
  return {
    hasLowercase: /[a-z]/.test(value),
    hasUppercase: /[A-Z]/.test(value),
    hasDigit: /\d/.test(value),
    hasSpecialChar: /[^A-Za-z0-9]/.test(value),
    hasMinLength: value.length >= 8,
  };
}

export function isStrongPassword(value: string): boolean {
  const c = evaluatePassword(value);
  return c.hasLowercase && c.hasUppercase && c.hasDigit && c.hasSpecialChar && c.hasMinLength;
}
