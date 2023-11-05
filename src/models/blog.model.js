const {Schema, model, SchemaType} = require('mongoose');
const shortid = require('shortid');

const blogSchema = new Schema({
    _id: {
        type: String,
        default: shortid.generate()
    },
    title: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String
    },
    body: {
        type: String,
        required: true
    },
    author: {
        type: String
    },
    state: {
        type: String,
        enum: ["draft", "published"],
        default: "draft"
    },
    tags: {
        type: Schema.Types.Array
    },
    read_count: Number,
    reading_time: String,
    time_published: {
        type: Date,
        default: Date.now()
    },
    user_id: {
        type: String,
        ref: "users"
    }
}, {timestamps: true});


const blogModel = model("blogs", blogSchema);

module.exports = blogModel
