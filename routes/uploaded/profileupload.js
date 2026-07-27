const multer = require('multer');
const fs = require('fs');
const path = require('path');
const{v4:uuid} = require('uuid');

const uploadDirectory =  path.join(__dirname,'../../uploads/post');
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}
const storage = multer.diskStorage({
    destination(req,file,cb){
        cb(null,uploadDirectory)
    },
    filename(req,file,cb){
        const ext = path.extname(file.originalname);
        cb(null,`${path.basename(file.originalname,ext)}-${uuid()}${ext}`);
    }
})

const fileFilter = (req,file,cb) =>{
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(
            new Error('JPG, PNG, WEBP 이미지만 업로드할 수 있습니다.')
        );
    }
    cb(null,true);
}


const upload = multer({
    storage,
    fileFilter,
    limits:{
        fileSize:5*1024*1024,
        files:4
    }
})

module.exports = upload;