(function(){
	'use strict';
	var usuarioModule = angular.module('UsuarioModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	usuarioModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		
		$routeProvider
		.when('/usuario', { templateUrl: 'src/sistema/usuario/views/lista.html',	controller: 'UsuarioCtrl'})
		.when('/usuario/nuevo', {templateUrl: 'src/sistema/usuario/views/nuevo.html',	controller: 'UsuarioCtrl'})
		.when('/usuario/modificar', {templateUrl: 'src/sistema/usuario/views/modificar.html',	controller: 'UsuarioCtrl'})
		.when('/usuario/ver', {templateUrl: 'src/sistema/usuario/views/ver.html',	controller: 'UsuarioCtrl'})
	}]);
})();