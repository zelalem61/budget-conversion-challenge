const db = require('../db')
const getExchangeRate = require('../exchange-rate')

module.exports = {
  findProjectBudgetByYearAndName,
  retrieveProjectBudgetByID,
  addProjectBudget,
  deleteProjectBudget,
  updateProjectBudget,
  convertBudgetsToTtd
}

const PROJECTSTOCONVERT = [
  'Peking roasted duck Chanel',
  'Choucroute Cartier',
  'Rigua Nintendo',
  'Llapingacho Instagram'
]

function capitalizeString (string) {
  if (string.length === 0) return string
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
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

async function addProjectBudget (data) {
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

async function deleteProjectBudget (id) {
  const query = 'DELETE FROM project WHERE projectId=?'
  await db.executeQuery(query, [id])
}

async function updateProjectBudget (id, data) {
  const query = `UPDATE project SET 
    projectName = ?,
    year = ?,
    currency = ?,
    initialBudgetLocal = ?,
    budgetUsd = ?,
    initialScheduleEstimateMonths = ?,
    adjustedScheduleEstimateMonths = ?,
    contingencyRate = ?,
    escalationRate = ?,
    finalBudgetUsd = ?
    WHERE projectId = ?;`

  const params = [
    data.projectName,
    data.year,
    data.currency,
    data.initialBudgetLocal,
    data.budgetUsd,
    data.initialScheduleEstimateMonths,
    data.adjustedScheduleEstimateMonths,
    data.contingencyRate,
    data.escalationRate,
    data.finalBudgetUsd,
    id
  ]

  await db.executeQuery(query, params)
}

async function convertBudgetsToTtd () {
  const placeholder = PROJECTSTOCONVERT.map(() => '?').join(', ')
  const query = `SELECT * FROM project WHERE projectName IN (${placeholder});`
  const projects = await db.executeQuery(query, PROJECTSTOCONVERT)
  const exchangerate = await getExchangeRate('TTD')
  const capitalizedKey = capitalizeString('TTD')

  projects.forEach((data) => {
    data[`finalBudget${capitalizedKey}`] = parseFloat((data.finalBudgetUsd * exchangerate).toFixed(2))
  })

  return projects
}
