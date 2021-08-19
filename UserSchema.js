//Import mongoose
const mongoose = require("mongoose");

//User Schema
const UserSchema = new mongoose.Schema ({
    login: String,
    password: {
        type: String,
        validate: [passwordCorrecta, "La password debe tener más de 8 caracteres y sin espacios"]
    },
    name: String,
    surname: String,
    dateOfBirth: Date,
    comments: String,
    rol: {
        type: String,
        enum: ["teacher", "student", "director"]
    },
    addres: String,
    phone: {
        type: Number,
        min: 600000000,
        max: 700000000
    },
    email: String,
    follows: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    photos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo"
    }]
});

//Funcion password
function passwordCorrecta()
    {
        if (this.password.length > 8 && !this.password.includes(" ")) {
            console.log("Password correcta");
            return true;
        }
        else {
            return false;
        }
    }

//Middleware sobre email
function emailCorrecto(next) 
{
    console.log("Middelware sobre email");
    if (this.email.includes("@") && this.email.includes(".com") && !this.email.includes(" "))
    {
        console.log("Email introducido correcto");
        next();
    }
    else {
        console.log("El email introducido no es válido");
    }
}

UserSchema.pre("save", emailCorrecto);

//Export
const User = mongoose.model("User", UserSchema);
module.exports = {
    User,
    UserSchema
}