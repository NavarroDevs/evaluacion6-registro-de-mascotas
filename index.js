import express from 'express';
import { v4 as uuid } from 'uuid';
const app = express();
import fs from 'fs';
import { create } from 'express-handlebars'
import {leerMascotas, guardarMascota, eliminarMascota, eliminarMascotaPorRun, leerMascotasPorId,leerMascotasporNombre, leerMascotasPorRut } from './consultas.js'
import cors from 'cors';
import fileUpload from 'express-fileupload';

// para el uso de handlebars
import * as path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

//publicar una carpeta o archivo - SE PUBLICA CARPETA DE IMÁGENES
app.use("/imgs", express.static(__dirname+"/public/imgs"));

//midleware
app.use(express.json());
app.use(express.urlencoded({extend:false}));
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit: "La imágen que está subiendo sobrepasa los 5mb permitidos."
}));

app.use(cors());


app.listen(3000, () => console.log("servidor en http://localhost:3000"))

// configuracion Handlebars
const hbs = create({
	partialsDir: [
			"views/partials/",
	],
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views"));

let mascota ={ 
    id: "",
    nombre:"",
    propietario:""
}

let propietario ={ 
    id: "",
    run:"",
    nombre:""
}


// 1 aqui retrornamos todas las mascotas 
app.get("/mascotas", (req, res) => {
    try {
        let mascotas = leerMascotas();
     
        res.json({code: 200, data: mascotas});
    } catch (error) {
        res.status(500).json({code: 500, message: "ha ocurrido un error al buscar las mascotas."})
    }
  
})

// 2 aqui buscamos la mascota por nombre
app.get("/mascotas/:nombre", (req, res) => {
    try {
        let {nombre} = req.params;
        let data = leerMascotas();
        let filterMascotas = data.mascotas.filter(mascota => mascota.nombre == nombre)
        res.json({code: 200, data: filterMascotas});
    } catch (error) {
        res.status(500).json({code: 500, message: "ha ocurrido un error al buscar las mascotas."})
    }

})

// 3 aqui buscamos la mascota por rut del dueño
app.get("/mascotas/propietario/:run", (req, res) => {
    try {
        let {run} = req.params;
        let data = leerMascotas();
        let filterMascotas = data.mascotas.filter(mascota => mascota.propietario.run == run)
        res.json({code: 200, data: filterMascotas});
    } catch (error) {
        res.status(500).json({code: 500, message: "ha ocurrido un error al buscar las mascotas."})
    }

})


//4 guardar mascota put esto para hacer el post de guardar macota con esto guardamos una mascota
// hacer un post guardar mascota stringifi convierto en json para guardar con null le doy espacio


app.post("/mascotas",(req, res) => {
    try {
        let {mascota, run, propietario } = req.body;

        if (!mascota || !run || !propietario) {
           return  res.status(400).json({code:400, message: "Debe enviar todos los datos requeridos [nombre mascota,run,nombre propietario]"})
        }
        let nuevaMascota ={
            id: uuid().slice(0,6),
            nombre:mascota,
            propietario: {
                run:run,
                nombre:propietario

    }
        
    } 
    
guardarMascota(nuevaMascota);
    res.json({code:201, message:`Mascota ${mascota} creada correctamente`})
}catch (error) {
        
    res.status(500).json({code: 500, message: "ha ocurrido un error al buscar la mascota."})


    }
   
})




app.delete("/mascotas/:nombre", (req, res) => {
    try {
        let { nombre }= req.params;
        if(eliminarMascota(nombre)){
            res.json({code:200, message:`Mascota ${nombre} eliminada correctamente`})
        }else{
             res.status(400).json({code: 400, message: `Mascota con nombre ${nombre}  no existe`});
        }
    } catch (error) {
        res.status(500).json({code: 500, message: "ha ocurrido un error al buscar las mascotas"})
    }


})




app.delete("/mascotas/propietario/:run", (req, res) => {
    try {
        let { run}= req.params;
        console.log(run);
        if(eliminarMascotaPorRun(run)){
            res.json({code:200, message:`Mascotas del propietario con el RUN ${run} eliminadas correctamente`})
        }else{
             res.status(400).json({code: 400, message: `propietario no existe en el sistema`});
        }
    } catch (error) {
        res.status(500).json({code: 500, message: "ha ocurrido un error al eliminar las mascotas"})
    }


})

// rutas de las vistas

app.get("/", (req, res) =>{
    res.render("home");
})



app.get("/mostrarTodas",(req,res)=> {
    let mascotas = leerMascotas();
    res.render("mostrarTodas", {
        mascotas: mascotas.mascotas
    })
})




app.get("/detalle_mascota/:id",(req,res)=> {
    let { id } = req.params;
    if(!id) return res.send("debes enviar los datos solicitados.")
    let mascota = leerMascotasPorId(id) 
    res.render("detalle_mascota", {
        mascota
    })
})


app.get("/nueva_Mascota",(req,res)=> {
    res.render("nueva_Mascota")
})

app.get("/mostrarporRut/:run",(req,res)=> {
    let run = req.params.run
    let  mascotas= leerMascotasPorRut(run)
    
    res.render("mostrarporRut",{
        mascotas
    })
})



app.get("/mostrarporNombre/:nombre",(req,res)=> {
    let nombre = req.params.nombre
    let  mascota= leerMascotasporNombre(nombre)
    
    res.render("mostrarporNombre",{
        mascota
    })
})

// app.get("/mostrarporNombre",(req,res)=> {
//     res.render("mostrarporNombre")
// })