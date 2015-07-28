(function(){
	'use strict';
	var pendienteModule = angular.module('PendienteModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	pendienteModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		
		$routeProvider
		.when('/pendiente', {templateUrl: 'src/transaccion/pendiente/views/lista.html',controller: 'PendienteCtrl'})	
	}]);
})();