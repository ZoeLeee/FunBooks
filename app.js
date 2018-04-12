var express = require('express');
var http=require('http');
var session=require('express-session');


var path = require('path');
var logger = require('morgan');

var indexRouter = require('./routes/myroutes');

var app = express();
app.all('*',(req,res,next)=>{
  // res.header("Access-Control-Allow-Origin","http://localhost:3000");
  res.header('Access-Control-Allow-Methods','PUT,GET,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers','Content-Type');
  res.header('Access-Control-Allow-Credentials',true);
  next();
})

//session
app.use(session({
  secret:'funbook',
  name:'funbook',
  cookie:{maxAge:60*1000*60*24},
  resave:false,
  saveUninitialized:true
}))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//输出服务器记录
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000,()=>{
  console.log('listening on port 3000!');
})

