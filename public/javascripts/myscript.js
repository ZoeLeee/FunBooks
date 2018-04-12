angular.module('FunBooks',['ngRoute'])
.component('bookItem',{
  template:`
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
.controller('BookDetailController',function() {
    this.book={
      title:"hha",
      author:"zoe",
      price:"123",
      publisher:"123",
      publishDate:Date.now().toString(),
      bookDescription:"hehe"
    }
  }
)
.controller('HomeController',function ($http) {

    this.showBooks=[];
    this.page=1;
    $http
      .get("http://localhost:3000/loadpage?category=Computer&page="+this.page)
      .then(response=> {
        let status=response.data.success;
        let data=response.data.data
        console.log('data: ', data);
        if(status){
          this.books=data;
          this.totalPage=Math.floor(this.books.length/8)+1;      
          this.showBooks.push(...this.books.slice((this.page-1)*8,8));
        }else console.log("数据请求失败");
      });

    this.togglePage=(isAdd)=>{
      isAdd?this.page++:this.page--;
      if(this.page>this.totalPage){
        this.page=this.totalPage
      }else if(this.page<1){
        this.page=1;
      }
      this.showBooks.length=0;
      this.showBooks.unshift(...this.books.slice((this.page-1)*8,(this.page-1)*8+8));
    }
  }
)
.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider){
  $locationProvider.hashPrefix('!');
    $routeProvider
    .when('/',{
        templateUrl:"../javascripts/home.html",
        controller: 'HomeController',
        controllerAs:'hmCtrl',
    })
    .when('/bookdetail',{
      templateUrl:"../javascripts/detail.html",
      controller: 'BookDetailController',
      controllerAs:'bdCtrl'
    })
    .when('/login',{
      templateUrl:"../javascripts/login.html",
      controller: '',
      controllerAs:''
    }).
    when('/cart',{
      templateUrl:"../javascripts/bookCart.html",
      controller: '',
      controllerAs:''
    })
    .otherwise({redirectTo:'/'});
}]);