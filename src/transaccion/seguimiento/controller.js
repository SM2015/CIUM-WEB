(function(){
	'use strict';
	angular.module('SeguimientoModule')
	.controller('SeguimientoCtrl',
	       ['$rootScope', '$scope', '$translate',  '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash',   'CrudDataApi', 'URLS', 
	function($rootScope,   $scope, $translate,   $mdSidenav,  $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,    CrudDataApi, URLS){
		
	// cambia de color el menu seleccionado
	$scope.menuSelected = "/"+$location.path().split('/')[1];
	// carga el menu correspondiente para el usuario
	$scope.menu = Menu.getMenu();
	$scope.fecha_actual = new Date();

	// inicia la inimación de cargando
	$scope.cargando = true;

	// inicializa el modulo ruta y url se le asigna el valor de la página actual
	$scope.ruta="";
    $scope.url=$location.url();

    // cambia los textos del paginado de cada grid
    $scope.paginationLabel = {
      text: $translate.instant('ROWSPERPAGE'),
      of: $translate.instant('DE')
    };
	   
    // Inicializa el campo para busquedas disponibles para cada grid
    $scope.BuscarPor=
    [
		{id:"nombre", nombre:$translate.instant('NOMBRE')},
		{id:'creadoAl', nombre:$translate.instant('CREADO')},
		{id:'modificadoAl', nombre:$translate.instant('MODIFICADO')}
	];
	   
	// inicia configuración para los data table (grid)
    $scope.selected = [];

    // incializa el modelo para el filtro, ordenamiento y paginación
	$scope.query = {
		filter: '',
		order: 'id',
		limit: 5,
		page: 1
	};

	// Evento para incializar el ordenamiento segun la columna clickeada
	$scope.onOrderChange = function (order) {
		$scope.query.order=order;
		$scope.cargando = true;
		$scope.init(); 
	};

	// Evento para el control del paginado.
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
		
	// muestra el menu para aquellos dispositivos que por su tamaño es oculto
	$scope.toggleMenu  = function  () {
	    $mdSidenav('left').toggle();
	};

	// muestra el templete para cambiar el idioma
	$scope.mostrarIdiomas = function($event){  
	                  
	    $mdBottomSheet.show({
	      templateUrl: 'src/app/views/idiomas.html',
	      controller: 'ListaIdiomasCtrl',
	      targetEvent: $event	
	    });
	};

	// cierra la session para salir del sistema
	$scope.logout = function () {
	   Auth.logout(function () {
	       $location.path("signin");
	   });
	};

	// redirecciona a la página que se le pase como parametro
	$scope.ir = function(path){
	    $scope.menuSelected = path;
	   $location.path(path).search({id: null});
	};

	// evento para el boton nuevo, redirecciona a la vista nuevo
	$scope.nuevo = function()
	{
	    var uri=$scope.url.split('/');

	    uri="/"+uri[1]+"/nuevo";
	    $location.path(uri).search({id: null});
	}

	$scope.showSearch = false;
	$scope.listaTemp={};
	$scope.moduloName=angular.uppercase($location.path().split('/')[1]);
	$scope.mostrarSearch = function(t)
	{
		$scope.showSearch = ! $scope.showSearch;
		if(t==0)
		{
			$scope.listaTemp = $scope.datos;		
		}
		else
		{
			$scope.buscar='';
			$scope.datos = $scope.listaTemp;
		}
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
	
	// agregar observaciones al seguimiento
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
			errorFlash.error(data);
		}
		})
		.error(function(data, status, headers, config) 
		{
			errorFlash.error(data);
		});
	};
	//cerrar concluir el seguimiento
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
			errorFlash.error(data);
		}
		})
		.error(function(data, status, headers, config) 
		{
			errorFlash.error(data);
		});
	};
	
	// Ver. Muestra los datos del elemento que se le pase como parametro
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
			errorFlash.error(data);
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