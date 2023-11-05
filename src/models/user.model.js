const {Schema, model} = require('mongoose');
const shortid = require('shortid');
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
    _id: {
        type: String,
        default: shortid.generate()
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    }

}, {timestamps: true});


userSchema.pre('save', async function (next){
    const user = this
    const hash = await bcrypt.hash(user.password, 10);

    user.password = hash;

    next()
});


userSchema.methods.isValidPassword = async function (password){
    const user = this
    const compare = await bcrypt.compare(password, this.password);

    return compare;
}

const userModel = model('users', userSchema);

module.exports = userModel;
