(function(){
	'use strict';
	angular.module('HallazgoModule')
	.controller('HallazgoCtrl',
	       ['$rootScope', '$scope', '$translate', '$mdSidenav', '$localStorage', '$mdUtil', '$log', '$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash',   'CrudDataApi', 'URLS', 
	function($rootScope,   $scope,   $translate,   $mdSidenav,   $localStorage,   $mdUtil,   $log,   $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,    CrudDataApi, URLS){
		
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
		limit: 25,
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
        lim: 25,
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
	$scope.listaTemp = {};
	$scope.moduloName = angular.uppercase($location.path().split('/')[1]);
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
		
	$scope.filtro = {};
	$scope.filtro.historial = false;
	$scope.filtro.indicador = [];
	$scope.toggleRight = buildToggler('filtro');
	$scope.toggleRightIndicadores = buildToggler('indicadores');
	$scope.filtros = {};
    $scope.filtros.activo = false;
    function buildToggler(navID) {
      var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
              .toggle()
              .then(function () {
              });
          },200);
      return debounceFn;
    };
	$scope.tempIndicador = [];
	$scope.toggle = function (item, list) {
		var idx = list.indexOf(item.codigo);
		if (idx > -1) 
			list.splice(idx, 1);
		else 
		{
			list.push(item.codigo);
			$scope.chipIndicador[item.codigo] = item;
		}
	};
	$scope.exists = function (item, list) {
		return list.indexOf(item) > -1;
	};
	
	$scope.cambiarVerTodoIndicador = function ()
	{
		if($scope.filtro.verTodosIndicadores)
		{
			$scope.filtro.indicador = [];
			$scope.chipIndicador = [];
			$scope.tempIndicador = [];
		}
	}
	$scope.cambiarVerTodoUM = function ()
	{
		if($scope.filtro.verTodosUM)
			$scope.filtro.um = [];
	}
	$scope.filtro.um = {};
	$scope.mostrarCategoria=[];
	$scope.filtro.verTodosIndicadores = true;
	$scope.filtro.verTodosUM = true;
	$scope.chipIndicador = [];
	$scope.aplicarFiltro = function(avanzado,item)
	{
		$scope.filtros.activo=true;
		$scope.filtro.indicador = $scope.tempIndicador;
		if(!avanzado)
		{
			$scope.filtro.indicador = [];
			$scope.filtro.verTodosIndicadores = false;
			if($scope.filtro.indicador.indexOf(item.codigo) == -1)
			{
				$scope.filtro.indicador.push(item.codigo);
				$scope.chipIndicador[item.codigo] = item;
			}			
			$mdSidenav('indicadores').close();
		}		
		$scope.init();
	};
	$scope.quitarFiltro = function(avanzado)
	{
		$scope.filtro.indicador = [];
		$scope.filtro.um = {};
		$scope.filtro.verTodosIndicadores = true;
		$scope.filtro.verTodosUM = true;
		$scope.filtros.activo=false;
		$scope.init();
	};
	$scope.history = function()
	{
		$scope.init();
	}
	
	$scope.firstClick = function(id,ev)
	{
		id = angular.isUndefined(id) ? $scope.filtro.umActiva : id;
		$localStorage.cium.filtro.umActiva = id;
		if($scope.filtro.indicador.length>1||$scope.filtro.verTodosIndicadores)
		{
			$localStorage.cium.filtro.nivel = 1;
			$location.path("/hallazgo/indicadores").search({id: id});
		}
		else
		{
			if(ev)
				$location.path("/hallazgo").search({id: null});
			else{
				$localStorage.cium.filtro.nivel = 2;
				$localStorage.cium.filtro.tipo = null;
				$location.path("/hallazgo/evaluaciones").search({id: $scope.filtro.indicador[0]});
			}
		}
	};
	$scope.secondClick = function(id)
	{
		$localStorage.cium.filtro.nivel = 2;
		$localStorage.cium.filtro.tipo = null;		
		$location.path("/hallazgo/evaluaciones").search({id: id});
	}
	$scope.verEvaluacion = function(id,tipo)
	{
		$localStorage.cium.filtro.nivel = 3;
		$localStorage.cium.filtro.tipo = tipo;
		$localStorage.cium.filtro.indicadorActivo = $location.search().id;
		$location.path("/hallazgo/ver").search({id: id,});
	}
	
	$scope.verEvaluacionCompleta = function()
	{
		var id = $location.search().id;
		if($scope.filtro.tipo == "CALIDAD" )
			$location.path("/evaluacion-calidad/ver").search({id: id,});
		if($scope.filtro.tipo == "RECURSO" )
			$location.path("/evaluacion-recurso/ver").search({id: id,});
	}
	// inicializa las rutas para crear los href correspondientes en la vista actual
	$scope.index = function(ruta) 
	{
	  $scope.ruta=ruta;  
	  var uri=$scope.url;

	  if(uri.search("nuevo")==-1)
	  $scope.init();     
	};
	
	// obtiene los datos necesarios para crear el grid (listado)
    $scope.init = function(buscar,columna) 
	{
		var url=$scope.ruta;
		buscar = $scope.buscar;
		var pagina=$scope.paginacion.pag;
		var limite=$scope.paginacion.lim;
	
		var order=$scope.query.order;
	
		if(!angular.isUndefined(buscar))
			limite=limite+"&columna="+columna+"&valor="+buscar+"&buscar=true";
		$scope.cargando=true;
		$localStorage.cium.filtro = $scope.filtro;
      	CrudDataApi.lista(url+'?pagina=' + pagina + '&limite=' + limite+"&order="+order+"&filtro="+JSON.stringify($scope.filtro), function (data) {
        if(data.status  == '407')
        	$window.location="acceso";

      		if(data.status==200)
      		{				
				$scope.jurisdicciones = [];
				$scope.municipios = [];
				$scope.localidades = [];
				$scope.cones = [];
				
    			$scope.datos = data.data;
				angular.forEach(data.filtroUM , function(val, key) {
					if($scope.jurisdicciones.indexOf(val.jurisdiccion)==-1)
						$scope.jurisdicciones.push(val.jurisdiccion);
					
					if($scope.municipios.indexOf(val.municipio)==-1)
						$scope.municipios.push(val.municipio);
					
					if($scope.localidades.indexOf(val.localidad)==-1)
						$scope.localidades.push(val.localidad);
					
					if($scope.cones.indexOf(val.cone)==-1)
						$scope.cones.push(val.cone);
				});
				$scope.datos.indicadores = data.indicadores;
				$scope.total = data.totalIndicador;
    			$scope.paginacion.paginas = data.total;
				$scope.cargando=false;
      		}
      		else
			{
				$scope.cargando=false;
				errorFlash.error(data);
			}
      		$scope.cargando = false;
        },function (e) {
      		errorFlash.error(e);
      		$scope.cargando = false;
        });
    };
	
	// incia la busqueda con los parametros, columna = campo donde buscar, buscar = valor para la busqueda
	$scope.buscarL = function(buscar,columna) 
	{
		$scope.cargando = true;
		$scope.init(buscar,columna);
	};	
	
	//Ver. Muestra el detalle del id del recurso
	$scope.ver = function(ruta) 
	{
		$scope.ruta=ruta;		
		var url=$scope.ruta;		
		var id=$location.search().id;
		$scope.cargando=true;
		$scope.filtro = $localStorage.cium.filtro;
		CrudDataApi.ver(url, id+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";

			if(data.status==200)
			{
				$scope.dato=data.data;
				if($localStorage.cium.filtro.nivel==2)
				{
					$scope.eIndicador=[];
					$scope.eIndicador.push(data.data[0]);	
				}			
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