(function(){
	'use strict';
	angular.module('DatoModule')
	.controller('DatoCtrl',
	       ['$rootScope', '$scope', '$translate', '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash',  'infoUsuario', 'CrudDataApi', 'URLS', 
	function($rootScope,   $scope, $translate,   $mdSidenav,  $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,   infoUsuario,  CrudDataApi, URLS){
	
		 $scope.menuSelected = "/"+$location.path().split('/')[1];
	    $scope.menu = Menu.getMenu();
	    $scope.fecha_actual = new Date();
	    
	    $scope.cargando = true;

	    $scope.ruta="";
    $scope.url=$location.url();

    $scope.paginationLabel = {
      text: $translate.instant('ROWSPERPAGE'),
      of: $translate.instant('DE')
    };

	    

	    
	    // data table
    $scope.selected = [];

  $scope.query = {
    filter: '',
    order: 'id',
    limit: 5,
    page: 1
  };


  $scope.onOrderChange = function (order) {
    $scope.query.order=order;
    $scope.cargando = true;
    $scope.init(); 
  };


  $scope.onPaginationChange = function (page, limit) {
    $scope.paginacion = 
    {
        pag: (page-1)*limit,
        lim: limit,
        paginas:0
    };
    $scope.cargando = true;
    $scope.init();
  };
    //fin data
    $scope.paginacion = 
    {
        pag: 1,
        lim: 5,
        paginas:0
    };
	    $scope.datos = [];
	
		
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
			$scope.dato = infoUsuario;
			$scope.cargando=false;								
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

		
		$scope.usuarioInfo = infoUsuario;   
		
	}])
})();