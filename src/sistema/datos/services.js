(function(){
	'use strict';
	angular.module('DatoModule')
	.factory('infoUsuario', ['$http', '$rootScope', 'errorFlash', 'URLS', function ($http, $rootScope, errorFlash, URLS) {	
	{ 
		var usuario = {};

		usuario.preparar = function() 
		{ 
			/*var t = this;			
			$http.get(URLS.OAUTH_SERVER+'/v1/perfil')
			.success(function(data, status, headers, config) 
			{	
				t.usuario = data.data;	
				$rootScope.$broadcast('usuarioInicio');				
			})
			.error(function(data, status, headers, config) 
			{
				
			});		*/  
		}
		
		return usuario;
	}
	}])
	
})();