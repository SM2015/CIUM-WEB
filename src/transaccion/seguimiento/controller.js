(function(){
	'use strict';
	angular.module('SeguimientoModule')
	.controller('SeguimientoCtrl',
	       ['$rootScope', '$scope', '$translate',  '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash',   'CrudDataApi', 'URLS', 
	function($rootScope,   $scope, $translate,   $mdSidenav,  $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,    CrudDataApi, URLS){
		
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
    $scope.init(); 
  };

  $scope.onPaginationChange = function (page, limit) {
    $scope.paginacion = 
    {
        pag: (page-1)*limit,
        lim: limit,
        paginas:0
    };
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
	    $scope.nuevo = function()
	    {
	        var uri=$scope.url.split('/');

	        uri="/"+uri[1]+"/nuevo";
	        $location.path(uri).search({id: null});
	    }
		
		$scope.arrows = {
			year: {
				left: 'bower_components/material-design-icons/navigation/svg/production/ic_arrow_back_48px.svg',
				right:'bower_components/material-design-icons/navigation/svg/production/ic_arrow_forward_48px.svg'
			},
			month: {
				left: 'bower_components/material-design-icons/navigation/svg/production/ic_chevron_left_48px.svg',
				right:'bower_components/material-design-icons/navigation/svg/production/ic_chevron_right_48px.svg'
			}
		}
		
		$scope.agregar = function(msg,id) 
		{
			var json={'descripcion':msg, 'idHallazgo':id, 'evaluacion':$location.search().id};
			
			$http.post(URLS.BASE_API+"Seguimiento", json)
			.success(function(data, status, headers, config) 
			{
				if(data.status == '201' || data.status == '200')
				{							
					flash('success', data.messages);				    		
					$scope.ver('Seguimiento');
				}
				else
				{
					flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
				}
			})
			.error(function(data, status, headers, config) 
			{
				errorFlash.error(data);
			});
		};
		//cerrar
		$scope.cerrar = function(id) 
		{
			var json={'resuelto':1};
			
			$http.put(URLS.BASE_API+'Seguimiento/' + id, json)
			.success(function(data, status, headers, config) 
			{
				if(data.status == '201' || data.status == '200')
				{						
					var uri=$scope.url.split('/');	
					uri="/"+uri[1]+"/ver";
					$location.path(uri).search({id: data.data.id});				    		
				}
				else
				{
					flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
				}
			})
			.error(function(data, status, headers, config) 
			{
				errorFlash.error(data);
			});
		};
		//ver
		$scope.ver = function(ruta) 
		{
			$scope.ruta=ruta;
			
			var url=$scope.ruta;
			
			var id=$location.search().id;

			CrudDataApi.ver(url, id, function (data) {
				if(data.status  == '407')
					$window.location="acceso";

				if(data.status==200)
				{
					$scope.id=data.data.id;
					$scope.dato=data.data;
				}
				else
				{
					flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
				}
					$scope.cargando = false;
				},function (e) {
					errorFlash.error(e);
					$scope.cargando = false;
				}
			);  		
		};
	}])
})();