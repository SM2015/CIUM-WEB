(function(){
	'use strict';
	angular.module('PendienteModule')
	.factory('Pendientes', ['$http', '$rootScope', 'errorFlash', 'URLS', function ($http, $rootScope, errorFlash, URLS) {	
	{ 
		var pendientes = {};

		pendientes.preparar = function() 
		{ 
			var t = this;	
			var pagina=1;
			var limite=5;
			var url = 'Pendiente';
	
			$http.get(URLS.BASE_API+url+'?pagina=' + pagina + '&limite=' + limite + '&visto=1')			
			.success(function(data, status, headers, config) 
			{	
				t.pendientes = data;	
				$rootScope.$broadcast('pendientesInicio');				
			})
			.error(function(data, status, headers, config) 
			{
				
			});		  
		}
		
		return pendientes;
	}
	}])
	
})();