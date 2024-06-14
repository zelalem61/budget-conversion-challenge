const db = require('../db')
const getExchangeRate = require('../utils/get-exchange-rate')
const capitalizeString = require('../utils/capitalize-string')

module.exports = {
  findProjectBudgetByYearAndName,
  retrieveProjectBudgetByID,
  addProjectBudget
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

async function retrieveProjectBudgetByID (id) {
  const query = 'SELECT * FROM project WHERE projectId=?;'
  const results = await db.executeQuery(query, [id])

  if (results.length === 0) {
    throw new Error('Not Found')
  }

  return results[0]
}


async function addProjectBudget(data) {
  const query = `INSERT INTO project (
    projectId,
    projectName,
    year,
    currency,
    initialBudgetLocal,
    budgetUsd,
    initialScheduleEstimateMonths,
    adjustedScheduleEstimateMonths,
    contingencyRate,
    escalationRate,
    finalBudgetUsd
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`

  const value = [
    data.projectId,
    data.projectName,
    data.year,
    data.currency,
    data.initialBudgetLocal,
    data.budgetUsd,
    data.initialScheduleEstimateMonths,
    data.adjustedScheduleEstimateMonths,
    data.contingencyRate,
    data.escalationRate,
    data.finalBudgetUsd
  ]

  await db.executeQuery(query, value)
}