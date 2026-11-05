import { matchedData } from "express-validator";
import User from "../models/User.js";
import Event from "../models/Event.js";
import { hashPassword } from "../helpers/bcrypt.helper.js";

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({ deletedAt: null })
            .select("-password")
            .populate("events");

        return res.status(200).json({
            message: "Usuarios obtenidos correctamente",
            users
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los usuarios",
            error: error.message
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({
            _id: id,
            deletedAt: null
        })
            .select("-password")
            .populate("events");

        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        return res.status(200).json({
            message: "Usuario obtenido correctamente",
            user
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener el usuario",
            error: error.message
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const data = matchedData(req, { locations: ["body"] });

        const user = await User.findOne({
            _id: id,
            deletedAt: null
        });

        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        if (data.username || data.email) {
            const existingUser = await User.findOne({
                _id: { $ne: id },
                deletedAt: null,
                $or: [
                    ...(data.username ? [{ username: data.username }] : []),
                    ...(data.email ? [{ email: data.email }] : [])
                ]
            });

            if (existingUser) {
                return res.status(400).json({
                    message: "El nombre de usuario o email ya está registrado"
                });
            }
        }

        if (data.username) user.username = data.username;
        if (data.email) user.email = data.email;
        if (data.role) user.role = data.role;

        if (data.password) {
            user.password = await hashPassword(data.password);
        }

        if (data.profile) {
            user.profile = {
                ...user.profile.toObject(),
                ...data.profile
            };
        }

        await user.save();

        const userData = user.toObject();
        delete userData.password;

        return res.status(200).json({
            message: "Usuario actualizado correctamente",
            user: userData
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al actualizar el usuario",
            error: error.message
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({
            _id: id,
            deletedAt: null
        });

        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        user.deletedAt = new Date();
        await user.save();

        await Event.deleteMany({
            organizer: user._id
        });

        return res.status(200).json({
            message: "Usuario eliminado correctamente junto con sus eventos"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al eliminar el usuario",
            error: error.message
        });
    }
};