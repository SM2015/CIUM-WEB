(function(){
	'use strict';	
	angular.module('App')
		.service('AuthService',['$http','URLS','$localStorage',function($http, URLS, $localStorage){
			return {
				autenticar: function(data) {
					
	    return $http.post(URLS.BASE + 'signin', data, { ignoreAuthModule: true });
	},
				validar: function() {
					return $http.post(URLS.BASE_API + 'validacion-cuenta');
				},
				getPermisos: function() {
					return $http.post(URLS.BASE_API + 'permisos-autorizados',{user_email: $localStorage.cium.user_email});
				},
				getPerfil: function()
				{
					return $http.get(URLS.OAUTH_SERVER+'/v1/perfil');
				}
			}
		}]);
	
	angular.module('App')
		.factory('Auth', ['$rootScope', '$http', '$localStorage', 'AuthService', 'URLS','Menu', function ($rootScope, $http, $localStorage, AuthService, URLS, Menu) {
			return {
				signin: function (data, successCallback, errorCallback) {
					
					var obtenerToken = function(data)
					    {
										
					  return AuthService.autenticar(data)   
					    			.then(function(res){
													$localStorage.cium.access_token = res.data.access_token;
			   							$localStorage.cium.refresh_token = res.data.refresh_token;
					  return true;
					    });
					    },
						validarAcceso = function(e){
							 return AuthService.validar();
						},
						cargarPermisos = function(e){
							return AuthService.getPermisos()
									.then(function(res){
										Menu.setMenu(res.data.permisos);											
									});
						},
						perfil = function(e)
						{
							AuthService.getPerfil().then(function(data){
						        $localStorage.cium.perfil=data.data;                      
						      });
						},
						perfilUpadte = function(e)
						{
							var url  = "UpdateInfo";
							var data = $localStorage.cium.perfil.data;
							var id   = $localStorage.cium.user_email;
							$http.put(URLS.BASE_API + url +'/' + id, data);						                            
						},
						error = function (error) {
							
							delete $localStorage.cium.access_token;
							delete $localStorage.cium.refresh_token;
							delete $localStorage.cium.user_email;
							delete $localStorage.cium.menu;
							delete $localStorage.cium.perfil;
							var error_code = '';
							if(error.data == null){
								error_code = "CONNECTION_REFUSED";
								$rootScope.errorSignin = error_code;
								errorCallback();
								return true;
							}
							switch(error.data.error){
								case 'invalid_credentials':
									error_code  = 'ERROR_CREDENCIALES';
									break;
								case 'CUENTA_VALIDA_NO_AUTORIZADA':
									error_code = 'CUENTA_VALIDA_NO_AUTORIZADA';
									break;
								case 'ERROR_PERMISOS':
									error_code = 'ERROR_PERMISOS';
									break;
								default : error_code = 'CONNECTION_REFUSED';
															
								}
							$rootScope.errorSignin = error_code;
							errorCallback();
							
						};
					
					obtenerToken(data)
					.then(validarAcceso)
					.then(cargarPermisos)
					.then(perfil)
					.then(perfilUpadte)
					.then(successCallback)
					.catch(error);
				},
				refreshToken: function (data, success, error) {
					
					$http.post(URLS.BASE + 'refresh-token', data).success(success).error(error)
				},
				logout: function (success) {
					
					delete $localStorage.cium.access_token;
					delete $localStorage.cium.refresh_token;
					delete $localStorage.cium.user_email;
					delete $localStorage.cium.menu;
					delete $localStorage.cium.perfil;

					success();
				}
			};
		}]);
	
	angular.module('App')
	   .factory('Data', ['$http', 'URLS', function ($http, URLS) {
	 return {
	     getApiData: function (success, error) {
	   $http.get(URLS.BASE_API + 'restricted').success(success).error(error)
	     }
	 };
	   }
	   ]);
	angular.module('App')
		.factory('Menu',['$localStorage','MENU',function($localStorage, MENU){
			var menuAutorizado = $localStorage.cium.menu || [ '' ];
			var menu = ['']
			function updateMenu(){
				
				menu = MENU;
				// Recorremos todo el menu y quitamos los elementos a los que no se tenga autorizacion
				for(var i in menu){
					for(var j = 0; j < menu[i].lista.length; j++){
						if(menuAutorizado.indexOf(menu[i].lista[j].key) == -1 ){						
							menu[i].lista.splice(j,1);
							j = 0;
						}
					}
				}
				
				// Borramos los grupos que no tengan items en su lista			
				for(var i = 0; i < menu.length; i++){
					if(menu[i].lista.length==0){
						menu.splice(i,1);
						i = 0;
					}
				}
			}
			if($localStorage.cium.access_token){
				updateMenu();
			}
			
			return {
				menu : menu,
				getMenu:  function(){
					return menu;
				},
				
				setMenu: function(nuevo_menu){
					menuAutorizado = nuevo_menu || [ 'DASHBOARD' ];
					$localStorage.cium.menu = menuAutorizado;
					updateMenu();
				},
				
				existePath: function(path){
					for(var i in menu){
						for(var j in menu[i].lista){
							if(menu[i].lista[j].path == path){
								return true;
							}
						}
					}
					return false;
				}
			};
		}]);
	
})();