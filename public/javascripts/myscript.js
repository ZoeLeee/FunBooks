angular.module('FunBooks',['ngRoute'])
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
.controller('HomeController',function () {
    this.books=[];
    this.showBooks=[];
    this.page=1;
    for(let i=0;i<99;i++){
      this.books.push({
        title: 'clean Code '+i,
         authors: 'Fast',
         price:'$99'
       })
    }
    this.totalPage=Math.floor(this.books.length/8)+1;      
    this.showBooks.push(...this.books.slice((this.page-1)*8,8));

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
.config(['$routeProvider', function($routeProvider){
    $routeProvider
    .when('/',{
        templateUrl:"../javascripts/components/index/home.html",
        controller: 'HomeController',
        controllerAs:'hm',
    })
    .when('/book',{templateUrl:"../javascripts/components/details/detail.html",controller: 'BookDetailController'})
    .otherwise({redirectTo:'/'});
}]);