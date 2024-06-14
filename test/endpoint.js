process.env.NODE_ENV = 'test'

const http = require('http')
const test = require('tape')
const servertest = require('servertest')
const app = require('../lib/app')
const db = require('../lib/db')

const server = http.createServer(app)

test('Setup test database', async function (t) {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS project (
      projectId INT PRIMARY KEY,
      projectName VARCHAR(255),
      year INT,
      currency VARCHAR(3),
      initialBudgetLocal DECIMAL(10, 2),
      budgetUsd DECIMAL(10, 2),
      initialScheduleEstimateMonths INT,
      adjustedScheduleEstimateMonths INT,
      contingencyRate DECIMAL(5, 2),
      escalationRate DECIMAL(5, 2),
      finalBudgetUsd DECIMAL(10, 2)
    );
  `

  const insertSql = `
    INSERT INTO project (
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `

  const sampleRecords = [
    [1, 'Humitas Hewlett Packard', 2024, 'EUR', 316974.50, 233724.23, 13, 12, 2.19, 3.46, 247106.75],
    [38, 'Llapingacho Instagram', 2000, 'GBP', 781688.85, 402319.77, 19, 21, 3.09, 4.96, 435323.12],
    [321, 'Peking roasted duck Chanel', 2000, 'GBP', 767063.85, 621610.48, 21, 19, 7.14, 3.58, 689836.03],
    [504, 'Choucroute Cartier', 2000, 'GBP', 848895.86, 720265.74, 23, 21, 0.93, 2.88, 747900.78],
    [184, 'Rigua Nintendo', 2001, 'GBP', 448429.37, 253943.51, 14, 12, 5.92, 3.04, 277153.87]
  ]

  try {
    await db.executeQuery(createTableSql, [])
    for (let i = 0; i < sampleRecords.length; i++) {
      await db.run(insertSql, sampleRecords[i])
      t.pass(`Data inserted for record ${i + 1}`)
    }
    t.end()
  } catch (err) {
    t.fail('Error creating table and inserting data')
    t.end()
  }
})

test('GET /health should return 200', function (t) {
  servertest(server, '/health', { encoding: 'json' }, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.end()
  })
})

test('GET /api/ok should return 200', function (t) {
  servertest(server, '/api/ok', { encoding: 'json' }, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.ok, 'Should return a body with ok')
    t.end()
  })
})

test('GET /nonexistent should return 404', function (t) {
  servertest(server, '/nonexistent', { encoding: 'json' }, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 404, 'Should return 404')
    t.end()
  })
})

test('POST /api/project/budget/currency tests', function (t) {
  t.test('Successful retrieval by year and name in USD', function (st) {
    const opts = { encoding: 'json', method: 'POST', headers: { 'Content-Type': 'application/json' } }
    const req = servertest(server, '/api/project/budget/currency', opts, function (err, res) {
      st.error(err, 'No error')
      st.equal(res.statusCode, 200, 'Should return 200')
      st.ok(res.body.success, 'Should return success: true')
      st.equal(res.body.data.length, 1, 'Should return one project')
      st.equal(res.body.data[0].projectName, 'Humitas Hewlett Packard', 'Project name should match')
      st.end()
    })
    req.write(JSON.stringify({ year: 2024, projectName: 'Humitas Hewlett Packard', currency: 'USD' }))
    req.end()
  })

  t.test('Successful retrieval by year and name in non-USD currency', function (st) {
    const opts = { encoding: 'json', method: 'POST', headers: { 'Content-Type': 'application/json' } }
    const req = servertest(server, '/api/project/budget/currency', opts, function (err, res) {
      st.error(err, 'No error')
      st.equal(res.statusCode, 200, 'Should return 200')
      st.ok(res.body.success, 'Should return success: true')
      st.equal(res.body.data.length, 1, 'Should return one project')
      st.equal(res.body.data[0].projectName, 'Humitas Hewlett Packard', 'Project name should match')
      st.ok(res.body.data[0].finalBudgetEur, 'Should have finalBudgetEur field')
      st.end()
    })
    req.write(JSON.stringify({ year: 2024, projectName: 'Humitas Hewlett Packard', currency: 'EUR' }))
    req.end()
  })

  t.test('Project not found', function (st) {
    const opts = { encoding: 'json', method: 'POST', headers: { 'Content-Type': 'application/json' } }
    const req = servertest(server, '/api/project/budget/currency', opts, function (err, res) {
      st.error(err, 'No error')
      st.equal(res.statusCode, 200, 'Should return 200')
      st.ok(res.body.success, 'Should return success: true')
      st.equal(res.body.data.length, 0, 'Should return no project')
      st.end()
    })
    req.write(JSON.stringify({ year: 2024, projectName: 'Nonexistent Project', currency: 'USD' }))
    req.end()
  })

  t.test('Internal Server Error', function (st) {
    // Simulate a database error by overriding executeQuery temporarily
    const originalExecuteQuery = db.executeQuery
    db.executeQuery = (query, params) => {
      return new Promise((resolve, reject) => reject(new Error('Simulated database error')))
    }

    const opts = { encoding: 'json', method: 'POST', headers: { 'Content-Type': 'application/json' } }
    const req = servertest(server, '/api/project/budget/currency', opts, function (err, res) {
      st.error(err, 'No error')
      st.equal(res.statusCode, 500, 'Should return 500')
      st.equal(res.body.error, 'Internal Server Error', 'Error message should be Internal Server Error')

      // Restore original executeQuery method
      db.executeQuery = originalExecuteQuery
      st.end()
    })
    req.write(JSON.stringify({ year: 2024, projectName: 'Humitas Hewlett Packard', currency: 'USD' }))
    req.end()
  })

  t.end()
})

test('GET /api/project/budget/:id tests', function (t) {
  t.test('Successful retrieval by ID', function (st) {
    const opts = { encoding: 'json', method: 'GET' }
    servertest(server, '/api/project/budget/1', opts, function (err, res) {
      st.error(err, 'No error')
      st.equal(res.statusCode, 200, 'Should return 200')
      st.equal(res.body.projectName, 'Humitas Hewlett Packard', 'Project name should match')
      st.equal(res.body.year, 2024, 'Year should match')
      st.end()
    })
  })

  t.test('Project not found', function (st) {
    const opts = { encoding: 'json', method: 'GET' }
    servertest(server, '/api/project/budget/999', opts, function (err, res) {
      st.error(err, 'No error')
      st.equal(res.statusCode, 404, 'Should return 404')
      st.equal(res.body.error, 'Not Found', 'Error message should be Not Found')
      st.end()
    })
  })

  t.test('Internal Server Error', function (st) {
    // Simulate a database error by overriding executeQuery temporarily
    const originalExecuteQuery = db.executeQuery
    db.executeQuery = (query, params) => {
      return new Promise((resolve, reject) => reject(new Error('Simulated database error')))
    }

    const opts = { encoding: 'json', method: 'GET' }
    servertest(server, '/api/project/budget/1', opts, function (err, res) {
      st.error(err, 'No error')
      st.equal(res.statusCode, 500, 'Should return 500')
      st.equal(res.body.error, 'Internal Server Error', 'Error message should be Internal Server Error')

      // Restore original executeQuery method
      db.executeQuery = originalExecuteQuery
      st.end()
    })
  })

  t.end()
})

test.onFinish(() => process.exit(0))
