async function getProjectBudgetByYearAndName(req, res) {
  try {
      const { year, projectName, currency } = req.body;
      const results = await projectBudgetService.findProjectBudgetByYearAndName(year, projectName, currency);
      return res.status(200).json({ success: true, data: results });
  } catch (error) {
      return res.status(500).json({ success: false, error: ErrorMessages.INTERNAL_SERVER_ERROR });
  }
}
