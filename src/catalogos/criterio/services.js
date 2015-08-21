/**
 * Service listaOpcion
 * 
 * @package    CIUM 
 * @subpackage Service
 * @author     Eliecer Ramirez Esquinca
 * @created    2015-07-20
 */
(function(){
	'use strict';
	/**
	 * Obtener los datos de la url solicitada, se utiliza para llenar los campos de tipo catalogo.
	 */
	angular.module('CriterioModule')
	.factory('listaOpcion', ['$http', 'URLS','errorFlash', function ($http, URLS,errorFlash) {	
		return{
			options: function(url){			

				return $http.get(URLS.BASE_API+url)
				.success(function(data, status, headers, config) 
				{
					
				})
				.error(function(data, status, headers, config) 
				{
					errorFlash.error(data);
				});
			}
		};
	}])
	.service('Criterios', function () 
	{
	    var criterios = []; 
	    return { 
	    	getCriterios: function () 
	    	{ 
	    		return criterios; 
	    	}, 
	    	setCriterios: function(value) 
	    	{ 
	    		criterios = value; 
	    	} 
	    };
	})
	
})();