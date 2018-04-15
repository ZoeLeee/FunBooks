angular.module('FunBooks', ['ngRoute'])
  .component('sign', {
    template: `
      <ul class="li-inline flex-space-between">
      <li  class="sign">
        <a href="#!/login" ng-hide={{$ctrl.isLogin}}>sign in</a>
        <div  ng-show={{$ctrl.isLogin}}>
          <span>{{$ctrl.uname}}</span>
          <a href="#!/signout" class='underline' >(sign out)</a> 
        </div> 
      </li>
      <li >
        <a 
          href="#!/cart"
          >
          <img src='../images/cart.jpg'>
          <span class="cart">{{$ctrl.totalNum}} in Cart</span>
        </a>
      </li>
    </ul>`,
    controller($http) {
      this.uname = sessionStorage.getItem('uname');
      this.isLogin = new Boolean(this.uname);
      this.totalNum = sessionStorage.getItem('totalNum');
      // if(!totalNum) this.totalNum=0;
      this.signout = () => {
        this.uname = "";
        this.isLogin = false;
      }
    }
  })
  .controller('BookDetailController', function ($routeParams, $http, $location) {
    this.quantity = 1;
    let bookId = $routeParams.bookId;
    this.currentPage = $routeParams.page;
    $http
      .get(`http://localhost:3000/loadbook/` + bookId)
      .then(res => {
        if (res.data.success) {
          this.book = res.data.data[0]
        } else console.log("链接失败");
      })

    this.goback = () => {
      history.go(-1);
    }
    this.totalNum = 0;
    this.totalPrice = 0;
    this.isAdd = false;
    this.addToCart = (bookId) => {
      if (sessionStorage.uname) {
        $http
          .put(`http://localhost:3000/addtocart`, { bookId, quantity: this.quantity })
          .then(res => {
            if (res.status === 200) {
              this.totalNum = res.data.totalNum;
              this.totalPrice = res.data.totalPrice;
              this.isAdd = true;
              sessionStorage.totalNum = this.totalNum;
            } else console.log("链接失败");
          })
      } else $location.path("/login")

    }
    this.contineBrowse = () => {
      this.isAdd = false;
    }
  })
  .controller('LoginController', function ($http) {
    this.uname = "";
    this.pwd = "";
    this.isFail = false;
    this.signto = () => {
      if (this.uname && this.pwd) {
        $http
          .post(`http://localhost:3000/signin`, { name: this.uname, pwd: this.pwd })
          .then(res => {
            if (res.data.success) {
              let data = res.data.data;
              if (data.length) {
                sessionStorage.uname = data[0].name;
                sessionStorage.totalNum = data[0].totalnum;
                history.go(-1);
                this.isFail = false;
              } else {
                this.isFail = true;
              }
            } else console.log("链接失败");
          })
      } else alert("请输入用户名和密码")
    }
  })
  .controller('SignoutController', function ($http) {
    this.goback = () => {
      history.go(-1);
    }
    this.signout = () => {
      $http.get(`http://localhost:3000/signout`)
        .then(res => {
          if (res.status === 200) {
            sessionStorage.removeItem('uname');
            sessionStorage.totalNum = 0;
            history.go(-1);
          }
        })
    }
    this.totalNum = sessionStorage.totalNum;
  })
  .controller('HomeController', function ($http) {
    document.querySelectorAll('#pageLeft ul>li')[0].className = 'active';
    this.showBooks = [];
    this.page = 1;
    this.range = [];
    this.category = "Computer";

    this.loadPage = (category, page) => {
      this.page = page;
      document.querySelectorAll('#pageLeft ul>li')[0].className = '';
      this.category = category;
      $http
        .get(`http://localhost:3000/loadpage?category=${category}&page=${page}`)
        .then(response => {
          let status = response.data.success;
          this.showBooks = response.data.data;
          let totalCount = response.data.totalCount;
          if (status) {
            this.totalPage = Math.ceil(totalCount / 8);
            this.setPageRange();
          } else console.log("数据请求失败");
        });
    }

    this.setPageRange = () => {
      this.range = [];
      for (let i = 0; i < this.totalPage; i++) {
        this.range.push(i + 1);
      }
    }
    //加载页面
    this.loadPage(this.category, 1);
    this.togglePage = (isAdd) => {
      document.querySelectorAll('#pageLeft ul>li')[0].className = 'active';
      isAdd ? this.page++ : this.page--;
      if (this.page > this.totalPage) {
        this.page = this.totalPage
      } else if (this.page < 1) {
        this.page = 1;
      } else {
        this.loadPage(this.category, this.page);
      }
    }
  })
  .controller('CartController', function ($http, $location) {
    this.cart = [];
    this.totalNum = 0;
    this.totalPrice = 0;
    this.loadcart = () => {
      $http.get(`http://localhost:3000/loadcart`).then(res => {
        this.cart = res.data;
        for (let book of this.cart) {
          this.totalNum += parseInt(book.quantity);
          this.totalPrice += book.price * book.quantity;
        }
        sessionStorage.totalNum = this.totalNum;
      })
    }
    if (sessionStorage.getItem('uname')) {
      this.loadcart();
    } else $location.path("/login")


    this.updateCart = (bookId, quantity) => {
      let oldNum = this.totalNum;
      this.totalNum = 0;
      this.totalPrice = 0;
      if (quantity > 0) {
        $http
          .put(`http://localhost:3000/updatecart`, { bookId, quantity, totalNum: this.totalNum })
          .then(res => {
            if (res.status === 200) {
              this.totalNum = res.data.totalNum;
            } else console.log("链接失败");
          })
      } else {
        $http
          .delete(`http://localhost:3000/deletefromcart/:` + bookId)
          .then(res => {
            if (res.status === 200) {
              this.totalNum = res.data.totalNum;
            } else console.log("链接失败");
          })
      }
      this.loadcart();
      for (let book of this.cart) {
        this.totalNum += parseInt(book.quantity);
        this.totalPrice += book.price * book.quantity;
      }
    }
    this.toPay = () => {
      console.log('this.totalNum: ', this.totalNum);
      if (this.totalNum) {
        $http.get(`http://localhost:3000/checkout`).then(res => {
            if(res.status===200){
              this.loadcart();
              sessionStorage.totalNum=0;
              $location.path('/pay/:' + this.totalPrice)
            }
        })
      }
    }
  })
  .controller('PayController', function ($http, $routeParams) {
    this.totalPrice = $routeParams.totalPrice;
    this.totalNum = sessionStorage.totalNum;
    sessionStorage.totalNum = 0;
  })
  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider
      .when('/', {
        templateUrl: "../javascripts/home.html",
        controller: 'HomeController',
        controllerAs: 'hmCtrl',
      })
      .when('/bookdetail/:bookId/:page', {
        templateUrl: "../javascripts/detail.html",
        controller: 'BookDetailController',
        controllerAs: 'bdCtrl'
      })
      .when('/login', {
        templateUrl: "../javascripts/login.html",
        controller: 'LoginController',
        controllerAs: 'lgCtrl'
      }).
      when('/signout', {
        template: `
        <div>
          <h2>You still have {{outCtrl.totalNum}} item(s) in your cart</h2>
          <button ng-click=outCtrl.goback()>cancel sign-out</button>
          <button ng-click=outCtrl.signout()>Confirm sign-out</button>
        </div>
        `,
        controller: 'SignoutController',
        controllerAs: 'outCtrl'
      }).
      when('/cart', {
        templateUrl: "../javascripts/bookCart.html",
        controller: 'CartController',
        controllerAs: 'cartCtrl'
      }).
      when('/pay/:totalPrice', {
        template: `
          <h2>You have successfully placed order</h2>
          <h3>for {{payCtrl.totalNum}}item(s)</h3>
          <br/>
          <h3>$ {{payCtrl.totalPrice}}paid</h3>
          <div>
            <a class="cart" href="#!/">continue browsing</a>
          </div> 
        `,
        controller: 'PayController',
        controllerAs: 'payCtrl'
      })
      .otherwise({ redirectTo: '/' });
  }]);