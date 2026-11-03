import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 2,
        maxlength: 30,
        trim: true
    },
    description: {
        type: String,
        maxlength: 200
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

categorySchema.virtual("events", {
    ref: "Event",
    localField: "_id",
    foreignField: "categories"
});

const Category = mongoose.model("Category", categorySchema);

export default Category;