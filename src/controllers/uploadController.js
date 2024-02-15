const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
require('dotenv').config();
const connection = require('../database/db');
var moment = require('moment');
var AWS = require("aws-sdk");
AWS.config = new AWS.Config();

//para generar excel
var xl = require('excel4node');
const path = require('path');
const { log } = require('console');
const { resolve } = require('path');
const { rejects } = require('assert');

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY;

AWS.config.accessKeyId = accessKeyId;
AWS.config.secretAccessKey = secretAccessKey;
AWS.config.region = region;
const url_imagenes = process.env.Url_imagenes;
const storage = new S3( { region, accessKeyId, secretAccessKey})

const uploadToBucket = async (file,id_creado) =>{
    
    //console.log("id para base de datos",id_creado);
    try {

        if(file.length === undefined){
            const stream = fs.createReadStream(file.tempFilePath);
            let time =  Date.now();
            let file_name = time + file.name ;
            const params = { Bucket: 'images-tickets-front', Key: file_name, Body: stream, ACL: "public-read" };
            const info = await storage.upload(params).promise();
            let url = info.Location
            connection.query("INSERT INTO url_imagenes (id_case, url) values  (?,?) ", [ id_creado , url ]);
            
        }else{
            for (let index = 0; index < file.length; index++) {
                const element = file[index];
                const stream = fs.createReadStream(element.tempFilePath);
                let time = Date.now();
                let name = time + element.name ;
                const params = { Bucket: 'images-tickets-front', Key: name, Body: stream, ACL: "public-read" };
                let info =  await storage.upload(params).promise();
                let url = info.Location
                connection.query("INSERT INTO url_imagenes (id_case, url) values  (?,?) ", [ id_creado , url ]);
            }
        }

    } catch (error) {
        console.log(error);
    }

    
       
}


exports.getima = async (req, res) => {
    console.log(req)
}

exports.recorrer = async (req, res) => {
    try {
        claves = Object.values(req.files)
        id_creado = req.body.insertid
        for(let i = 0; i < claves.length; i++){        
        let file = claves[i];
        const respuesta = await uploadToBucket(file,id_creado);
    }
    } catch (error) {
        console.log(error);
    }
    
}


//metodo para generar excel
exports.generateExcel = async (req, res) => {
    try {
       
        const idclients = req.body.client
        const date = req.body.date;
        connection.execute( "select * from cases WHERE create_at < ? and idclients= ? ", [date, idclients], async (error,results ) => {
          if (error) {
            console.log(error);
            return res.status(404).send("Error de consulta de datos");
          } else {
            //console.log(results[0].id);
            var wb = new xl.Workbook();
            var ws = wb.addWorksheet('Reporte Fecha De Creacion');
            var myStyle = wb.createStyle({
                alignment: {
                  horizontal: 'center',
                  vertical:'center'
                }
            });
            ws.cell(1,1).string("id").style(myStyle);
            ws.cell(1,2).string("Nombre").style(myStyle);
            ws.cell(1,3).string("fecha de creacion").style(myStyle);
            ws.cell(1,4).string("estado").style(myStyle);
            ws.cell(1,5).string("descripcion").style(myStyle);
            ws.cell(1,6).string("fecha de solucion").style(myStyle);
            
            let filas = 2;
            console.log(results);
            results.forEach(element => {
                let element_create_at = moment(element.create_at).format("lll")
                let solution_date = moment(element.solution_date).format("lll")
                let columnas = 1;
                let id = element.id
                console.log(element.id);
                ws.cell(filas,columnas).string(String(id));
                columnas++;
                ws.cell(filas,columnas).string(String(element.full_name));
                columnas++;
                ws.cell(filas,columnas).string(String(element_create_at));
                columnas++;
                if(element.status == 1){
                    ws.cell(filas,columnas++).string("pendiente");
                }else if(element.status == 2){
                    ws.cell(filas,columnas++).string("solucionado");
                }      
                ws.cell(filas,columnas++).string(String(element.description));
                if(element.solution_date === null){
                    ws.cell(filas,columnas++).string("")
                }else{
                    ws.cell(filas,columnas++).string(String(solution_date));}
                filas++;
            });
            ws.column(1).setWidth(30);
            ws.column(2).setWidth(30);
            //console.log("excel generado");
            fecha = String(moment().format('lll'))
            
            const buffer = await wb.writeToBuffer();
            const params = { Bucket: 'images-tickets-front', Key: `Reporte Fecha De Creacion ${fecha} .xlsx`, Body: buffer, ACL: "public-read" };
            const info = await storage.upload(params).promise(); 
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
};