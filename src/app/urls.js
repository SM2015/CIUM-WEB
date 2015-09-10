/**
 * Module App
 * 
 * @package    CIUM
 * @subpackage Controlador
 * @author     Hugo Gutierrez Corzo
 * @created    2015-07-20
 */
(function(){
	'use strict';
	// constantes para las urls utilizadas en la aplicación
	angular.module('App').constant('URLS', {
    	BASE: 'http://localhost/SSA_MATERIAL/APIRESTfull/public/',
    	BASE_API: 'http://localhost/SSA_MATERIAL/APIRESTfull/public/api/v1/',
		OAUTH_CLIENTE: 'http://sistemas.salud.chiapas.gob.mx/salud-id',
		OAUTH_SERVER: 'http://localhost/SSA_MATERIAL/oauth2-server/public/'

   	});	
})();