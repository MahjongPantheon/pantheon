/**
 * Calc strength of password by simple algorithm:
 * - 1 base point for every 2 symbols in password
 * - Multiply by 2 for every symbol class in password
 *
 * So:
 * - "123456" password will have strength of 3 * 2 = 6 (very weak)
 * - "Simple123" will have strength of 6 * 2 * 2 * 2 = 48 (normal)
 * - "thisismypasswordandidontcare" will have strength of 14 * 2 = 28 (below normal)
 *
 * Passwords with calculated strength less than 14 should be considered weak.
 */
export const calcPasswordStrength = (password: string) => {
  const hasLatinSymbols = !!password.match(/[a-z]/);
  const hasUppercaseLatinSymbols = !!password.match(/[A-Z]/);
  const hasDigits = !!password.match(/[0-9]/);
  const hasPunctuation = !!password.match(/[-@#$%^&*(),./"']/);
  const hasOtherSymbols = password.replace(/[-a-z0-9@#$%^&*(),./"']+/gi, '').length > 0;

  return (
    Math.ceil(password.length / 2) *
    (hasDigits ? 2 : 1) *
    (hasUppercaseLatinSymbols ? 2 : 1) *
    (hasPunctuation ? 2 : 1) *
    (hasOtherSymbols ? 2 : 1) *
    (hasLatinSymbols ? 2 : 1)
  );
};
