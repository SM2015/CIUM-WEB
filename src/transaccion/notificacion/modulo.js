(function(){
	'use strict';
	var notificacionModule = angular.module('NotificacionModule', ['ngMaterial','ngRoute','ngStorage','ngCookies','ngMessages','pascalprecht.translate','http-auth-interceptor']);
	notificacionModule.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		
		$routeProvider
		.when('/notificacion', {templateUrl: 'src/transaccion/notificacion/views/lista.html',controller: 'NotificacionCtrl'})
	}]);
})();