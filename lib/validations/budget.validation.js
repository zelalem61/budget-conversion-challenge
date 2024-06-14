const ErrorMessages = require('../enums/error-messages.enum')
module.exports = { validateBudget, validateBudgetCreate }
function validateBudget (body) {
  const errors = []

  // projectName validation
  if (body.projectName === undefined) {
    errors.push(ErrorMessages.MISSING_PROJECT_NAME)
  } else if (typeof body.projectName !== 'string') {
    errors.push(ErrorMessages.INVALID_PROJECT_NAME)
  }

  // year validation
  if (body.year === undefined) {
    errors.push(ErrorMessages.MISSING_YEAR)
  } else if (typeof body.year !== 'number') {
    errors.push(ErrorMessages.INVALID_YEAR)
  }

  // currency validation
  if (body.currency === undefined) {
    errors.push(ErrorMessages.MISSING_CURRENCY)
  } else if (typeof body.currency !== 'string') {
    errors.push(ErrorMessages.INVALID_CURRENCY)
  }

  // initialBudgetLocal validation
  if (body.initialBudgetLocal === undefined) {
    errors.push(ErrorMessages.MISSING_INITIALBUDGETLOCAL)
  } else if (typeof body.initialBudgetLocal !== 'number') {
    errors.push(ErrorMessages.INVALID_INITIALBUDGETLOCAL)
  }

  // budgetUsd validation
  if (body.budgetUsd === undefined) {
    errors.push(ErrorMessages.MISSING_BUDGETUSD)
  } else if (typeof body.budgetUsd !== 'number') {
    errors.push(ErrorMessages.INVALID_BUDGETUSD)
  }

  // initialScheduleEstimateMonths validation
  if (body.initialScheduleEstimateMonths === undefined) {
    errors.push(ErrorMessages.MISSING_INITIALSCHEDULEESTIMATEMONTHS)
  } else if (typeof body.initialScheduleEstimateMonths !== 'number') {
    errors.push(ErrorMessages.INVALID_INITIALSCHEDULEESTIMATEMONTHS)
  }

  // adjustedScheduleEstimateMonths validation
  if (body.adjustedScheduleEstimateMonths === undefined) {
    errors.push(ErrorMessages.MISSING_ADJUSTEDSCHEDULEESTIMATEMONTHS)
  } else if (typeof body.adjustedScheduleEstimateMonths !== 'number') {
    errors.push(ErrorMessages.INVALID_ADJUSTEDSCHEDULEESTIMATEMONTHS)
  }

  // contingencyRate validation
  if (body.contingencyRate === undefined) {
    errors.push(ErrorMessages.MISSING_CONTINGENCYRATE)
  } else if (typeof body.contingencyRate !== 'number') {
    errors.push(ErrorMessages.INVALID_CONTINGENCYRATE)
  }

  // escalationRate validation
  if (body.escalationRate === undefined) {
    errors.push(ErrorMessages.MISSING_ESCALATIONRATE)
  } else if (typeof body.escalationRate !== 'number') {
    errors.push(ErrorMessages.INVALID_ESCALATIONRATE)
  }

  // finalBudgetUsd validation
  if (body.finalBudgetUsd === undefined) {
    errors.push(ErrorMessages.MISSING_FINALBUDGETUSD)
  } else if (typeof body.finalBudgetUsd !== 'number') {
    errors.push(ErrorMessages.INVALID_FINALBUDGETUSD)
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

function validateBudgetCreate (body) {
  const errors = []

  if (body.projectId === undefined) {
    errors.push(ErrorMessages.MISSING_PROJECTID)
  } else if (typeof body.projectId !== 'number') {
    errors.push(ErrorMessages.INVALID_PROJECTID)
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  const validatedBase = validateBudget(body)

  if (!validatedBase.valid) {
    return { valid: false, errors: errors.concat(validatedBase.errors) }
  }

  return { valid: true }
}


