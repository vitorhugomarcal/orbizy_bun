export function formatSSN(ssn: string): string {
  // Remove todos os caracteres não-dígitos
  const digitsOnly = ssn.replace(/\D/g, "")

  // Verifica se temos 9 dígitos
  if (digitsOnly.length !== 9) {
    return digitsOnly // Retorna os dígitos sem formatação se não tivermos 9 dígitos
  }

  // Formata como SSN: XXX-XX-XXXX
  return `${digitsOnly.substring(0, 3)}-${digitsOnly.substring(
    3,
    5
  )}-${digitsOnly.substring(5)}`
}
