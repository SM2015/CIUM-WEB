(function(){
	'use strict';
	angular.module('DatoModule')
	.controller('DatoCtrl',
	       ['$rootScope', '$scope', '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash',  'infoUsuario', 'CrudDataApi', 'URLS', 
	function($rootScope,   $scope,   $mdSidenav,  $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,   infoUsuario,  CrudDataApi, URLS){
	
		 $scope.menuSelected = "/"+$location.path().split('/')[1];
	    $scope.menu = Menu.getMenu();
	    $scope.fecha_actual = new Date();
	    
	    $scope.cargando = true;

	    $scope.ruta="";
	    $scope.url=$location.url();

	    $scope.tableCardIsEnabled = false;
	    $scope.tableIsSelectable = false;
	    $scope.tableIsSortable = true;
	    $scope.htmlContent = true;

	    $scope.deleteRowCallback = function(rows){
	        $mdToast.show(
	      		$mdToast.simple()
	    		.content('Deleted row id(s): '+rows)
	    		.hideDelay(3000)
	        );
	    };
	    $scope.paginacion = 
	    {
	        pag: 1,
	        lim: 10,
	        paginas:0
	    };
	    $scope.datos = [];
	    $scope.ruta="";
	    $scope.url=$location.url();
		
		$scope.dato = {};
		$scope.permissions=[];
		$scope.modulos=[];
		$scope.grupos=[];
		$scope.acciones=[];

	    $scope.toggleMenu  = function  () {
	        $mdSidenav('left').toggle();
	    };
	    
	    $scope.mostrarIdiomas = function($event){  
	                      
	        $mdBottomSheet.show({
	          templateUrl: 'src/app/views/idiomas.html',
	          controller: 'ListaIdiomasCtrl',
	          targetEvent: $event	
	        });
	    };
	    
	    $scope.logout = function () {
	       Auth.logout(function () {
	           $location.path("signin");
	       });
	    };
	    
		
	    $scope.ir = function(path){
	        $scope.menuSelected = path;
	       	$location.path(path).search({id: null});
	    };

	    //Ver
		$scope.ver = function(ruta) 
		{
			$http.get(URLS.BASE_API+'UsuarioInfo')
			.success(function(data, status, headers, config) 
			{	
				$scope.dato = data.data;
				$scope.cargando=false;				
			})
			.error(function(data, status, headers, config) 
			{
				errorFlash.error(data);
				$scope.cargando=false;	
			});	  		
		};
		//Modificar
		$scope.modificar = function(id) 
		{    
		  var url="UpdateInfo";
		  var json=$scope.dato;
		  
		  $http.put(URLS.BASE_API+'UpdateInfo',json)
			.success(function(data, status, headers, config) 
			{	
				if(data.status==200)
				{
					  
				  flash('success', data.messages);
				}				
			})
			.error(function(data, status, headers, config) 
			{
				errorFlash.error(data);
			});	 
		};

		infoUsuario.preparar();
		$scope.$on('usuarioInicio', function() {
			$scope.usuarioInfo = infoUsuario.usuario;   
		});	
	}])
})();