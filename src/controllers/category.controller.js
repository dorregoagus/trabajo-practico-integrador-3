import { matchedData } from "express-validator";
import Category from "../models/Category.js";
import Event from "../models/Event.js";

export const createCategory = async (req, res) => {
    try {
        const data = matchedData(req, { locations: ["body"] });

        const existingCategory = await Category.findOne({
            name: data.name
        });

        if (existingCategory) {
            return res.status(400).json({
                message: "Ya existe una categoría con ese nombre"
            });
        }

        const category = await Category.create(data);

        return res.status(201).json({
            message: "Categoría creada correctamente",
            category
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al crear la categoría",
            error: error.message
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate("events");

        return res.status(200).json({
            message: "Categorías obtenidas correctamente",
            categories
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener las categorías",
            error: error.message
        });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id).populate("events");

        if (!category) {
            return res.status(404).json({
                message: "Categoría no encontrada"
            });
        }

        return res.status(200).json({
            message: "Categoría obtenida correctamente",
            category
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener la categoría",
            error: error.message
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = matchedData(req, { locations: ["body"] });

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Categoría no encontrada"
            });
        }

        if (data.name) {
            const existingCategory = await Category.findOne({
                name: data.name,
                _id: { $ne: id }
            });

            if (existingCategory) {
                return res.status(400).json({
                    message: "Ya existe otra categoría con ese nombre"
                });
            }
        }

        Object.assign(category, data);
        await category.save();

        return res.status(200).json({
            message: "Categoría actualizada correctamente",
            category
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al actualizar la categoría",
            error: error.message
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Categoría no encontrada"
            });
        }

        await Event.updateMany(
            { categories: category._id },
            { $pull: { categories: category._id } }
        );

        await Category.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Categoría eliminada correctamente"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al eliminar la categoría",
            error: error.message
        });
    }
};