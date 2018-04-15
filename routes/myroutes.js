const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = require('url');
const ObjectID = require('mongodb').ObjectID;
const Promisify = require('util').promisify;
// 数据连接数据
const Urls = `mongodb://localhost:27017/assignment2`;


router.get('/loadpage', function (req, res, next) {
    let page = parseInt(req.query.page);
    findByPagination("bookCollection", { category: req.query.category }, page, 8, data => {
        res.end(JSON.stringify(data));
    })
});

router.get('/loadbook/:bookId', function (req, res, next) {
    let bookId = req.params.bookId.slice(1);
    handleDb("bookCollection", { _id: new ObjectID(bookId) }, find, data => {
        res.end(JSON.stringify(data));
    })

})

router.post('/signin', function (req, res, next) {
    let name = req.body.name;
    let password = req.body.pwd;
    handleDb("userCollection", { name, password }, find, data => {
        if (data.data.length) {
            data.msg = "登陆成功";
            handleDb("userCollection", [{ name, password }, { $set: { "status": "Online" } }], update, res => {
                console.log("res", res);
            })
            req.session.userId = data.data[0]._id;
            res.end(JSON.stringify(data));
        } else {
            data.msg = "登陆失败";
            res.end(JSON.stringify(data));
        }
    })
})

router.get('/signout', function (req, res, next) {
    handleDb("userCollection", [{ _id: new ObjectID(req.session.userId) }, { $set: { "status": "Offline" } }], update, data => {
        req.session.userId = null;
        res.end(JSON.stringify(data));
    })
})

router.put('/addtocart', function (req, res, next) {
    console.log(req.session.userId);
    if (req.session.userId) {
        let bookId = req.body.bookId;
        let quantity = req.body.quantity;
        req.session.userId = req.session.userId;
        handleDb("userCollection", [{ _id: new ObjectID(req.session.userId), cart: { $elemMatch: { bookID: new ObjectID(bookId) } } }, { $inc: { 'cart.$.quantity': quantity, totalnum: quantity } }], update, data => {
            console.log('data : ', data);
            if (data.length) {
                console.log("添加成功,更新数量");
                handleDb("userCollection", { _id: new ObjectID(req.session.userId) }, find, userdata => {
                    let user = userdata.data[0];
                    let totalnum = user.totalnum;
                    let bookIds = getBookIds(user.cart);
                    let totalPrice = 0;
                    handleDb("bookCollection", { _id: { $in: bookIds } }, find, result => {
                        console.log(result);
                        for (let obj of result.data) {
                            for (let c of user.cart) {
                                if (obj._id.equals(c.bookID)) {
                                    totalPrice += obj.price * c.quantity
                                }
                            }
                        }
                        console.log(`{"totalNum":${totalnum},"totalPrice":${totalPrice}}`);
                        res.end(`{"totalNum":${totalnum},"totalPrice":${totalPrice}}`);
                    })
                })
            } else {
                handleDb("userCollection", [{ _id: new ObjectID(req.session.userId) }, { $addToSet: { cart: { bookID: new ObjectID(bookId), quantity: quantity } }, $inc: { totalnum: quantity } }], update, result => {
                    console.log("添加成功,新增商品");
                    handleDb("userCollection", { _id: new ObjectID(req.session.userId) }, find, userdata => {
                        let user = userdata.data[0];
                        let totalnum = user.totalnum;
                        let bookIds = getBookIds(user.cart);
                        let totalPrice = 0;
                        handleDb("bookCollection", { _id: { $in: bookIds } }, find, result => {
                            console.log(result);
                            for (let obj of result.data) {
                                for (let c of user.cart) {
                                    if (obj._id.equals(c.bookID)) {
                                        totalPrice += obj.price * c.quantity
                                    }
                                }
                            }
                            res.end(`{"totalNum":${totalnum},"totalPrice":${totalPrice}}`);
                        })
                    })
                })
            }
        })
    }
})

router.put('/updatecart', function (req, res, next) {
    if (req.session.userId) {
        let bookId = req.body.bookId;
        let quantity = req.body.quantity;
        let totalNum = req.body.totalNum;
        console.log('quantity: ', quantity);
        req.session.userId = req.session.userId;
        handleDb("userCollection", [{ _id: new ObjectID(req.session.userId), cart: { $elemMatch: { bookID: new ObjectID(bookId) } } }, { $set: { 'cart.$.quantity': quantity, totalnum: totalNum } }], update, data => {
            res.end(`{"totalNum":${totalNum}}`);
        })
    }
})
router.delete('/deletefromcart/:bookId', function (req, res, next) {
    if (req.session.userId) {
        let bookId = req.params.bookId.slice(1);
        req.session.userId = req.session.userId;
        handleDb("userCollection", [{ _id: new ObjectID(req.session.userId) }, { $pull: { cart: { bookID: new ObjectID(bookId) } } }], update, data => {
            handleDb("userCollection", { _id: new ObjectID(req.session.userId) }, find, userdata => {
                let user = userdata.data[0];
                let totalnum = user.totalnum;
                res.end(`{"totalNum":${totalnum}}`);
            })
        })
    }
})
router.get('/loadcart', async function (req, res, next) {
    console.log(req.session.userId);
    if (req.session.userId) {
        req.session.userId = req.session.userId;
        let bookId = req.session.userId;
        console.log('bookId: ', bookId);
        handleDb("userCollection", { _id: new ObjectID(bookId) }, find, data => {
            let user = data.data[0];
            if (user) {
                let bookIds = getBookIds(user.cart);
                handleDb("bookCollection", { _id: { $in: bookIds } }, find, result => {
                    for (let obj of result.data) {
                        for (let c of user.cart) {
                            if (obj._id.equals(c.bookID)) {
                                obj.quantity = c.quantity;
                            }
                        }
                    }
                    res.end(JSON.stringify(result.data));
                })
            }
        })
    }
})
router.get('/checkout', async function (req, res, next) {
    if (req.session.userId) {
        req.session.userId = req.session.userId;
        handleDb("userCollection", [{ _id: new ObjectID(req.session.userId)}, { $set: { cart:[],totalnum:0 } }], update, data => {
            if(data.length)
                res.end(`{"msg":''`);
            else
                res.end(`{"msg":'失败'`);
        })
    }
})
function getBookIds(arrs) {
    let bookIds = [];
    for (let obj of arrs) {
        bookIds.push(obj.bookID);
    }
    return bookIds;
}
/************数据库操作函数*************/

//find
function find(db, collections, selector, fn) {
    let collection = db.collection(collections);
    collection.find(selector).toArray(function (err, result) {
        try {
            assert.equal(err, null);
            fn({
                success: true,
                data: result
            });
        } catch (e) {
            console.log(e);
            fn({
                success: false,
                data: []
            });
        }
        db.close();
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
