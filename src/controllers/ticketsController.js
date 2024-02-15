const connection = require("../database/db");
const upload = require("../controllers/uploadController");

//creacion ticktes
exports.createTicket = async (req, res) => {
  try {
    const name = req.body.name;
    const date = req.body.date;
    const description = req.body.description;
    const client = req.body.client;
    const rol = req.body.idrol;
    const type_support = req.body.type_support;
    const title = req.body.title;
    const cliente = req.body.cliente;
    const url = req.body.url;
    const vigilancia = req.body.vigilancia;
    const plataforma = req.body.plataforma;
    const priority = req.body.priority;
    const tipificacion = req.body.tipificacion;
    const solucion_esperada = req.body.solucion_esperada
    const cupo = req.body.cupo
    const topologia = req.body.topologia

    
    if (date == "" || description == "" || client == "" || rol == "" || 
    title == "" || priority == "") {
      return res.status(401).json({ status: false, message: "Campos sin informacion", data: [req.body] });
    } else {
      connection.query(
        "INSERT INTO cases (full_name,create_at,status,description,responder,idclients,idrol,type_support,title,cliente,url,vigilancia,platform,priority,tipificacion,solucion_esperada,cupo,topologia) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ",
        [name, date, 1, description, 1, client, rol,type_support, title, cliente, url, vigilancia, plataforma, priority, tipificacion, solucion_esperada, cupo, topologia ], 
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            let id = results.insertId
            req.body["insertId"] = id 
            return res.status(200).json({ status: true, message: "Creacion exitosa", data: [req.body]});
            /* connection.query("INSERT INTO url_imagenes(id_case) values (?)",[id],(error)=>{
              if(error){
                console.log(error);
              }
            }) */
            
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Error al crear caso", data: [req.body] });
  }
};

//consulta tickets
exports.getTickets = async (req, res) => {
  try {

    const idclients = req.body.client;
    //console.log(idclients);

    connection.execute( "select * from cases WHERE idclients= (?) order by id desc", [idclients], async (error, results, fields) => {
        if (error) {
          console.log(error);
          return res.status(404).send("Error de consulta de datos");
        } else {
          return res.status(200).json({ status: true, message: "Consulta exitosa", data: [results] });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Error Del Sistema", data: [req.body] });
  }
};

//actualizar estado del ticket a solucionado
exports.update = async (req, res) => {
  try {
    const id = req.body.id;
    const solution_date = req.body.solution_date;
    const comentario_dev = req.body.comentario_dev;
    if(!id || !solution_date || !comentario_dev ){
      return res.status(401).json({ status: false, message: "Campos sin informacion", data: [req.body] });
    }
    connection.query(
      "update cases set status = 2, solution_date = ?, comentario_dev = ? WHERE id = ?",
      [solution_date, comentario_dev, id],
      async (error, results) => {
        if (error) {
          console.log(error);
          return res.status(404).send("Error de consulta de datos");
        } else {
          return res
            .status(200)
            .json({
              status: true,
              message: "Actualizacion exitosa",
              data: [results],
            });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Error Del Sistema", data: [req.body] });
  }
};

//obtener ticket por id
exports.getTicket = async (req, res) => {
  try {
    const id = req.body.id;
    connection.execute(
      "select * from cases WHERE id= (?) ",
      [id],
      async (error, results ) => {
        if (error) {
          console.log(error);
          return res.status(404).send("Error de consulta de datos");
        } else {
            if(results != ""){
              return res.status(200).json({
                status: true,
                message: "Consulta exitosa",
                data: [results],
              });

          }else{
            return res.status(404).send("No existe ningun caso asignado con es numero de id");
          }
          
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Error Del Sistema", data: [req.body] });
  }
};

//cambiar la descripcion del caso
exports.updatedescription = async (req, res) => {
  try {
    const id = req.body.id;
    const description = req.body.description;
    connection.execute(
      "select * from cases WHERE id= (?) ",
      [id],
      async (error, results) => {
        if (error) {
          console.log(error);
          return res.status(404).send("Error de consulta de informacion del Caso");
        } else {
          connection.query(
            "INSERT INTO log_cases (id_cases,full_name,create_at,status,description,responder,idclients,idrol) values (?,?,?,?,?,?,?,?) ",
            [
              results[0].id,
              results[0].full_name,
              results[0].create_at,
              results[0].status,
              results[0].description,
              results[0].responder,
              results[0].idclients,
              results[0].idrol,
            ],
            (error, results) => {
              if (error) {
                console.log(error);
              } else {
                connection.query(
                  "update cases set description = ? WHERE id = ?",
                  [description, id],
                  async (error, results) => {
                    if (error) {
                      console.log(error);
                      return res.status(404).send("Error de actualizacion del caso");
                    } else {
                      return res.status(200).json({ status: true, message: "Actualizacion exitosa", data: [results]});
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
}

//obtener tickets por id de la tabla logs
exports.getlogsbyid = async (req, res) => {
    try {
      const id = req.body.id;
      connection.execute(
        "select * from log_cases WHERE id_cases= (?) order by idlog_cases desc limit 1 ",
        [id],
        async (error, results, fields) => {
          if (error) {
            console.log(error);
            return res.status(404).send("Error de consulta de datos");
          } else {
            return res
              .status(200)
              .json({
                status: true,
                message: "Consulta exitosa",
                data: [results],
              });
          }
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: "Error Del Sistema", data: [req.body] });
    }
};


//obtener imagenes por id
exports.get_images = async (req, res) => {
  try {
    //console.log(req.body.id);
    const id = req.body.id;
    connection.execute("select * from url_imagenes WHERE id_case = (?)", [id],
      async (error, results, fields) => {
        if (error) {
          console.log(error);
          return res.status(401).json({ status: false, message: error, data: [req.body] });
        } else {
          return res.status(200).json({status: true, message: "Consulta exitosa", data: [results] });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Error Del Sistema", data: [req.body] });
  }
};

//obtener notas por id
exports.getNotes = async (req, res) => {
  try {
    //console.log(req.body.id);
    const id = req.body.id;
    connection.execute("select nota from notes_cases WHERE id_case = (?)", [id],
      async (error, results) => {
        if (error) {
          console.log(error);
          return res.status(401).json({ status: false, message: "Error al consultar Datos", data: [req.body] });
        } else {
          return res.status(200).json({status: true, message: "Consulta exitosa", data: [results] });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Error Del Sistema", data: [req.body] });
  }
};



//guardar notas 
exports.postNotes = async (req, res) => {
  try {
      const notas = req.body['notas'];
      let idcase = req.body['idcase'];
      let resultado;
      notas.forEach(element => {
        
        connection.query("INSERT INTO notes_cases ( id_case, nota) values (?,?) ",[ idcase , element],
        async (error, results) => {
          if(error){
            return res.status(401).json({ status: false, message: "Error Guardar Nota", data: [req.body] });
          }
          else{
            resultado = results
          }
        })
        return res.status(200).json({status: true, message: "Consulta exitosa", data: [resultado] });
        
      })
  } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: "Error Del Sistema", data: [req.body] });
  }
  
}



