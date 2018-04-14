const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = require('url');
const ObjectID=require('mongodb').ObjectID;
// 数据连接数据
const Urls = `mongodb://localhost:27017/assignment2`;


router.get('/loadpage', function (req, res, next) {
    let page = parseInt(req.query.page);
    findByPagination("bookCollection", { category: req.query.category }, page, 8, data => {
        res.end(JSON.stringify(data));
    })
});

router.get('/loadbook/:bookId',function(req,res,next){
    let bookId=req.params.bookId.slice(1);
    handleDb("bookCollection", {_id:new ObjectID(bookId)}, find, data=>{
        res.end(JSON.stringify(data));
    })

})

router.post('/signin',function(req,res,next){
    let name=req.body.name;
    let password=req.body.pwd;
    handleDb("userCollection", {name,password}, find, data=>{
        if(data.data.length){
            data.msg="登陆成功";
            handleDb("userCollection", [{name,password},{$set:{"status":"Online"}}], update, res=>{
                console.log(res);
            })
            req.session.userId=data.data[0]._id;
            res.end(JSON.stringify(data));
        }else{
            data.msg="登陆失败";
            res.end(JSON.stringify(data));
        }
    })

})

router.get('/signout',function(req,res,next){
    if(req.session.userId){
        handleDb("userCollection", [{_id:new ObjectID(req.session.userId)},{$set:{"status":"Offline"}}], update, data=>{
            console.log(data);
            res.end(JSON.stringify(data));
        })
    }
    req.session.userId="";
})
/************数据库操作函数*************/
//add一条数据 
function add(db, collections, selector, fn) {
    let collection = db.collection(collections);
    collection.insertMany([selector], function (err, result) {
        try {
            assert.equal(err, null)
        } catch (e) {
            console.log(e);
            result = [];
        };

        fn(result);
        db.close();
    });
};

//delete
function deletes(db, collections, selector, fn) {
    let collection = db.collection(collections);
    collection.deleteOne(selector, function (err, result) {
        try {
            assert.equal(err, null);
            assert.notStrictEqual(0, result.result.n);
        } catch (e) {
            console.log(e);
            result.result = "";
        };

        fn(result.result ? [result.result] : []); //如果没报错且返回数据不是0，那么表示操作成功。
        db.close;
    });
};

//find
function find(db, collections, selector, fn) {
    let collection = db.collection(collections);
    collection.find(selector).toArray(function (err, result) {
        try {
            assert.equal(err, null);
            fn({
                success:true,
                data:result
            });
        } catch (e) {
            console.log(e);
            fn({
                success:false,
                data:[]
            });
        }
    });

}
//update
function update(db, collections, selector, fn) {
    let collection = db.collection(collections);
    collection.updateOne(selector[0], selector[1], function (err, result) {
        try {
            assert.equal(err, null);
            assert.notStrictEqual(0, +result.result.n);
        } catch (e) {
            console.log(e);
            result.result = "";
        };

        fn(result.result ? [result.result] : []); //如果没报错且返回数据不是0，那么表示操作成功。
        db.close();
    });

}



function handleDb(collections, selector, handleFun, fn) {
    MongoClient.connect(Urls, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        // 根据 请求的地址来确定是什么操作  （为了安全，避免前端直接通过请求url操作数据库）
        handleFun(db, collections, selector, fn);
        db.close();
    });
};

//分页查询
function findByPagination(collections, selector, page, count, fn) {
    let skipnumber = (page - 1) * count;
    let totalCount;
    MongoClient.connect(Urls, function (err, db) {
        let collection = db.collection(collections);
        assert.equal(null, err);
        console.log("Connected correctly to server");

        collection.find(selector).count((err, res) => {
            assert.equal(err, null);
            totalCount = res;
        });
        // 根据 请求的地址来确定是什么操作  （为了安全，避免前端直接通过请求url操作数据库）
        collection.find(selector).skip(skipnumber).limit(count).toArray(function (err, result) {
            try {
                assert.equal(err, null);
                fn({
                    success: true,
                    data: result,
                    totalCount: totalCount
                });
            } catch (e) {
                console.log(e);
                fn({
                    success: false,
                    data: [],
                    totalCount: totalCount
                });
            }
            
        });
        db.close();
    });
}

module.exports = router;
