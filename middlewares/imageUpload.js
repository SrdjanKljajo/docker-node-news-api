const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const uploadImg = upload.single('picture')

module.exports = uploadImg
