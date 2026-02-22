const TypeSupportClientService = require("../../services/supportClient/TypeSupportClientService");

class TypeSupportClientController {
  static async getAll(req, res) {
    try {
      const data = await TypeSupportClientService.getAll();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const data = await TypeSupportClientService.getById(req.params.id);
      if (!data) return res.status(404).json({ message: "Not found" });
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const data = await TypeSupportClientService.create(req.body);
      res.status(201).json(data);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const data = await TypeSupportClientService.update(req.params.id, req.body);
      if (!data) return res.status(404).json({ message: "Not found" });
      res.json(data);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const data = await TypeSupportClientService.delete(req.params.id);
      if (!data) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = TypeSupportClientController;