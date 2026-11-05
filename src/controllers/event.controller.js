import { matchedData } from "express-validator";
import Event from "../models/Event.js";
import Category from "../models/Category.js";

const populateEvent = (query) => {
    return query
        .populate("organizer", "username email profile")
        .populate("categories", "name description");
};

const validateCategories = async (categories) => {
    if (!categories) return true;

    const foundCategories = await Category.countDocuments({
        _id: { $in: categories }
    });

    return foundCategories === categories.length;
};

export const createEvent = async (req, res) => {
    try {
        const data = matchedData(req, { locations: ["body"] });

        const existingEvent = await Event.findOne({
            title: data.title
        });

        if (existingEvent) {
            return res.status(400).json({
                message: "Ya existe un evento con ese título"
            });
        }

        const categoriesAreValid = await validateCategories(data.categories);

        if (!categoriesAreValid) {
            return res.status(400).json({
                message: "Una o más categorías no existen"
            });
        }

        if (new Date(data.endDate) <= new Date(data.startDate)) {
            return res.status(400).json({
                message: "La fecha de finalización debe ser posterior a la fecha de inicio"
            });
        }

        const event = await Event.create({
            ...data,
            organizer: req.user._id
        });

        const populatedEvent = await populateEvent(
            Event.findById(event._id)
        );

        return res.status(201).json({
            message: "Evento creado correctamente",
            event: populatedEvent
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al crear el evento",
            error: error.message
        });
    }
};

export const getEvents = async (req, res) => {
    try {
        const events = await populateEvent(Event.find());

        return res.status(200).json({
            message: "Eventos obtenidos correctamente",
            events
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los eventos",
            error: error.message
        });
    }
};

export const getMyEvents = async (req, res) => {
    try {
        const events = await populateEvent(
            Event.find({ organizer: req.user._id })
        );

        return res.status(200).json({
            message: "Tus eventos fueron obtenidos correctamente",
            events
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener tus eventos",
            error: error.message
        });
    }
};

export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await populateEvent(Event.findById(id));

        if (!event) {
            return res.status(404).json({
                message: "Evento no encontrado"
            });
        }

        return res.status(200).json({
            message: "Evento obtenido correctamente",
            event
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener el evento",
            error: error.message
        });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const data = matchedData(req, { locations: ["body"] });

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                message: "Evento no encontrado"
            });
        }

        if (data.title) {
            const existingEvent = await Event.findOne({
                title: data.title,
                _id: { $ne: id }
            });

            if (existingEvent) {
                return res.status(400).json({
                    message: "Ya existe otro evento con ese título"
                });
            }
        }

        if (data.categories) {
            const categoriesAreValid = await validateCategories(data.categories);

            if (!categoriesAreValid) {
                return res.status(400).json({
                    message: "Una o más categorías no existen"
                });
            }
        }

        const startDate = data.startDate || event.startDate;
        const endDate = data.endDate || event.endDate;

        if (new Date(endDate) <= new Date(startDate)) {
            return res.status(400).json({
                message: "La fecha de finalización debe ser posterior a la fecha de inicio"
            });
        }

        Object.assign(event, data);

        await event.save();

        const populatedEvent = await populateEvent(
            Event.findById(event._id)
        );

        return res.status(200).json({
            message: "Evento actualizado correctamente",
            event: populatedEvent
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al actualizar el evento",
            error: error.message
        });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                message: "Evento no encontrado"
            });
        }

        await Event.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Evento eliminado correctamente"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al eliminar el evento",
            error: error.message
        });
    }
};