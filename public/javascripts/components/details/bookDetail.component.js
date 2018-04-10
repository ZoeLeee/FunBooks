angular.
  module('FunBooks').
  component('bookDetail', {
    templateUrl:'../../../javascripts/components/details/detail.html',
    controller() {
      this.book={
        title:"hha",
        author:"zoe",
        price:"123",
        publisher:"123",
        publishDate:Date.now().toString(),
        bookDescription:"hehe"
      }
    }
  });
