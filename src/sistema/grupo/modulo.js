(function(){
	'use strict';
	var grupoModule = angular.module('GrupoModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	grupoModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		
		$routeProvider
		.when('/grupo', { templateUrl: 'src/sistema/grupo/views/lista.html',	controller: 'GrupoCtrl'})
		.when('/grupo/nuevo', {templateUrl: 'src/sistema/grupo/views/nuevo.html',	controller: 'GrupoCtrl'})
		.when('/grupo/modificar', {templateUrl: 'src/sistema/grupo/views/modificar.html',	controller: 'GrupoCtrl'})
		.when('/grupo/ver', {templateUrl: 'src/sistema/grupo/views/ver.html',	controller: 'GrupoCtrl'})
	}]);
})();