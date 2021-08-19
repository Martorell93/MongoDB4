//MongoDB4

//Reto
//Importamos los módulos necesarios
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const Photo = require("./PhotosSchema");
const User = require("./UserSchema");

//Uso del express y JSONs
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

//Conecto con la BBDD de Mongo
const urlDataBase = "mongodb://localhost:27017/instagram";
mongoose.connect(urlDataBase, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });


//Constantes
const sendBody = {
    "status" : null,
    "message": null,
    "data": null
}
//Metódo GET sobre photos
app.get("/photos", 
    function(request, response)
        {
            let id = request.query.id;
            if (id) {
                User.User.find({_id: id}, {photos: 1}).populate("photos")
                .then(function(data)
                {
                    sendBody.status = 200;
                    sendBody.message = `Usuario con id ${id} se muestran sus fotos`
                    sendBody.data = data;
                    response.status(200).send(sendBody);
                    mongoose.disconnect();
                    console.log(`Se ha pedido un GET de fotos con el usuario id ${id}`)
                })
                .catch(function (err)
                {
                    console.log(err);
                    sendBody.status = 400;
                    sendBody.message = `No existe usuario con ${id}`;
                    response.send(sendBody);
                    mongoose.disconnect();
                })
            }
        }
);

//Método POST sobre photos
app.post("/photos", 
    function (request, response) {   
        let newPhoto = new Photo.Photo ({
            usuario : request.body.usuario,
            url: request.body.url,
            titulo: request.body.titulo,
            descripcion: request.body.descripcion
        });
        console.log(newPhoto);
        Photo.Photo.create(newPhoto)
        .then(function(data)
        {
            sendBody.status = 200;
            sendBody.message = `Foto creada con id ${data._id}`;
            sendBody.data = data;
            response.status(200).send(sendBody);
            mongoose.disconnect();
            console.log(`Se ha echo un POST de una foto`)
        })
        .catch(function (err)
        {
            console.log(err);
            sendBody.status = 400;
            sendBody.message = `No se ha creado la foto`;
            response.send(sendBody);
            mongoose.disconnect();
        })
    }
);

//Método DEL sobre fotos
app.delete("/photos", function (request, response) {
    let id = request.body.id;
    let tituloBorrar = request.body.titulo;
    if(tituloBorrar) {
        Photo.Photo.deleteOne({usuario: id, titulo: tituloBorrar})
        .then(function(data) {
            sendBody.status = 200;
            sendBody.message = `Fotos eliminada del usuario con id ${id} y titulo ${tituloBorrar}`;
            sendBody.data = data;
            response.send(sendBody);
            mongoose.disconnect();
            console.log(`Foto eliminada del usuario con id ${id} con titulo ${tituloBorrar}`);
        })
        .catch(function(err) {
            console.log(err);
            sendBody.status = 400;
            sendBody.message = `No se ha eliminado la foto`;
            response.send(sendBody);
            mongoose.disconnect();
        })
    }
    else {
        Photo.Photo.deleteMany({usuario: id}, )
        .then(function(data) {
            sendBody.status = 200;
            sendBody.message = `Fotos eliminada del usuario con id ${id}`;
            sendBody.data = data;
            response.send(sendBody);
            mongoose.disconnect();
            console.log(`Fotos eliminada del usuario con id ${id}`);
        })
        .catch(function(err) {
            sendBody.status = 400;
            sendBody.message = `No se ha borrado la foto`;
            response.send(sendBody);
            mongoose.disconnect();
        })
    }
});

//Método PUT sobre follow
app.put("/follow", function(request, response) {
    let id = request.body.id;
    let usuarioDestino = request.body.usuario;
    User.User.findOne({_id: id})
    .then(function(data1) {
        let seguidores = data1.follows;
        seguidores.push(usuarioDestino);
        return User.User.updateOne({_id: id}, {follows: seguidores})
    })
    .then(function(data) {
        sendBody.status = 200;
        sendBody.message = `Usuario con id ${id} ha empezado a seguir a ${usuarioDestino}`;
        sendBody.data = data;
        response.send(sendBody);
        mongoose.disconnect();
        console.log(`Usuario con id ${id} ha empezado a seguir a ${usuarioDestino}`);
    })
    .catch(function(err) {
        sendBody.status = 400;
        sendBody.message = `No ha funcionado el follow`;
        response.send(sendBody);
        mongoose.disconnect();
    })
});

//Método PUT sobre unfollow
app.put("/unfollow", function(request, response) {
    let id = request.body.id;
    let usuarioDestino = request.body.usuario;
    User.User.findOne({_id: id})
    .then(function(data1) {
        let seguidores = data1.follows;
        for (let i = 0; i < seguidores.length; i++) {
            if(seguidores[i] == usuarioDestino) {
                seguidores.splice(i, 1);
                console.log(seguidores);
            }
        }
        return User.User.updateOne({_id: id}, {follows: seguidores})
    })
    .then(function(data) {
        sendBody.status = 200;
        sendBody.message = `Usuario con id ${id} ha dejado de seguir a ${usuarioDestino}`;
        sendBody.data = data;
        response.send(sendBody);
        mongoose.disconnect();
        console.log(`Usuario con id ${id} ha dejado de seguir a ${usuarioDestino}`);
    })
    .catch(function(err) {
        sendBody.status = 400;
        sendBody.message = `No ha funcionado el unfollow`;
        response.send(sendBody);
        mongoose.disconnect();
    })
});

//Metodo GET timeline
app.get("/timeline", function(request, response) 
{
    let id = request.query.id;
    User.User.find({_id: id}, {follows: 1})
    .populate({
    "path" : "follows",
    "populate" : {
        "path": "photos",
        "select": "url titulo descripcion"
    },
    "select": "photos"
    })
    .then(function(data)
    {
        sendBody.status = 200;
        sendBody.message = `Timeline del usuario con id ${id}`;
        sendBody.data = data;
        response.send(sendBody);
        mongoose.disconnect();
        console.log(`Timeline del usuario con id ${id}`);
    })
    .catch(function (err)
    {
        sendBody.status = 400;
        sendBody.message = `No ha funcionado el timeline`;
        response.send(sendBody);
        mongoose.disconnect();
    })
})

//listen
app.listen(3000);