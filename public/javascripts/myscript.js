angular.module('FunBooks', ['ngRoute'])
  .component('bookItem', {
    template: `
    <ul class='bookItem'>
      <li>
        <img src="../images/cleancode.png">
      </li>
      <li>
        <p>title</p>
        <p>author</p>
      </li>
      <li>
        <p>$xx</p>
      </li>
      <li>
        <input type='number'>
      </li>
    </ul> 
  `
  })
  .component('sign', {
    template: `
      <ul class="li-inline flex-space-between">
      <li  class="sign">
        <a href="#!/login" ng-hide={{$ctrl.isLogin}}>sign in</a>
        <div  ng-show={{$ctrl.isLogin}}>
          <span>{{$ctrl.uname}}</span>
          <a href="" class='underline' ng-click=$ctrl.signout()>(sign out)</a> 
        </div> 
      </li>
      <li class="cart">
        <a href="#!/cart">{{$ctrl.totalNum}} in Cart</a>
      </li>
    </ul>`,
    controller($http) {
      this.uname = sessionStorage.getItem('uname');
      this.isLogin = new Boolean(this.uname);
      this.totalNum = sessionStorage.getItem('totalNum');
      this.signout = () => {
        $http.get(`http://localhost:3000/signout`)
          .then(res => {
            console.log(res);
          })
        sessionStorage.clear();
        this.uname = "";
        this.isLogin = false;
      }
    }
  })
  .controller('BookDetailController', function ($routeParams, $http) {
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
                console.log(res.data);
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
  .controller('HomeController', function ($http, $scope) {
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
  }
  )
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
      when('/cart', {
        templateUrl: "../javascripts/bookCart.html",
        controller: '',
        controllerAs: ''
      })
      .otherwise({ redirectTo: '/' });
  }]);