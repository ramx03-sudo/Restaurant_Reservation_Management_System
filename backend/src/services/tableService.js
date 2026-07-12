const tableRepository = require('../repositories/tableRepository');
const AppError = require('../utils/AppError');

class TableService {
  async getAllTables() {
    return await tableRepository.findAll();
  }

  async createTable(tableNumber, capacity, isActive) {
    const existingTable = await tableRepository.findByTableNumber(tableNumber);
    if (existingTable) {
      throw new AppError('Table number already exists', 400);
    }
    return await tableRepository.create({ tableNumber, capacity, isActive });
  }

  async updateTable(id, updateData) {
    const table = await tableRepository.update(id, updateData);
    if (!table) {
      throw new AppError('Table not found', 404);
    }
    return table;
  }

  async deleteTable(id) {
    const table = await tableRepository.delete(id);
    if (!table) {
      throw new AppError('Table not found', 404);
    }
    return { message: 'Table deleted successfully' };
  }
}

module.exports = new TableService();
