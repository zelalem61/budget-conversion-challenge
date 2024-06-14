const projectBudgetService = require('../services/budget.service')
const ErrorMessages = require('../enums/error-messages.enum')

module.exports = {
  getProjectBudgetByYearAndName,
  retrieveProjectBudgetByID,
  addProjectBudget,
  deleteProjectBudget,
  updateProjectBudget,
  convertBudgetsToTtd
}
async function getProjectBudgetByYearAndName (req, res) {
  try {
    const { year, projectName, currency } = req.body
    const results = await projectBudgetService.findProjectBudgetByYearAndName(year, projectName, currency)
    return res.status(200).json({ success: true, data: results })
  } catch (error) {
    return res.status(500).json({ success: false, error: ErrorMessages.INTERNAL_SERVER_ERROR })
  }
}

async function retrieveProjectBudgetByID (req, res) {
  try {
    const id = req.params.id
    const results = await projectBudgetService.retrieveProjectBudgetByID(id)
    return res.status(200).json(results)
  } catch (error) {
    if (error.message === ErrorMessages.NOT_FOUND) {
      return res.status(404).json({ success: false, error: ErrorMessages.NOT_FOUND })
    }
    return res.status(500).json({ success: false, error: ErrorMessages.INTERNAL_SERVER_ERROR })
  }
}

async function addProjectBudget (req, res) {
  try {
    const data = req.body
    await projectBudgetService.addProjectBudget(data)
    return res.status(201).json({ success: true })
  } catch (error) {
    return res.status(500).json({ success: false, error: ErrorMessages.INTERNAL_SERVER_ERROR })
  }
}

async function deleteProjectBudget (req, res) {
  try {
    const id = req.params.id
    await projectBudgetService.deleteProjectBudget(id)
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ success: false, error: ErrorMessages.INTERNAL_SERVER_ERROR })
  }
}

async function updateProjectBudget (req, res) {
  try {
    const data = req.body
    const id = req.params.id
    await projectBudgetService.updateProjectBudget(id, data)
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ success: false, error: ErrorMessages.INTERNAL_SERVER_ERROR })
  }
}
async function convertBudgetsToTtd(req, res) {
  try {
    const projects = await projectBudgetService.convertBudgetsToTtd()
    return res.status(200).json({ success: true, data: projects })
  } catch (error) {
    return res.status(500).json({ success: false, error: ErrorMessages.INTERNAL_SERVER_ERROR })
  }
}
