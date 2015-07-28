(function(){
	'use strict';
	var abastoModule = angular.module('AbastoModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	abastoModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		
		$routeProvider
		.when('/evaluacion-abasto', { templateUrl: 'src/transaccion/evaluacion/views/lista.html',	controller: 'AbastoCtrl'})
		.when('/evaluacion-abasto/Criterios', {templateUrl: 'src/transaccion/evaluacion/views/Criterios.html',	controller: 'AbastoCtrl'})
		.when('/evaluacion-abasto/nuevo', {templateUrl: 'src/transaccion/evaluacion/views/nuevo.html',	controller: 'AbastoCtrl'})
		.when('/evaluacion-abasto/modificar', {templateUrl: 'src/transaccion/evaluacion/views/modificar.html',	controller: 'AbastoCtrl'})
		.when('/evaluacion-abasto/ver', {templateUrl: 'src/transaccion/evaluacion/views/ver.html',	controller: 'AbastoCtrl'})
	}]);
})();