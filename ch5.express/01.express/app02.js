const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

app.set('port', process.env.PORT || 3000);

//자주 쓰는 미들웨어
//app.use로 장착
//morgan, cookie-parser, express-session 설치
//내부에서 알아서 next를 호출해서 당므 미들웨어로 넘어감
app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json);
app.use(express.urlencoded({ extended : false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave:false,
    saveUninitialized :false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    name: 'session-cookie'
}));

const multer  = require('multer');
const fs = require('fs');

try {
    fs.readdirSync('uploads');
}catch (error) {
    console.error('uploads 폴더가 없어 upload 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, 'uploads/');
        },
        filename(req, file, done){
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() +ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'multipart.html'));
});
app.post('/upload', upload.single('image'), (req, res) => {
    //upload.single : 1개만 이미지 올리기
    //upload.array : 묶음으로 올리기
    //upload.fields : 여러개 올리기
    //upload.none : 이미지 업로드 X
    console.log(req.file);
    res.send('ok');
});

app.get('/', (req, res, next) => {
    console.log('GET / 요청에서만 실행');
    next();
}, (req, res) =>{
    throw new Error('에러는 에러처리 미들웨어로')
});
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});