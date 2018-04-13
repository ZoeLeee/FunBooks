const express = require('express');
const router = express.Router();
const MongoClient=require('mongodb').MongoClient;
const assert=require('assert');
const url=require('url');
// 数据连接数据
const Urls=`mongodb://localhost:27017/assignment2`;


router.get('/loadpage', function(req, res, next) {
  let page=req.query.page;
  handleDb(req,res,"bookCollection",{category:req.query.category},findData,data=>{
    console.log(data);
    res.end(`{"success":true,"data":${JSON.stringify(data)}}`);
  })
});

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
function findData(db, collections, selector, fn) {
    let collection = db.collection(collections);
    collection.find(selector).toArray(function (err, result) {
        try {
            assert.equal(err, null);
        } catch (e) {
            console.log(e);
            result = [];
        }
        db.close();
        fn(result);
    });

}
//update
function updates (db, collections, selector, fn) {
  let collection = db.collection(collections);

  collection.updateOne(selector[0], selector[1], function (err, result) {
      try {
          assert.equal(err, null);
          assert.notStrictEqual(0, result.result.n);
      } catch (e) {
          console.log(e);
          result.result = "";
      };

      fn(result.result ? [result.result] : []); //如果没报错且返回数据不是0，那么表示操作成功。
      db.close();
  });

}

function handleDb(req, res, collections, selector, handleFun,fn) {
  MongoClient.connect(Urls, function (err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to server");
      // 根据 请求的地址来确定是什么操作  （为了安全，避免前端直接通过请求url操作数据库）
      handleFun(db, collections, selector, fn);
      db.close();
  });
};

module.exports = router;
