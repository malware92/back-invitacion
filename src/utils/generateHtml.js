
function generateEmailHtml(id) {
  return `
      <html>
        <body>
          <h1>
          Si deseas Renovar La suscripcion porfavor accede al siguiente link, de lo contrario haz caso omiso a este correo</h1>
          <a href= "https://master.d1i6gn7cdq9lma.amplifyapp.com/home?id=${id}" >Porfavor Acepta nuestros terminos y condiciones aqui</a>
        </body>
      </html>
    `;
}

module.exports = generateEmailHtml;