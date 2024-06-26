const config = require('../config')

module.exports = getExchangeRate

async function getExchangeRate (currencyType) {
  const apiKey = config.currency.apiKey
  const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  const data = await response.json()
  const result = data.conversion_rates[`${currencyType}`]
  return result
}
