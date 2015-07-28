(function(){
	'use strict';
	angular.module('CrudModule')
	   .factory('CrudDataApi', ['$http', 'URLS', function ($http, URLS) {
	 return {
	     lista: function (url, success, error) { 
	   $http.get(URLS.BASE_API + url).success(success).error(error)
	     },
			   ver: function (url, id, success, error) {
	   $http.get(URLS.BASE_API + url +'/' + id).success(success).error(error)
	     },
			   crear: function (url, data, success, error) {
	   $http.post(URLS.BASE_API + url, data).success(success).error(error)
	     },
			   editar: function (url, id, data, success, error) {
	   $http.put(URLS.BASE_API + url +'/' + id, data).success(success).error(error)
	     },
			   eliminar: function (url, id,  success, error) {
	   $http.delete(URLS.BASE_API + url +'/' + id).success(success).error(error)
	     }
	 };
	   }
	   ]);
})();