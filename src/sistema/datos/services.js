(function(){
	'use strict';
	angular.module('DatoModule')
	.factory('infoUsuario', ['$http', '$rootScope', '$localStorage', 'errorFlash', 'URLS', function ($http, $rootScope, $localStorage, errorFlash, URLS) {	
	{ 		
		return $localStorage.cium.perfil.data;
	}
	}])
	
})();