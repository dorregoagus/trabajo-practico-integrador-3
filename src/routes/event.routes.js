import express from "express";
import { body, param } from "express-validator";

import {
    createEvent,
    getEvents,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent
} from "../controllers/event.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import ownerOrAdminMiddleware from "../middlewares/ownerOrAdmin.middleware.js";
import validateMiddleware from "../middlewares/validate.middleware.js";

const router = express.Router();

const idValidation = [
    param("id")
        .isMongoId()
        .withMessage("El ID del evento no es válido")
];

const createEventValidation = [
    body("title")
        .trim()
        .isLength({ min: 3, max: 150 })
        .withMessage("El título debe tener entre 3 y 150 caracteres"),

    body("description")
        .trim()
        .isLength({ min: 20 })
        .withMessage("La descripción debe tener al menos 20 caracteres"),

    body("startDate")
        .isISO8601()
        .withMessage("Ingresá una fecha de inicio válida")
        .toDate(),

    body("endDate")
        .isISO8601()
        .withMessage("Ingresá una fecha de finalización válida")
        .toDate(),

    body("capacity")
        .isInt({ min: 1 })
        .withMessage("La capacidad debe ser un número entero mayor o igual a 1")
        .toInt(),

    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("El precio debe ser mayor o igual a 0")
        .toFloat(),

    body("status")
        .optional()
        .isIn(["scheduled", "cancelled", "finished"])
        .withMessage("El estado del evento no es válido"),

    body("location")
        .isObject()
        .withMessage("La ubicación debe ser un objeto"),

    body("location.venue")
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("El lugar debe tener entre 3 y 100 caracteres"),

    body("location.address")
        .trim()
        .isLength({ min: 5, max: 150 })
        .withMessage("La dirección debe tener entre 5 y 150 caracteres"),

    body("location.city")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

    body("categories")
        .optional()
        .isArray()
        .withMessage("Las categorías deben enviarse como un arreglo"),

    body("categories.*")
        .optional()
        .isMongoId()
        .withMessage("Uno de los IDs de categoría no es válido")
];

const updateEventValidation = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 3, max: 150 })
        .withMessage("El título debe tener entre 3 y 150 caracteres"),

    body("description")
        .optional()
        .trim()
        .isLength({ min: 20 })
        .withMessage("La descripción debe tener al menos 20 caracteres"),

    body("startDate")
        .optional()
        .isISO8601()
        .withMessage("Ingresá una fecha de inicio válida")
        .toDate(),

    body("endDate")
        .optional()
        .isISO8601()
        .withMessage("Ingresá una fecha de finalización válida")
        .toDate(),

    body("capacity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("La capacidad debe ser un número entero mayor o igual a 1")
        .toInt(),

    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("El precio debe ser mayor o igual a 0")
        .toFloat(),

    body("status")
        .optional()
        .isIn(["scheduled", "cancelled", "finished"])
        .withMessage("El estado del evento no es válido"),

    body("location")
        .optional()
        .isObject()
        .withMessage("La ubicación debe ser un objeto"),

    body("location.venue")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("El lugar debe tener entre 3 y 100 caracteres"),

    body("location.address")
        .optional()
        .trim()
        .isLength({ min: 5, max: 150 })
        .withMessage("La dirección debe tener entre 5 y 150 caracteres"),

    body("location.city")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

    body("categories")
        .optional()
        .isArray()
        .withMessage("Las categorías deben enviarse como un arreglo"),

    body("categories.*")
        .optional()
        .isMongoId()
        .withMessage("Uno de los IDs de categoría no es válido")
];

router.use(authMiddleware);

router.post("/", createEventValidation, validateMiddleware, createEvent);

router.get("/", getEvents);

router.get("/my", getMyEvents);

router.get("/:id", idValidation, validateMiddleware, getEventById);

router.put(
    "/:id",
    idValidation,
    updateEventValidation,
    validateMiddleware,
    ownerOrAdminMiddleware,
    updateEvent
);

router.delete(
    "/:id",
    idValidation,
    validateMiddleware,
    ownerOrAdminMiddleware,
    deleteEvent
);

export default router;