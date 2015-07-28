(function(){
	'use strict';
	var moduloModule = angular.module('ModuloModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	moduloModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		
		$routeProvider
		.when('/modulo', { templateUrl: 'src/sistema/modulo/views/lista.html',	controller: 'ModuloCtrl'})
		.when('/modulo/nuevo', {templateUrl: 'src/sistema/modulo/views/nuevo.html',	controller: 'ModuloCtrl'})
		.when('/modulo/modificar', {templateUrl: 'src/sistema/modulo/views/modificar.html',	controller: 'ModuloCtrl'})
		.when('/modulo/ver', {templateUrl: 'src/sistema/modulo/views/ver.html',	controller: 'ModuloCtrl'})
		
		.when('/permiso', { templateUrl: 'src/sistema/moduloAccion/views/lista.html',	controller: 'ModuloCtrl'})
		.when('/permiso/nuevo', {templateUrl: 'src/sistema/moduloAccion/views/nuevo.html',	controller: 'ModuloCtrl'})
		.when('/permiso/modificar', {templateUrl: 'src/sistema/moduloAccion/views/modificar.html',	controller: 'ModuloCtrl'})
		.when('/permiso/ver', {templateUrl: 'src/sistema/moduloAccion/views/ver.html',	controller: 'ModuloCtrl'})
	}]);
})();