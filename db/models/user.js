const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Task = require('./tasks');
const Tasks = require('./tasks');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        trim: true,
        validate(value) {
            if (value < 0) {
                throw new Error("Age must not be negative");
            }
        }
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Not in the format of email");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
});

userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.tokens;
    return user;
};

userSchema.statics.findByCredential = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid Credentials");
    return user;
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismyprivatekey');
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

userSchema.statics.encryptPassword = async function (password) {
    return await bcrypt.hash(password, 8);
};

userSchema.statics.removeUser = async function (id) {
    const user = await User.findByIdAndDelete(id)
    if (!user) throw new Error('User Not found : 404');
    await Tasks.deleteMany({ owner: id });
    return user;
}

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
