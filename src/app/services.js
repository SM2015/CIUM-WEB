

(function(){
	'use strict';

/**
 * @ngdoc service
 * @name App.AuthService
 * @description
 * Proporciona los metodos para la autenticacion y permisos.
 */  
 
 /**
* @ngdoc method
* @name App.AuthService#modificar
* @methodOf App.AuthService
*
* @description
* Reliza el post de los parametros que contiene las credenciales del usuario
* @param {objet} data object con las credenciales del usuario
*/ 

/**
* @ngdoc method
* @name App.AuthService#validar
* @methodOf App.AuthService
*
* @description
* Comprueba que la cuenta del usuario este activa
*/	

/**
* @ngdoc method
* @name App.AuthService#getPermisos
* @methodOf App.AuthService
*
* @description
* obtener los permisos que tiene el usuario para contruir el menu
*/

/**
* @ngdoc method
* @name App.AuthService#getPerfil
* @methodOf App.AuthService
*
* @description
* obtener los datos del perfil del usuario
*/
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
	
/**
 * @ngdoc service
 * @name App.Auth
 * @description
 * Proporciona los metodos para la autenticacion y permisos, estos pueden ser invocados desde el controlador.
 */  
 
/**
* @ngdoc method
* @name App.Auth#signin
* @methodOf App.Auth
*
* @description
* Prepara el mecanismo de autentificación
* @param {objet} data object con las credenciales del usuario
* @param {function} successCallback funcion a ejecutar si la respuesta es correcta
* @param {function} errorCallback funcion a ejecutar si se obtiene un error
*/	
 
/**
* @ngdoc method
* @name App.Auth#refreshToken
* @methodOf App.Auth
*
* @description
* Prepara el mecanismo para solicitar un nuevo token
* @param {function} success funcion a ejecutar si la respuesta es correcta
*/

/**
* @ngdoc method
* @name App.Auth#logout
* @methodOf App.Auth
*
* @description
* Eliminar todo lo que tenga en session y localstorage para cerrar la sesión
* @param {objet} data object con las credenciales del usuario
* @param {function} success funcion a ejecutar si la respuesta es correcta
* @param {function} error funcion a ejecutar si se obtiene un error
*/	 
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
						        var url  = "UpdateInfo";
								var data = $localStorage.cium.perfil.data; 
								var id   = $localStorage.cium.user_email;
								$http.put(URLS.BASE_API + url +'/' + id, data);	                     
						      });
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
/**
 * @ngdoc service
 * @name App.Menu
 * @description
 * Crea el menu lateral izquierda según permisos.
 */  	   
	angular.module('App')
		.factory('Menu',['$localStorage','MENU',function($localStorage, MENU){
			var menuAutorizado = $localStorage.cium.menu || [ '' ];
			var menu = ['']
			function updateMenu(){
				
				menu = JSON.parse(JSON.stringify(MENU));
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