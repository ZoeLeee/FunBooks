angular.
  module('Funbooks').
  config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');

      $routeProvider.
        when('/', {
          template: '<home></home>'
        }).
        when('/bookdetail', {
          template: '<book-detail></book-detail>'
        }).
        otherwise('/');
    }
  ]);