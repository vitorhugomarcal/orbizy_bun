export function formatCPF(value: string) {
  if (value) {
    const digitsOnly = value.replace(/\D/g, "")
    return digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }
}
