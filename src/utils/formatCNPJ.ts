export function formatCNPJ(value: string) {
  if (value) {
    const digitsOnly = value.replace(/\D/g, "")
    return digitsOnly.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    )
  }
}
