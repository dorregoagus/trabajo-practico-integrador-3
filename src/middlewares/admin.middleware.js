const adminMiddleware = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "No estás autenticado"
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "No tenés permisos para realizar esta operación"
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            message: "Error al verificar los permisos",
            error: error.message
        });
    }
};

export default adminMiddleware;