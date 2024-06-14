const express = require('express')
const { validationMiddleware } = require('../mw')
const {
  validateBudgetCreate,
  validateBudget
} = require('../validations/budget.validation')

const budgetController = require('../controllers/budget.controller')

const projectEndpoints = express.Router()

module.exports = projectEndpoints

projectEndpoints.post('/budget/currency', budgetController.getProjectBudgetByYearAndName)
projectEndpoints.get('/budget/:id', budgetController.retrieveProjectBudgetByID)
projectEndpoints.post(
  '/budget',
  validationMiddleware(validateBudgetCreate),
  budgetController.addProjectBudget
)
projectEndpoints.delete('/budget/:id', budgetController.deleteProjectBudget)
projectEndpoints.put('/budget/:id',
    validationMiddleware(validateBudget),
    budgetController.updateProjectBudget
  )