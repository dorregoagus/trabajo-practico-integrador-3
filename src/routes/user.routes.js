import express from "express";
import { body, param } from "express-validator";

import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from "../controllers/user.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import validateMiddleware from "../middlewares/validate.middleware.js";

const router = express.Router();

const updateUserValidation = [
    body("username")
        .optional()
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage("El nombre de usuario debe tener entre 3 y 20 caracteres")
        .isAlphanumeric()
        .withMessage("El nombre de usuario solo puede contener letras y números"),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Ingresá un email válido")
        .normalizeEmail(),

    body("password")
        .optional()
        .isLength({ min: 8 })
        .withMessage("La contraseña debe tener al menos 8 caracteres")
        .matches(/[a-z]/)
        .withMessage("La contraseña debe contener una letra minúscula")
        .matches(/[A-Z]/)
        .withMessage("La contraseña debe contener una letra mayúscula")
        .matches(/[0-9]/)
        .withMessage("La contraseña debe contener un número"),

    body("role")
        .optional()
        .isIn(["user", "admin"])
        .withMessage("El rol debe ser user o admin"),

    body("profile")
        .optional()
        .isObject()
        .withMessage("El perfil debe ser un objeto"),

    body("profile.firstName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("El nombre debe tener entre 2 y 50 caracteres")
        .matches(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/)
        .withMessage("El nombre solo puede contener letras"),

    body("profile.lastName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("El apellido debe tener entre 2 y 50 caracteres")
        .matches(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/)
        .withMessage("El apellido solo puede contener letras"),

    body("profile.birthDate")
        .optional({ values: "falsy" })
        .isISO8601()
        .withMessage("Ingresá una fecha de nacimiento válida")
        .toDate()
        .custom(value => value <= new Date())
        .withMessage("La fecha de nacimiento no puede ser futura"),

    body("profile.phone")
        .optional({ values: "falsy" })
        .matches(/^\d{8,15}$/)
        .withMessage("El teléfono debe tener entre 8 y 15 números")
];

const idValidation = [
    param("id")
        .isMongoId()
        .withMessage("El ID del usuario no es válido")
];

router.use(authMiddleware, adminMiddleware);

router.get("/", getUsers);

router.get("/:id", idValidation, validateMiddleware, getUserById);

router.put("/:id", idValidation, updateUserValidation, validateMiddleware, updateUser);

router.delete("/:id", idValidation, validateMiddleware, deleteUser);

export default router;