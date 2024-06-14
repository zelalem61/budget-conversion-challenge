const express = require('express')

const budgetController = require('../controllers/budget.controller')

const projectEndpoints = express.Router()

module.exports = projectEndpoints

projectEndpoints.post('/budget/currency', budgetController.getProjectBudgetByYearAndName)