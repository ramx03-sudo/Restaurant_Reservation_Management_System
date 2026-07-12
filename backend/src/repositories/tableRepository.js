const Table = require('../models/Table');

class TableRepository {
  async findAll() {
    return await Table.find().sort({ tableNumber: 1 });
  }

  async findActive() {
    return await Table.find({ isActive: true }).sort({ capacity: 1 });
  }

  async findById(id) {
    return await Table.findById(id);
  }

  async findByTableNumber(tableNumber) {
    return await Table.findOne({ tableNumber });
  }

  async create(tableData) {
    const table = new Table(tableData);
    return await table.save();
  }

  async update(id, tableData) {
    return await Table.findByIdAndUpdate(id, tableData, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Table.findByIdAndDelete(id);
  }
}

module.exports = new TableRepository();
