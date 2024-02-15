
exports.verifyFile = async (req,res,next) =>{
    //console.log(req.files);
    //|| Object.keys(req.files).length == 0
    if(!req.files){
        res.status(400).json( { status: false, message: "No hay archivos para cargar"});
    }else{
        await next();
    }
    
}