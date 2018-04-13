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
      <a href="#!/login">sign in</a>
    </li>
    <li class="cart">
      <a href="#!/cart">xx in Cart</a>
    </li>
  </ul>`
  })
  .controller('BookDetailController', function () {
    this.book = {
      title: "hha",
      author: "zoe",
      price: "123",
      publisher: "123",
      publishDate: Date.now().toString(),
      bookDescription: "hehe"
    }
  }
  )
  .controller('HomeController', function ($http, $scope) {
    document.querySelectorAll('#pageLeft ul>li')[0].className = 'active';
    this.showBooks = [];
    this.page = 1;
    this.range = [];
    this.category = "Computer";
    this.loadPage = (category, page) => {
      this.page = page;
      console.log(page);
      document.querySelectorAll('#pageLeft ul>li')[0].className = '';
      this.category = category;
      $http
        .get(`http://localhost:3000/loadpage?category=${category}&page=${page}`)
        .then(response => {
          let status = response.data.success;
          this.book = response.data.data
          if (status) {
            this.totalPage = Math.ceil(this.book.length / 8);
            this.showBooks.length = 0;
            this.showBooks.unshift(...this.book.slice((this.page - 1) * 8, (this.page - 1) * 8 + 8));
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
      }
      this.showBooks.length = 0;
      this.showBooks.unshift(...this.book.slice((this.page - 1) * 8, (this.page - 1) * 8 + 8));
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
      .when('/bookdetail', {
        templateUrl: "../javascripts/detail.html",
        controller: 'BookDetailController',
        controllerAs: 'bdCtrl'
      })
      .when('/login', {
        templateUrl: "../javascripts/login.html",
        controller: '',
        controllerAs: ''
      }).
      when('/cart', {
        templateUrl: "../javascripts/bookCart.html",
        controller: '',
        controllerAs: ''
      })
      .otherwise({ redirectTo: '/' });
  }]);