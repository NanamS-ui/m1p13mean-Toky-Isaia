const EventService = require("../../services/events/EventService");

exports.createEvent = async (req, res) => {
  try {
    const event = await EventService.createEvent(req.body, req.user.id);
    res.status(201).json(event);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const published = req.query.published;
    const options = {};
    if (published === "true") options.published = true;
    if (published === "false") options.published = false;

    // Si l'utilisateur n'est pas authentifié, on ne retourne que les événements publiés.
    if (!req.user) {
      options.published = true;
    }

    const events = await EventService.getEvents(options);
    res.json(events);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await EventService.getEventById(req.params.id);

    // Public: ne pas exposer un brouillon.
    if (!req.user && !event?.published) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    res.json(event);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await EventService.updateEvent(req.params.id, req.body);
    res.json(event);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await EventService.deleteEvent(req.params.id);
    res.json({ message: "Événement supprimé" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
