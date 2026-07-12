const tableService = require('../services/tableService');
const ApiResponse = require('../utils/ApiResponse');

exports.getAllTables = async (req, res, next) => {
  try {
    const tables = await tableService.getAllTables();
    new ApiResponse(200, tables, 'Tables fetched successfully').send(res);
  } catch (error) {
    next(error);
  }
};

exports.createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, isActive } = req.body;
    const table = await tableService.createTable(tableNumber, capacity, isActive);
    new ApiResponse(201, table, 'Table created successfully').send(res);
  } catch (error) {
    next(error);
  }
};

exports.updateTable = async (req, res, next) => {
  try {
    const table = await tableService.updateTable(req.params.id, req.body);
    new ApiResponse(200, table, 'Table updated successfully').send(res);
  } catch (error) {
    next(error);
  }
};

exports.deleteTable = async (req, res, next) => {
  try {
    const result = await tableService.deleteTable(req.params.id);
    new ApiResponse(200, null, result.message).send(res);
  } catch (error) {
    next(error);
  }
};
