import Event from "../models/Event.js";

const ownerOrAdminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "No estás autenticado"
            });
        }

        if (req.user.role === "admin") {
            return next();
        }

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Evento no encontrado"
            });
        }

        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "No tenés permisos para modificar este evento"
            });
        }

        req.event = event;

        next();

    } catch (error) {
        return res.status(500).json({
            message: "Error al verificar los permisos",
            error: error.message
        });
    }
};

export default ownerOrAdminMiddleware;