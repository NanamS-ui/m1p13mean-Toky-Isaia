const TypeSupportClient = require("../../models/supportClient/type_support_client");

class TypeSupportClientService {
  static async getAll() {
    return TypeSupportClient.find({});
  }

  static async getById(id) {
    return TypeSupportClient.findById(id);
  }

  static async create(data) {
    return TypeSupportClient.create(data);
  }

  static async update(id, data) {
    return TypeSupportClient.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id) {
    return TypeSupportClient.findByIdAndDelete(id);
  }
}

module.exports = TypeSupportClientService;