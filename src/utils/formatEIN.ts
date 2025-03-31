export function formatEIN(ein: string): string {
  // Remove todos os caracteres não-dígitos
  const digitsOnly = ein.replace(/\D/g, "")

  // Verifica se temos 9 dígitos
  if (digitsOnly.length !== 9) {
    return digitsOnly // Retorna os dígitos sem formatação se não tivermos 9 dígitos
  }

  // Formata como EIN: XX-XXXXXXX
  return `${digitsOnly.substring(0, 2)}-${digitsOnly.substring(2)}`
}
