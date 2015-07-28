(function(){
	'use strict';
	var indicadorModule = angular.module('IndicadorModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	indicadorModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		
		$routeProvider
		.when('/indicador', { templateUrl: 'src/catalogos/indicador/views/lista.html',	controller: 'IndicadorCtrl'})
		.when('/indicador/nuevo', {templateUrl: 'src/catalogos/indicador/views/nuevo.html',	controller: 'IndicadorCtrl'})
		.when('/indicador/modificar', {templateUrl: 'src/catalogos/indicador/views/modificar.html',	controller: 'IndicadorCtrl'})
		.when('/indicador/ver', {templateUrl: 'src/catalogos/indicador/views/ver.html',	controller: 'IndicadorCtrl'})
	}]);
})();