(function(){
	'use strict';
	var seguimientoModule = angular.module('SeguimientoModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	seguimientoModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		
		$routeProvider
		.when('/seguimiento', { templateUrl: 'src/transaccion/seguimiento/views/lista.html',	controller: 'CrudCtrl'})
		.when('/seguimiento/modificar', {templateUrl: 'src/transaccion/seguimiento/views/modificar.html',	controller: 'SeguimientoCtrl'})
		.when('/seguimiento/ver', {templateUrl: 'src/transaccion/seguimiento/views/ver.html',	controller: 'CrudCtrl'})	
	}]);
})();