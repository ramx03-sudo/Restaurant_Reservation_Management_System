const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const { createTableSchema, updateTableSchema, deleteTableSchema } = require('../validations/tableValidation');

// Accessible by authenticated users to see table list
router.get('/', auth, tableController.getAllTables);

// Admin-only endpoints
router.post('/', auth, admin, validate(createTableSchema), tableController.createTable);
router.put('/:id', auth, admin, validate(updateTableSchema), tableController.updateTable);
router.delete('/:id', auth, admin, validate(deleteTableSchema), tableController.deleteTable);

module.exports = router;
