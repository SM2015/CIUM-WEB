/**
 * @ngdoc interface
 * @name App.interface:URLS
 * @description
 * constantes para las urls utilizadas en la aplicación.
 */  
(function(){
	'use strict';
	angular.module('App').constant('URLS', {
    	BASE: 'http://localhost/SSA_MATERIAL/APIRESTfull/public/',
    	BASE_API: 'http://localhost/SSA_MATERIAL/APIRESTfull/public/api/v1/',
		OAUTH_CLIENTE: 'http://sistemas.salud.chiapas.gob.mx/salud-id',
		OAUTH_SERVER: 'http://localhost/SSA_MATERIAL/oauth2-server/public/'

   	});	
})();