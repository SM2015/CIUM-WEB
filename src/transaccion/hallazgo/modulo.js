(function(){
	'use strict';
	var seguimientoModule = angular.module('HallazgoModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	seguimientoModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		
		$routeProvider
		.when('/hallazgo', { templateUrl: 'src/transaccion/seguimiento/views/lista.html',	controller: 'HallazgoCtrl'})
		.when('/hallazgo/modificar', {templateUrl: 'src/transaccion/seguimiento/views/modificar.html',	controller: 'SeguimientoCtrl'})
		.when('/hallazgo/ver', {templateUrl: 'src/transaccion/seguimiento/views/ver.html',	controller: 'HallazgoCtrl'})	
	}]);
})();