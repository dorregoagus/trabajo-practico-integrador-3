import express from "express";
import { body, param } from "express-validator";

import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from "../controllers/category.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import validateMiddleware from "../middlewares/validate.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
    "/",
    adminMiddleware,
    [
        body("name")
            .trim()
            .isLength({ min: 2, max: 30 })
            .withMessage("El nombre debe tener entre 2 y 30 caracteres"),

        body("description")
            .optional()
            .trim()
            .isLength({ max: 200 })
            .withMessage("La descripción no puede superar los 200 caracteres")
    ],
    validateMiddleware,
    createCategory
);

router.get("/", getCategories);

router.get(
    "/:id",
    param("id").isMongoId().withMessage("El ID de la categoría no es válido"),
    validateMiddleware,
    getCategoryById
);

router.put(
    "/:id",
    adminMiddleware,
    [
        param("id").isMongoId().withMessage("El ID de la categoría no es válido"),

        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 30 })
            .withMessage("El nombre debe tener entre 2 y 30 caracteres"),

        body("description")
            .optional()
            .trim()
            .isLength({ max: 200 })
            .withMessage("La descripción no puede superar los 200 caracteres")
    ],
    validateMiddleware,
    updateCategory
);

router.delete(
    "/:id",
    adminMiddleware,
    param("id").isMongoId().withMessage("El ID de la categoría no es válido"),
    validateMiddleware,
    deleteCategory
);

export default router;