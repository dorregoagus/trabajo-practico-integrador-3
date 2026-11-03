import { validationResult } from "express-validator";

const validateMiddleware = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Error en los datos enviados",
            errors: errors.array()
        });
    }

    next();
};

export default validateMiddleware;