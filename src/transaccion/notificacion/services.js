(function(){
	'use strict';
	angular.module('NotificacionModule')
	.factory('Notificaciones', ['$http', '$rootScope', 'errorFlash', 'URLS', function ($http, $rootScope, errorFlash, URLS) {	
	{ 
		var notificacion = {};
	
		notificacion.preparar = function() 
		{ 
			var t = this;	
			var pagina=1;
			var limite=5;
			var url = 'Notificacion';
	
			$http.get(URLS.BASE_API+url+'?pagina=' + pagina + '&limite=' + limite+ '&visto=1')			
			.success(function(data, status, headers, config) 
			{	
				t.notificacion = data;	
				$rootScope.$broadcast('notificacionInicio');				
			})
			.error(function(data, status, headers, config) 
			{
				
			});		 
		}
		
		return notificacion;
	}
	}])
	.filter('randomize', function() {
	  return function(input, scope) {
	    if (input!=null && input!=undefined && input > 1) {
	      return Math.floor((Math.random()*input)+1);
	    }  
	  }
	});
	
})();