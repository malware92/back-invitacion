const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { promisify } = require("util");
const nodemailer = require("nodemailer");
//procedimiento para registrarnos
exports.register = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const user = req.body.user;
    const pass = req.body.pass;
    const cliente = req.body.cliente;
    let passHash = await bcryptjs.hash(pass, 8);
    if (
      name == "" ||
      email == "" ||
      user == "" ||
      pass == "" ||
      !email.includes("@") ||
      cliente == ""
    ) {
      return res.status(401).json({
        status: false,
        message: "Campos sin informacion",
        data: [req.body],
      });
    } else {
      connection.query(
        "INSERT INTO users (full_name,email,idclients,pass,user,idrol) values (?,?,?,?,?,?) ",
        [name, email, cliente, passHash, user, 1],
        async (error, result) => {
          if (error) {
            console.log(error);
            res.status(401).json({
              status: false,
              message: "El Usuario ya fue creado",
              data: [req.body],
            });
          } else {
            const id = result.insertId;
            const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
              expiresIn: process.env.JWT_TIEMPO_EXPIRA,
            });
            return res
              .status(200)
              .json({ status: true, message: "OK", data: [result, token] });
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "Error Del Sistema", data: [req.body] });
  }
};

//login
exports.login = async (req, res) => {
  try {
    const user = req.body.user;
    const pass = req.body.pass;
    if (!user || !pass) {
      return res.status(401).json({
        status: false,
        message: "Campos sin informacion",
        data: [req.body],
      });
    } else {
      connection.query(
        "SELECT * FROM users WHERE user = (?)",
        [user],
        async (error, results) => {
          if (error) {
            console.log(error);
          }
          if (
            results.length == 0 ||
            !(await bcryptjs.compare(pass, results[0].pass))
          ) {
            return res.status(401).json({
              status: false,
              message: "Usuario y contraseña no coinciden",
              data: [req.body],
            });
          } else {
            //inicio de sesión OK
            const id = results[0].idusers;
            //console.log(results);
            const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
              expiresIn: process.env.JWT_TIEMPO_EXPIRA,
            });
            let { user, idrol, idclients } = results[0];
            const info = { user: user, idrol: idrol, idclients: idclients };
            return res
              .status(200)
              .json({ status: true, message: "OK", data: [info, token] });
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: error.message, data: [req.body] });
  }
};

// procedimiento  para autenticar token
exports.isAuthenticated = async (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  if (!token) {
    return res.status(401).send("Es necesario un token de autenticacion");
  }
  if (token) {
    try {
      token = token.slice(7, token.length);
      const decodificada = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRETO
      );
      const results = connection.query(
        "SELECT * FROM users WHERE idusers = ?",
        [decodificada.id]
      );

      if (!results) {
        return res.status(401).json({
          status: false,
          message: "Usuario no encontrado",
          data: [req.body],
        });
      } else {
        return next();
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: false, message: error.message, data: [req.body] });
    }
  }
};

/**Enviar segundo correo */
exports.sendSecondEmail = async (req, res, next) => {
  try {
    const id = req.params.id;

    let [renovacion] = await connection
      .promise()
      .query("select renovacion from clientes where idclientes = ?", [id]);

    if (renovacion[0].renovacion == "1") {
      return res.status(400).json({
        status: false,
        message: "El email ya se encuentra renovado",
        data: [],
      });
    } else {
      sendsecondEmail(id);
      let [result] = await connection
        .promise()
        .query("UPDATE clientes SET renovacion = 1 where idclientes = ?", [id]);
      return res
        .status(200)
        .json({ status: true, message: "Envio de segundo correo", data: [id] });
    }
  } catch (error) {
    return res
      .status(200)
      .json({ status: false, message: "error", data: [error.message] });
  }
};
exports.getname = async (req, res, next) => {
  try {
    const id = req.body.idclientes;
    let [result] = await connection
      .promise()
      .query("select Nombre from clientes where idclientes = ?", [id]);
    if (result.length > 0) {
      return res
        .status(200)
        .json({ status: true, message: "envio exitoso", data: result, id: id });
    }

    return res.status(400).json({
      status: false,
      message: "Error al consultar Información del Usuario",
      data: [],
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "error", data: [error.message] });
  }
};

sendEmail = async (email, body) => {
  /**configurar gmail */
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email ? process.env.email : "", //Colocar Email Aqui
      pass: process.env.pass ? process.env.pass : "", // Contraaseña de correo
    },
  });

  let list = `<html> <body> <h3> La persona ${
    body.nombre
  } confirma su asistencia, y ${
    body.transporte == 1 ? "si" : "no"
  } tiene transporte para asistir al evento`;

  if (body.acompanante.length > 0) {
    list += ` Ademas ira acompañado de las siguientes personas:</h3> <ul>`;
    body.acompanante.forEach((element) => {
      list += `<li>${element.persona}</li>`;
    });
    list += `<ul>`;
  }

  list += "</body> </html>";

  let mailOptions = {
    from: "kevinazul9999@gmail.com",
    to: email,
    subject: "Registro acompañante",
    html: list,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Correo electrónico enviado: " + info.response);
        resolve(info.response);
      }
    });
  });
};

exports.sendFirstEmail = async (req, res, next) => {
  try {
    let body = req.body;
    console.log(body);
    let response = await sendEmail("kevinazul999@gmail.com", body);
    console.log("response", response);
    return res
      .status(200)
      .json({
        status: true,
        message: "Email enviado con éxito",
        data: response,
      });
  } catch (error) {
    return res
      .status(200)
      .json({ status: false, message: "error", data: [error.message] });
  }
};
