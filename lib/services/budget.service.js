const db = require('../db')
const getExchangeRate = require('../utils/get-exchange-rate')
const capitalizeString = require('../utils/capitalize-string')

module.exports = {
  findProjectBudgetByYearAndName
}

async function findProjectBudgetByYearAndName (year, projectName, currency) {
  const query = 'SELECT * FROM project WHERE year=? AND projectName=?;'
  const results = await db.executeQuery(query, [year, projectName])

  if (currency === 'USD') {
    return results
  }

  const exchangerate = await getExchangeRate(currency)
  const capitalizedKey = capitalizeString(currency)

  results.forEach((data) => {
    data[`finalBudget${capitalizedKey}`] = parseFloat((data.finalBudgetUsd * exchangerate).toFixed(2))
  })

  return results
}
