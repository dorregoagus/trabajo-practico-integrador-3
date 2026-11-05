import { matchedData } from "express-validator";
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
};

export const register = async (req, res) => {
    try {
        const { username, email, password, profile } = matchedData(req);

        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "El nombre de usuario o email ya está registrado"
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            profile
        });

        const token = generateToken({ id: user._id });

        res.cookie("token", token, cookieOptions);

        const userData = user.toObject();
        delete userData.password;

        return res.status(201).json({
            message: "Usuario registrado correctamente",
            user: userData
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al registrar el usuario",
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = matchedData(req);

        const user = await User.findOne({
            email,
            deletedAt: null
        });

        if (!user) {
            return res.status(401).json({
                message: "Email o contraseña incorrectos"
            });
        }

        const passwordIsValid = await comparePassword(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({
                message: "Email o contraseña incorrectos"
            });
        }

        const token = generateToken({ id: user._id });

        res.cookie("token", token, cookieOptions);

        const userData = user.toObject();
        delete userData.password;

        return res.status(200).json({
            message: "Inicio de sesión exitoso",
            user: userData
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al iniciar sesión",
            error: error.message
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userData = req.user.toObject();
        delete userData.password;

        return res.status(200).json({
            message: "Perfil obtenido correctamente",
            user: userData
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener el perfil",
            error: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profile } = matchedData(req);

        req.user.profile = {
            ...req.user.profile.toObject(),
            ...profile
        };

        await req.user.save();

        const userData = req.user.toObject();
        delete userData.password;

        return res.status(200).json({
            message: "Perfil actualizado correctamente",
            user: userData
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al actualizar el perfil",
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("token", cookieOptions);

        return res.status(200).json({
            message: "Sesión cerrada correctamente"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al cerrar sesión",
            error: error.message
        });
    }
};