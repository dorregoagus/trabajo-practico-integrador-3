import { verifyToken } from "../helpers/jwt.helper.js";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "No estás autenticado"
            });
        }

        let decoded;

        try {
            decoded = verifyToken(token);
        } catch (error) {
            return res.status(401).json({
                message: "Token inválido o expirado"
            });
        }

        const user = await User.findOne({
            _id: decoded.id,
            deletedAt: null
        });

        if (!user) {
            return res.status(401).json({
                message: "Usuario no encontrado o inactivo"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(500).json({
            message: "Error al autenticar al usuario",
            error: error.message
        });
    }
};

export default authMiddleware;