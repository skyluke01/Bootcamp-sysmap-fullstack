

export function isValidCPF(cpf: string) {
  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11) return false;

  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += Number(cpf.charAt(i)) * (10 - i);
  }

  let firstDigit = 11 - (sum % 11);

  if (firstDigit >= 10) firstDigit = 0;

  if (firstDigit !== Number(cpf.charAt(9))) {
    return false;
  }

  sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += Number(cpf.charAt(i)) * (11 - i);
  }

  let secondDigit = 11 - (sum % 11);

  if (secondDigit >= 10) secondDigit = 0;

  return secondDigit === Number(cpf.charAt(10));
}