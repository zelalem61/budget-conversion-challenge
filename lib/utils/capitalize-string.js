module.exports = capitalizeString

function capitalizeString (string) {
  if (string.length === 0) return string // Handle empty strings
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}
