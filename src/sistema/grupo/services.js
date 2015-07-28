(function(){
	'use strict';
	angular.module('IndicadorModule')	
	.factory('moduloAccion', ['$http', 'URLS','errorFlash', function ($http, URLS,errorFlash, CrudDataApi) {	 
		return {		 
			modulos: function() 
			{ 			
				return $http.get(URLS.BASE_API+'permiso')
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
	.factory('sisGrupo', ['$http', 'URLS','errorFlash', function ($http, URLS,errorFlash, CrudDataApi) {	 
		return {		 
			grupo: function(id, scope) 
			{ 	
				return $http.get(URLS.BASE_API+"Grupo/"+id)
				.success(function(data, status, headers, config) 
				{
					scope.grupos.push(data.data);
					var accion=[]; var temp="";
					
					var datos=data.data.permissions;
					
					$http.post(URLS.BASE_API+"ordenKey",datos)
					.success(function(data, status, headers, config) 
					{
						scope.modulosTemp=[];
						
						angular.forEach(data , function(idx, key) 
						{
							var clave=key.split(".");
							
							if(temp!=clave[0])
							{
								scope.acciones[temp+id]=accion;
								accion=[];
							}
							if(scope.modulosTemp.indexOf(clave[0])==-1)
							{						
								scope.modulosTemp.push(clave[0]);	
								accion.push(clave[1]);					
								temp=clave[0];					
							}
							else
							{
								accion.push(clave[1]);
							}						
							
						});
						
						scope.acciones[temp+id]=accion;
						scope.modulos[id]=scope.modulosTemp;						
					});			
				})
				.error(function(data, status, headers, config) 
				{
					errorFlash.error(data);
				});
			}
		}
	}])
})();