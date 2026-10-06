import assert from 'assert';
import http from 'http';
import express from 'express';
import apiRouter from './routes/api.js';
import db, { initDatabase } from './db.js';
import { seedData } from './seed.js';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

async function runBackendTests() {
  console.log('============================================================');
  console.log('SMARTMESS BACKEND & API INTEGRATION TEST SUITE');
  console.log('============================================================\n');

  await initDatabase();
  await seedData();

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(3002, resolve));
  const baseUrl = 'http://localhost:3002/api';

  try {
    // 1. System Health Check
    console.log('[Test 1/7] Testing GET /api/system/health...');
    const healthRes = await fetch(`${baseUrl}/system/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthData.success, true);
    assert.strictEqual(healthData.system.database.status, 'Connected');
    console.log('  ✅ System health returned nominal status.');

    // 2. Single Attendance Swipe Creation
    console.log('[Test 2/7] Testing POST /api/attendance...');
    const attRes = await fetch(`${baseUrl}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: '2026-09-04',
        meal: 'Lunch',
        student_id: 'STU-TEST-999',
        student_name: 'Test Student',
        hostel: 'Aryabhata North',
        status: 'Present',
        source: 'manual'
      })
    });
    const attData = await attRes.json();
    assert.strictEqual(attRes.status, 200);
    assert.strictEqual(attData.success, true);
    console.log('  ✅ Single attendance swipe recorded successfully.');

    // 3. Duplicate Attendance Rejection (409 Conflict)
    console.log('[Test 3/7] Testing Duplicate Attendance Prevention (409)...');
    const dupRes = await fetch(`${baseUrl}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: '2026-09-04',
        meal: 'Lunch',
        student_id: 'STU-TEST-999',
        student_name: 'Test Student',
        hostel: 'Aryabhata North',
        status: 'Present',
        source: 'manual'
      })
    });
    const dupData = await dupRes.json();
    assert.strictEqual(dupRes.status, 409);
    assert.strictEqual(dupData.success, false);
    assert.strictEqual(dupData.error.code, 'DUPLICATE_ATTENDANCE');
    console.log('  ✅ Duplicate attendance successfully caught and rejected (409).');

    // 4. Bulk CSV Ingestion with Deduplication
    console.log('[Test 4/7] Testing POST /api/attendance/bulk (CSV Ingestion Pipeline)...');
    const bulkCsv = `student_id,student_name,hostel,room,date,meal,status
STU-BULK-001,Student One,Aryabhata North,A-101,2026-09-04,Dinner,Present
STU-BULK-002,Student Two,Kalpana Chawla,B-102,2026-09-04,Dinner,Present
STU-BULK-001,Student One,Aryabhata North,A-101,2026-09-04,Dinner,Present`; // intentional duplicate row 3

    const bulkRes = await fetch(`${baseUrl}/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csv_data: bulkCsv,
        source: 'turnstile_biometric',
        filename: 'gate_3_turnstile.csv'
      })
    });
    const bulkData = await bulkRes.json();
    assert.strictEqual(bulkRes.status, 200);
    assert.strictEqual(bulkData.summary.total_rows, 3);
    assert.strictEqual(bulkData.summary.inserted_records, 2);
    assert.strictEqual(bulkData.summary.duplicates_filtered, 1);
    console.log('  ✅ Ingestion pipeline parsed CSV, inserted 2 valid records and filtered 1 duplicate.');

    // 5. Forecast Prediction Endpoint
    console.log('[Test 5/7] Testing POST /api/forecast/predict...');
    const predRes = await fetch(`${baseUrl}/forecast/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: '2026-09-04',
        meal: 'Lunch',
        expected_attendance: 1045,
        menu_item: 'Paneer Butter Masala & Dal Makhani',
        day_type: 'Regular',
        holiday_event: false,
        buffer_percent: 3.5
      })
    });
    const predData = await predRes.json();
    assert.strictEqual(predRes.status, 200);
    assert.strictEqual(predData.success, true);
    assert.ok(predData.prediction.predicted_demand > 0);
    assert.ok(predData.prediction.recommended_preparation >= predData.prediction.predicted_demand);
    assert.ok(predData.prediction.safety_buffer > 0);
    console.log(`  ✅ Forecast calculated: Predicted=${predData.prediction.predicted_demand}, Buffer=+${predData.prediction.safety_buffer}, Recommended=${predData.prediction.recommended_preparation}`);

    // 6. Model Evaluation Benchmarks (MAE, RMSE, MAPE, R²)
    console.log('[Test 6/7] Testing GET /api/model/evaluation...');
    const evalRes = await fetch(`${baseUrl}/model/evaluation`);
    const evalData = await evalRes.json();
    assert.strictEqual(evalRes.status, 200);
    assert.ok(evalData.benchmarks.random_forest.mae > 0);
    assert.ok(evalData.benchmarks.random_forest.mape > 0);
    assert.ok(evalData.benchmarks.baseline_moving_average.mae > 0);
    console.log(`  ✅ Evaluation benchmarks verified: RF MAE=${evalData.benchmarks.random_forest.mae} meals, MAPE=${evalData.benchmarks.random_forest.mape}%, R²=${evalData.benchmarks.random_forest.r2}`);

    // 7. Data Quality Diagnostics Scorecard
    console.log('[Test 7/7] Testing GET /api/data-quality...');
    const dqRes = await fetch(`${baseUrl}/data-quality`);
    const dqData = await dqRes.json();
    assert.strictEqual(dqRes.status, 200);
    assert.ok(dqData.status === 'GOOD' || dqData.status === 'WARNING');
    assert.ok(dqData.metrics.total_attendance_records > 0);
    console.log(`  ✅ Data quality scorecard verified: Status=${dqData.status}, Total records=${dqData.metrics.total_attendance_records}`);

    console.log('\n============================================================');
    console.log('🎉 ALL 7 BACKEND INTEGRATION TESTS PASSED CLEANLY!');
    console.log('============================================================');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runBackendTests();
