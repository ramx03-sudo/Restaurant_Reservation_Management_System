const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public or Customer route (to see tables)
router.get('/', tableController.getAllTables);

// Admin only routes
router.post('/', auth, admin, tableController.createTable);
router.put('/:id', auth, admin, tableController.updateTable);
router.delete('/:id', auth, admin, tableController.deleteTable);

module.exports = router;
