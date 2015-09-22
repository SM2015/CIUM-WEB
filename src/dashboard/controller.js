(function(){
	'use strict';
	angular.module('DashboardModule')
	.controller('DashboardCtrl',
	       ['$rootScope', '$scope', '$translate',  '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash', 'listaOpcion', 'Criterios', 'CrudDataApi', 'URLS', 
	function($rootScope,   $scope, $translate,    $mdSidenav,  $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,   listaOpcion,   Criterios,   CrudDataApi, URLS){
	
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
		
	}])
	
	.controller('recursoController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, $mdUtil, $mdSidenav, $translate, EvaluacionId,CrudDataApi ) {
		
		$scope.recurso = true;
	
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verRecurso="";
		$scope.dimension = [];
		
		$scope.tempIndicador = [];
		$scope.toggle = function (item, list) {
			var idx = list.indexOf(item);
			if (idx > -1) 
				list.splice(idx, 1);
			else 
			{
				list.push(item);
			}
		};
		//lenar los check box tipo array
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
		
		$scope.cambiarVerTodoClues = function ()
		{			
			$scope.filtro.clues = [];			
		}
			
		$scope.showAlert = function(ev) {
			$mdDialog.show(
			$mdDialog.alert()
				.parent(angular.element(document.getElementById('recurso')))
				.title($translate.instant('TITULO_DIALOG'))
				.content($translate.instant('MENSAJE_DIALOG'))
				.ariaLabel('info')
				.ok('Ok')
				.targetEvent(ev)
			);
		};
  	
		var d = new Date();
		$scope.tamano = 0;
		$scope.filtro = {};
		$scope.filtro.visualizar = 'tiempo';
		$scope.filtro.anio = d.getFullYear();
		$scope.filtro.um = {};
		$scope.filtro.um.tipo='municipio';		
		$scope.filtro.clues = [];
		$scope.mostrarCategoria=[];
		$scope.filtro.verTodosIndicadores = true;
		$scope.filtro.verTodosUM = true;
		$scope.filtro.verTodosClues = true;
		$scope.chipIndicador = [];
		$scope.filtros = {};
    	$scope.filtros.activo = false;
		$scope.verInfo = false;
		//aplicar los filtros al area del grafico
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
				
			}
			$scope.contador = 0;
			$scope.intento = 0;
			$scope.init();
			$mdSidenav('recurso').close();
			if($scope.filtro.visualizar == 'parametro' & $scope.filtro.um.nivel == 'clues')
			{
				$scope.verInfo = true;
				$scope.showAlert();
			} 							
		};
		$scope.contador = 0;
		$scope.chartClick  = function (event) 
		{
			if($scope.verInfo)
			{
				var points = $scope.chart.getBarsAtEvent( event ) ;
				if($scope.contador == 0)
				{
					$scope.recurso=true;
					$scope.intento = 0;		
					CrudDataApi.lista("recursoClues?filtro="+JSON.stringify($scope.filtro)+"&clues="+points[0].label, function (data) {
						if(data.status==200)
						{									
							$scope.data  = data.data; 					
							$scope.total = data.total;
							$scope.recurso=false;
							$scope.contador++;
						}
						else
						{
							$scope.recurso=false;
							errorFlash.error(data);
						}
					},function (e) {
						if($scope.intento<1)
						{
							$scope.chartClick(event);
							$scope.intento++;
						}
						$scope.recurso = false;
					});
				}
				if($scope.contador == 1)
				{				
					var punto=points[0].label;
					punto=punto.split('#');
					
					$scope.showModalCriterio = !$scope.showModalCriterio;
					EvaluacionId.setId(punto[1]);
					$mdDialog.show({
						controller: DialogRecurso,
						templateUrl: 'src/dashboard/views/verRecurso.html',
						parent: angular.element(document.body),
					});
				}
			}	 
		}
		//quitar los filtros seleccionados del dialog
		$scope.quitarFiltro = function(avanzado)
		{
			$scope.filtro.indicador = [];
			$scope.filtro.clues = [];
			$scope.filtro.um = {};
			$scope.filtro.verTodosIndicadores = true;
			$scope.filtro.verTodosUM = true;
			$scope.filtros.activo=false;
			
			$scope.intento = 0;
			$scope.contador = 0;
			$scope.init();
			$mdSidenav('recurso').close();
		};
		
		// cerrar el dialog
		$scope.hide = function() {
			$mdDialog.hide();
		};
		//cambiar a pantalla completa
		$scope.isFullscreen = false;	
		$scope.tieneTamano = false;
		$scope.toggleFullScreen = function(e) 
		{
			$scope.isFullscreen = !$scope.isFullscreen;	
			$scope.tieneTamano = !$scope.tieneTamano;
			if($scope.tieneTamano)
			{	
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chart")).attr("width") : $scope.tamano;				
			} 						 		 
		}		
		$scope.cargarFiltro = 0;				
		$scope.toggleRightOpciones = function(navID) {		
			$mdSidenav(navID)
			.toggle()
			.then(function () {
				if($scope.cargarFiltro < 1)
				{
					$scope.getDimension('anio',0);
					$scope.getDimension('month',1);	
					$scope.getDimension("codigo,indicador,color, 'Recurso' as categoriaEvaluacion",2);	
					$scope.getDimension('jurisdiccion',3);
					$scope.getDimension('municipio',4);
					$scope.getDimension('zona',5);	
					$scope.getDimension('cone',6);
					$scope.cargarFiltro++;
				}
			});					
		};
		$scope.contAnio = 0;
		$scope.cambiarAnio = function()
		{
			$scope.contAnio++;
			if($scope.contAnio>1)
			{
				$scope.getDimension('month',1);	
				$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
				$scope.getDimension('jurisdiccion',3);
				$scope.getDimension('municipio',4);
				$scope.getDimension('zona',5);	
				$scope.getDimension('cone',6);
			}
		}
		$scope.cambiarBimestre = function()
		{
			$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
			$scope.getDimension('jurisdiccion',3);
			$scope.getDimension('municipio',4);
			$scope.getDimension('zona',5);	
			$scope.getDimension('cone',6);
		}
		$scope.$watch(function(){
       		return $window.innerWidth;
		}, 
		function(value) {
			if(!$scope.isFullscreen)
			{
				$scope.tamano = 0;
				$scope.tieneTamano = false;
			}
   		});
   
		$scope.intentoOpcion = 0;
		$scope.getDimension = function(nivel,c)
		{
			$scope.opcion = true;
	  		CrudDataApi.lista('recursoDimension?filtro='+JSON.stringify($scope.filtro)+'&nivel='+nivel, function (data) {    		  	  
				$scope.datos[c] = data.data; 
				$scope.opcion = false;				
		  	},function (e) {
				if($scope.intentoOpcion<1)
				{
					$scope.getDimension(nivel,c);
					$scope.intentoOpcion++;
				}
				$scope.opcion = false;
			});
		};				
					
		// obtiene los datos necesarios para crear el grid (listado)
		$scope.intento = 0;
		$scope.init = function() 
		{
			var url='recurso';
				
			$scope.recurso=true;
			CrudDataApi.lista(url+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";
	
				if(data.status==200)
				{									
					$scope.data  = data.data; 					
					$scope.total = data.total;
					$scope.recurso=false;
				}
				else
				{
					$scope.recurso=false;
					errorFlash.error(data);
				}
				$scope.recurso = false;
			},function (e) {
				if($scope.intento<1)
				{
					$scope.init();
					$scope.intento++;
				}
				$scope.recurso = false;
			});
		};
		$scope.init();
		$scope.options =  {
	
			// Sets the chart to be responsive
			responsive: true,
			
			//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
			scaleBeginAtZero : true,
			
			//Boolean - Whether grid lines are shown across the chart
			scaleShowGridLines : true,
			
			//String - Colour of the grid lines
			scaleGridLineColor : "rgba(0,0,0,.05)",
			
			//Number - Width of the grid lines
			scaleGridLineWidth : 1,
			
			//Boolean - If there is a stroke on each bar
			barShowStroke : true,
			
			//Number - Pixel width of the bar stroke
			barStrokeWidth : 5,
			
			//Number - Spacing between each of the X value sets
			barValueSpacing : 5,
			
			//Number - Spacing between data sets within X values
			barDatasetSpacing : 1,
			
			//String - A legend template
			legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].fillColor%>"></span><%if(datasets[i].label){ %><%=datasets[i].label%><%}%></li><%}%></ul>'
		};
	})									 
	
	.controller('calidadController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, $mdUtil, $mdSidenav, $translate,  EvaluacionShow, EvaluacionId, CrudDataApi ) {
		
		$scope.calidad = true;
	
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verCalidad="";
		$scope.dimension = [];
		
		$scope.tempIndicador = [];
		$scope.toggle = function (item, list) {
			var idx = list.indexOf(item);
			if (idx > -1) 
				list.splice(idx, 1);
			else 
			{
				list.push(item);
			}
		};
		//lenar los check box tipo array
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
		
		$scope.cambiarVerTodoClues = function ()
		{			
			$scope.filtro.clues = [];			
		}
			
		$scope.showAlert = function(ev) {
			$mdDialog.show(
			$mdDialog.alert()
				.parent(angular.element(document.getElementById('calidad')))
				.title($translate.instant('TITULO_DIALOG'))
				.content($translate.instant('MENSAJE_DIALOG'))
				.ariaLabel('info')
				.ok('Ok')
				.targetEvent(ev)
			);
		};
  	
		var d = new Date();
		$scope.tamano = 0;
		$scope.filtro = {};
		$scope.filtro.visualizar = 'tiempo';
		$scope.filtro.anio = d.getFullYear();
		$scope.filtro.um = {};
		$scope.filtro.um.tipo='municipio';		
		$scope.filtro.clues = [];
		$scope.mostrarCategoria=[];
		$scope.filtro.verTodosIndicadores = true;
		$scope.filtro.verTodosUM = true;
		$scope.filtro.verTodosClues = true;
		$scope.chipIndicador = [];
		$scope.filtros = {};
    	$scope.filtros.activo = false;
		$scope.verInfo = false;
		//aplicar los filtros al area del grafico
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
				
			}
			$scope.contador = 0;
			$scope.intento = 0;
			$scope.init();
			$mdSidenav('calidad').close();
			if($scope.filtro.visualizar == 'parametro' & $scope.filtro.um.nivel == 'clues')
			{
				$scope.verInfo = true;
				$scope.showAlert();
			} 							
		};
		$scope.contador = 0;
		$scope.chartClick  = function (event) 
		{
			if($scope.verInfo)
			{
				var points = $scope.chart.getBarsAtEvent( event ) ;
				if($scope.contador == 0)
				{
					$scope.calidad=true;
					$scope.intento = 0;		
					CrudDataApi.lista("calidadClues?filtro="+JSON.stringify($scope.filtro)+"&clues="+points[0].label, function (data) {
						if(data.status==200)
						{									
							$scope.data  = data.data; 					
							$scope.total = data.total;
							$scope.calidad=false;
							$scope.contador++;
						}
						else
						{
							$scope.calidad=false;
							errorFlash.error(data);
						}
					},function (e) {
						if($scope.intento<1)
						{
							$scope.chartClick(event);
							$scope.intento++;
						}
						$scope.calidad = false;
					});
				}
				if($scope.contador == 1)
				{				
					var punto=points[0].label;
					punto=punto.split('#');
					
					$scope.showModalCriterio = !$scope.showModalCriterio;
					EvaluacionId.setId(punto[1]);
					$mdDialog.show({
						controller: DialogCalidad,
						templateUrl: 'src/dashboard/views/verCalidad.html',
						parent: angular.element(document.body),
					});
				}
			}	 
		}
		//quitar los filtros seleccionados del dialog
		$scope.quitarFiltro = function(avanzado)
		{
			$scope.filtro.indicador = [];
			$scope.filtro.clues = [];
			$scope.filtro.um = {};
			$scope.filtro.verTodosIndicadores = true;
			$scope.filtro.verTodosUM = true;
			$scope.filtros.activo=false;
			
			$scope.intento = 0;
			$scope.contador = 0;
			$scope.init();
			$mdSidenav('calidad').close();
		};
		
		// cerrar el dialog
		$scope.hide = function() {
			$mdDialog.hide();
		};
		//cambiar a pantalla completa
		$scope.isFullscreen = false;	
		$scope.tieneTamano = false;
		$scope.toggleFullScreen = function(e) 
		{
			$scope.isFullscreen = !$scope.isFullscreen;	
			$scope.tieneTamano = !$scope.tieneTamano;
			if($scope.tieneTamano)
			{	
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chart")).attr("width") : $scope.tamano;				
			} 						 		 
		}		
		$scope.cargarFiltro = 0;				
		$scope.toggleRightOpciones = function(navID) {		
			$mdSidenav(navID)
			.toggle()
			.then(function () {
				if($scope.cargarFiltro < 1)
				{
					$scope.getDimension('anio',0);
					$scope.getDimension('month',1);	
					$scope.getDimension("codigo,indicador,color, 'Calidad' as categoriaEvaluacion",2);	
					$scope.getDimension('jurisdiccion',3);
					$scope.getDimension('municipio',4);
					$scope.getDimension('zona',5);	
					$scope.getDimension('cone',6);
					$scope.cargarFiltro++;
				}
			});					
		};
		$scope.contAnio = 0;
		$scope.cambiarAnio = function()
		{
			$scope.contAnio++;
			if($scope.contAnio>1)
			{
				$scope.getDimension('month',1);	
				$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
				$scope.getDimension('jurisdiccion',3);
				$scope.getDimension('municipio',4);
				$scope.getDimension('zona',5);	
				$scope.getDimension('cone',6);
			}
		}
		$scope.cambiarBimestre = function()
		{
			$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
			$scope.getDimension('jurisdiccion',3);
			$scope.getDimension('municipio',4);
			$scope.getDimension('zona',5);	
			$scope.getDimension('cone',6);
		}
		$scope.$watch(function(){
       		return $window.innerWidth;
		}, 
		function(value) {
			if(!$scope.isFullscreen)
			{
				$scope.tamano = 0;
				$scope.tieneTamano = false;
			}
   		});
   
		$scope.intentoOpcion = 0;
		$scope.getDimension = function(nivel,c)
		{
			$scope.opcion = true;
	  		CrudDataApi.lista('calidadDimension?filtro='+JSON.stringify($scope.filtro)+'&nivel='+nivel, function (data) {    		  	  
				$scope.datos[c] = data.data; 
				$scope.opcion = false;				
		  	},function (e) {
				if($scope.intentoOpcion<1)
				{
					$scope.getDimension(nivel,c);
					$scope.intentoOpcion++;
				}
				$scope.opcion = false;
			});
		};				
					
		// obtiene los datos necesarios para crear el grid (listado)
		$scope.intento = 0;
		$scope.init = function() 
		{
			var url='calidad';
				
			$scope.calidad=true;
			CrudDataApi.lista(url+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";
	
				if(data.status==200)
				{									
					$scope.data  = data.data; 					
					$scope.total = data.total;
					$scope.calidad=false;
				}
				else
				{
					$scope.calidad=false;
					errorFlash.error(data);
				}
				$scope.calidad = false;
			},function (e) {
				if($scope.intento<1)
				{
					$scope.init();
					$scope.intento++;
				}
				$scope.calidad = false;
			});
		};
		$scope.init();
		$scope.options =  {
	
			// Sets the chart to be responsive
			responsive: true,
			
			//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
			scaleBeginAtZero : true,
			
			//Boolean - Whether grid lines are shown across the chart
			scaleShowGridLines : true,
			
			//String - Colour of the grid lines
			scaleGridLineColor : "rgba(0,0,0,.05)",
			
			//Number - Width of the grid lines
			scaleGridLineWidth : 1,
			
			//Boolean - If there is a stroke on each bar
			barShowStroke : true,
			
			//Number - Pixel width of the bar stroke
			barStrokeWidth : 5,
			
			//Number - Spacing between each of the X value sets
			barValueSpacing : 5,
			
			//Number - Spacing between data sets within X values
			barDatasetSpacing : 1,
			
			//String - A legend template
			legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].fillColor%>"></span><%if(datasets[i].label){ %><%=datasets[i].label%><%}%></li><%}%></ul>'
		};
	})
	
	
	.controller('pieController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, $mdUtil, $mdSidenav, $translate,CrudDataApi ) {
		
		$scope.pie = true;
	
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verPie="";
		$scope.dimension = [];
		
		$scope.tempIndicador = [];
		$scope.toggle = function (item, list) {
			var idx = list.indexOf(item);
			if (idx > -1) 
				list.splice(idx, 1);
			else 
			{
				list.push(item);
			}
		};
		//lenar los check box tipo array
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
		
		$scope.cambiarVerTodoClues = function ()
		{			
			$scope.filtro.clues = [];			
		}
  	
		var d = new Date();
		$scope.opcion = true;
		$scope.tamano = 0;
		$scope.filtro = {};
		$scope.filtro.tipo = "Recurso";
		$scope.filtro.visualizar = 'tiempo';
		$scope.filtro.anio = d.getFullYear();
		$scope.filtro.um = {};
		$scope.filtro.um.tipo='municipio';		
		$scope.filtro.clues = [];
		$scope.mostrarCategoria=[];
		$scope.filtro.verTodosIndicadores = true;
		$scope.filtro.verTodosUM = true;
		$scope.filtro.verTodosClues = true;
		$scope.chipIndicador = [];
		$scope.filtros = {};
    	$scope.filtros.activo = false;
		$scope.verInfo = false;
		//aplicar los filtros al area del grafico
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
				
			}
			$scope.contador = 0;
			$scope.intento = 0;
			$scope.init();						
		};
		$scope.contador = 0;
		
		//quitar los filtros seleccionados del dialog
		$scope.quitarFiltro = function(avanzado)
		{
			$scope.filtro.indicador = [];
			$scope.filtro.clues = [];
			$scope.filtro.um = {};
			$scope.filtro.verTodosIndicadores = true;
			$scope.filtro.verTodosUM = true;
			$scope.filtros.activo=false;
			
			$scope.intento = 0;
			$scope.contador = 0;
			$scope.init();
			$mdSidenav('pie').close();
		};
		
		// cerrar el dialog
		$scope.hide = function() {
			$mdDialog.hide();
		};
		//cambiar a pantalla completa
		$scope.isFullscreen = false;	
		$scope.tieneTamano = false;
		$scope.toggleFullScreen = function(e) 
		{
			$scope.isFullscreen = !$scope.isFullscreen;	
			$scope.tieneTamano = !$scope.tieneTamano;
			if($scope.tieneTamano)
			{	
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chart")).attr("width") : $scope.tamano;				
			} 						 		 
		}		
		$scope.cargarFiltro = 0;				
		$scope.toggleRightOpciones = function(navID) {
			$scope.catVisible = true;		
			$mdSidenav(navID)
			.toggle()
			.then(function () {
				if($scope.cargarFiltro < 1)
				{
					$scope.getDimension('anio',0);
					$scope.getDimension('month',1);	
					$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
					$scope.getDimension('jurisdiccion',3);
					$scope.getDimension('municipio',4);
					$scope.getDimension('zona',5);	
					$scope.getDimension('cone',6);
					$scope.cargarFiltro++;
				}
			});					
		};
		$scope.contAnio = 0;
		$scope.cambiarAnio = function()
		{
			$scope.contAnio++;
			if($scope.contAnio>1)
			{
				$scope.getDimension('month',1);	
				$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
				$scope.getDimension('jurisdiccion',3);
				$scope.getDimension('municipio',4);
				$scope.getDimension('zona',5);	
				$scope.getDimension('cone',6);
			}
		}
		$scope.cambiarBimestre = function()
		{
			$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
			$scope.getDimension('jurisdiccion',3);
			$scope.getDimension('municipio',4);
			$scope.getDimension('zona',5);	
			$scope.getDimension('cone',6);
		}
		$scope.cambiarCategoria = function()
		{
			$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);
		}
		$scope.$watch(function(){
       		return $window.innerWidth;
		}, 
		function(value) {
			if(!$scope.isFullscreen)
			{
				$scope.tamano = 0;
				$scope.tieneTamano = false;
			}
   		});
   
		$scope.intentoOpcion = 0;
		$scope.getDimension = function(nivel,c)
		{
			$scope.opcion = true;
			var url="calidadDimension";
			if($scope.filtro.tipo=="Recurso")
				url="recursoDimension";
			
			CrudDataApi.lista(url+'?filtro='+JSON.stringify($scope.filtro)+'&nivel='+nivel, function (data) { 				  
				$scope.datos[c] = data.data; 
				$scope.opcion = false;				
			},function (e) {
				if($scope.intentoOpcion<1)
				{
					$scope.getDimension(nivel,c);
					$scope.intentoOpcion++;
				}
				$scope.opcion = false;
			});							
		};				
					
		// obtiene los datos necesarios para crear el grid (listado)
		$scope.intento = 0;
		$scope.init = function() 
		{
			var url='pieVisita';
				
			$scope.pie=true;
			CrudDataApi.lista(url+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";
	
				if(data.status==200)
				{									
					$scope.data  = data.data; 					
					$scope.total = data.total;
					$scope.pie=false;
				}
				else
				{
					$scope.pie=false;
					errorFlash.error(data);
				}
				$scope.pie = false;
			},function (e) {
				if($scope.intento<1)
				{
					$scope.init();
					$scope.intento++;
				}
				$scope.pie = false;
			});
		};
		$scope.init();
	

	
		$scope.options =  {

			// Sets the chart to be responsive
			responsive: true,
		
			//Boolean - Whether we should show a stroke on each segment
			segmentShowStroke : true,
		
			//String - The colour of each segment stroke
			segmentStrokeColor : '#fff',
		
			//Number - The width of each segment stroke
			segmentStrokeWidth : 2,
		
			//Number - The percentage of the chart that we cut out of the middle
			percentageInnerCutout : 0, // This is 0 for Pie charts
		
			//Number - Amount of animation steps
			animationSteps : 100,
		
			//String - Animation easing effect
			animationEasing : 'easeOutBounce',
		
			//Boolean - Whether we animate the rotation of the Doughnut
			animateRotate : true,
		
			//Boolean - Whether we animate scaling the Doughnut from the centre
			animateScale : false,
		
			//String - A legend template
			legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'

		};
	})
	
	.controller('alertaController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, $mdUtil, $mdSidenav, $translate,CrudDataApi ) {
		
		$scope.alerta = true;
	
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verAlerta="";
		$scope.dimension = [];
		
		$scope.tempIndicador = [];
		$scope.toggle = function (item, list) {
			var idx = list.indexOf(item);
			if (idx > -1) 
				list.splice(idx, 1);
			else 
			{
				list.push(item);
			}
		};
		//lenar los check box tipo array
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
		
		$scope.cambiarVerTodoClues = function ()
		{			
			$scope.filtro.clues = [];			
		}
  	
		var d = new Date();
		$scope.opcion = true;
		$scope.tamano = 0;
		$scope.filtro = {};
		$scope.filtro.tipo = "Recurso";
		$scope.filtro.visualizar = 'tiempo';
		$scope.filtro.anio = d.getFullYear();
		$scope.filtro.um = {};
		$scope.filtro.um.tipo='municipio';		
		$scope.filtro.clues = [];
		$scope.mostrarCategoria=[];
		$scope.filtro.verTodosIndicadores = true;
		$scope.filtro.verTodosUM = true;
		$scope.filtro.verTodosClues = true;
		$scope.chipIndicador = [];
		$scope.filtros = {};
    	$scope.filtros.activo = false;
		$scope.verInfo = false;
		//aplicar los filtros al area del grafico
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
				
			}
			$scope.contador = 0;
			$scope.intento = 0;
			$scope.init();							
		};
		$scope.contador = 0;
		
		//quitar los filtros seleccionados del dialog
		$scope.quitarFiltro = function(avanzado)
		{
			$scope.filtro.indicador = [];
			$scope.filtro.clues = [];
			$scope.filtro.um = {};
			$scope.filtro.verTodosIndicadores = true;
			$scope.filtro.verTodosUM = true;
			$scope.filtros.activo=false;
			
			$scope.intento = 0;
			$scope.contador = 0;
			$scope.init();
			$mdSidenav('alerta').close();
		};
		
		// cerrar el dialog
		$scope.hide = function() {
			$mdDialog.hide();
		};
		//cambiar a pantalla completa
		$scope.isFullscreen = false;	
		$scope.tieneTamano = false;
		$scope.toggleFullScreen = function(e) 
		{
			$scope.isFullscreen = !$scope.isFullscreen;	
			$scope.tieneTamano = !$scope.tieneTamano;
			if($scope.tieneTamano)
			{	
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chart")).attr("width") : $scope.tamano;				
			} 						 		 
		}		
		$scope.cargarFiltro = 0;				
		$scope.toggleRightOpciones = function(navID) {
			$scope.catVisible = true;		
			$mdSidenav(navID)
			.toggle()
			.then(function () {
				if($scope.cargarFiltro < 1)
				{
					$scope.getDimension('anio',0);
					$scope.getDimension('month',1);	
					$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
					$scope.getDimension('jurisdiccion',3);
					$scope.getDimension('municipio',4);
					$scope.getDimension('zona',5);	
					$scope.getDimension('cone',6);
					$scope.cargarFiltro++;
				}
			});					
		};
		$scope.contAnio = 0;
		$scope.cambiarAnio = function()
		{
			$scope.contAnio++;
			if($scope.contAnio>1)
			{
				$scope.getDimension('month',1);	
				$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
				$scope.getDimension('jurisdiccion',3);
				$scope.getDimension('municipio',4);
				$scope.getDimension('zona',5);	
				$scope.getDimension('cone',6);
			}
		}
		$scope.cambiarBimestre = function()
		{
			$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
			$scope.getDimension('jurisdiccion',3);
			$scope.getDimension('municipio',4);
			$scope.getDimension('zona',5);	
			$scope.getDimension('cone',6);
		}
		$scope.cambiarCategoria = function()
		{
			$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);
		}
		$scope.$watch(function(){
       		return $window.innerWidth;
		}, 
		function(value) {
			if(!$scope.isFullscreen)
			{
				$scope.tamano = 0;
				$scope.tieneTamano = false;
			}
   		});
   
		$scope.intentoOpcion = 0;
		$scope.getDimension = function(nivel,c)
		{
			$scope.opcion = true;
			var url="calidadDimension";
			if($scope.filtro.tipo=="Recurso")
				url="recursoDimension";
			
			CrudDataApi.lista(url+'?filtro='+JSON.stringify($scope.filtro)+'&nivel='+nivel, function (data) { 				  
				$scope.datos[c] = data.data; 
				$scope.opcion = false;				
			},function (e) {
				if($scope.intentoOpcion<1)
				{
					$scope.getDimension(nivel,c);
					$scope.intentoOpcion++;
				}
				$scope.opcion = false;
			});							
		};				
					
		// obtiene los datos necesarios para crear el grid (listado)
		$scope.intento = 0;
		$scope.init = function() 
		{
			var url='alertaDash';
				
			$scope.alerta=true;
			CrudDataApi.lista(url+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";
	
				if(data.status==200)
				{									
					$scope.dato  = data.data; 					
					$scope.total = data.total;
					$scope.alerta=false;
				}
				else
				{
					$scope.alerta=false;
					errorFlash.error(data);
				}
				$scope.alerta = false;
			},function (e) {
				if($scope.intento<1)
				{
					$scope.init();
					$scope.intento++;
				}
				$scope.alerta = false;
			});
		};
		$scope.init();
	})
	
	
	
	.controller('globalRecursoController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, $mdUtil, $mdSidenav, $translate,CrudDataApi ) {
		
		$scope.globalRecurso= true;
	
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verGlobalRecurso="";
		$scope.dimension = [];
		
		$scope.tempIndicador = [];
		$scope.toggle = function (item, list) {
			var idx = list.indexOf(item);
			if (idx > -1) 
				list.splice(idx, 1);
			else 
			{
				list.push(item);
			}
		};
		//lenar los check box tipo array
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
		
		$scope.cambiarVerTodoClues = function ()
		{			
			$scope.filtro.clues = [];			
		}
			
		$scope.showAlert = function(ev) {
			$mdDialog.show(
			$mdDialog.alert()
				.parent(angular.element(document.getElementById('globalRecurso')))
				.title($translate.instant('TITULO_DIALOG'))
				.content($translate.instant('MENSAJE_DIALOG'))
				.ariaLabel('info')
				.ok('Ok')
				.targetEvent(ev)
			);
		};
  	
		var d = new Date();
		$scope.opcion = true;
		$scope.catVisible = false;
		$scope.tamano = 0;
		$scope.filtro = {};
		$scope.filtro.top = 5;
		$scope.mostrarTop = [];
		$scope.mostrarTop["TOP_MAS"] = true;
		$scope.mostrarTop["TOP_MENOS"] = true;
		$scope.filtro.tipo = "Recurso";
		$scope.filtro.visualizar = 'tiempo';
		$scope.filtro.anio = d.getFullYear();
		$scope.filtro.um = {};
		$scope.filtro.um.tipo='municipio';		
		$scope.filtro.clues = [];
		$scope.mostrarCategoria=[];
		$scope.filtro.verTodosIndicadores = true;
		$scope.filtro.verTodosUM = true;
		$scope.filtro.verTodosClues = true;
		$scope.chipIndicador = [];
		$scope.filtros = {};
    	$scope.filtros.activo = false;
		$scope.verInfo = false;
		
		$scope.valorMostrarTop = 1;
		$scope.cambiarVistaTop = function(valor)
		{console.log($scope.valorMostrarTop);
			if(valor==1)
			{
				$scope.mostrarTop["TOP_MAS"] = true;
				$scope.mostrarTop["TOP_MENOS"] = false;
			}
			if(valor==2)
			{
				$scope.mostrarTop["TOP_MAS"] = false;
				$scope.mostrarTop["TOP_MENOS"] = true;
			}
			if(valor==0)
			{
				$scope.mostrarTop["TOP_MAS"] = true;
				$scope.mostrarTop["TOP_MENOS"] = true;
			}
		};
		//aplicar los filtros al area del grafico
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
				
			}
			$scope.contador = 0;
			$scope.intento = 0;
			$scope.init();
			$mdSidenav('globalRecurso').close();
			if($scope.filtro.visualizar == 'parametro' & $scope.filtro.um.nivel == 'clues')
			{
				$scope.verInfo = true;
				$scope.showAlert();
			} 							
		};
		$scope.contador = 0;
		
		//quitar los filtros seleccionados del dialog
		$scope.quitarFiltro = function(avanzado)
		{
			$scope.filtro.indicador = [];
			$scope.filtro.clues = [];
			$scope.filtro.um = {};
			$scope.filtro.verTodosIndicadores = true;
			$scope.filtro.verTodosUM = true;
			$scope.filtros.activo=false;
			
			$scope.intento = 0;
			$scope.contador = 0;
			$scope.init();
			$mdSidenav('globalRecurso').close();
		};
		
		// cerrar el dialog
		$scope.hide = function() {
			$mdDialog.hide();
		};
		//cambiar a pantalla completa
		$scope.isFullscreen = false;	
		$scope.tieneTamano = false;
		$scope.toggleFullScreen = function(e) 
		{
			$scope.isFullscreen = !$scope.isFullscreen;	
			$scope.tieneTamano = !$scope.tieneTamano;
			if($scope.tieneTamano)
			{	
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chart")).attr("width") : $scope.tamano;				
			} 						 		 
		}		
		$scope.cargarFiltro = 0;				
		$scope.toggleRightOpciones = function(navID) {
			$scope.catVisible = false;		
			$mdSidenav(navID)
			.toggle()
			.then(function () {
				if($scope.cargarFiltro < 1)
				{
					$scope.getDimension('anio',0);
					$scope.getDimension('month',1);	
					$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
					$scope.getDimension('jurisdiccion',3);
					$scope.getDimension('municipio',4);
					$scope.getDimension('zona',5);	
					$scope.getDimension('cone',6);
					$scope.cargarFiltro++;
				}
			});					
		};
		$scope.contAnio = 0;
		$scope.cambiarAnio = function()
		{
			$scope.contAnio++;
			if($scope.contAnio>1)
			{
				$scope.getDimension('month',1);	
				$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
				$scope.getDimension('jurisdiccion',3);
				$scope.getDimension('municipio',4);
				$scope.getDimension('zona',5);	
				$scope.getDimension('cone',6);
			}
		}
		$scope.cambiarBimestre = function()
		{
			$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
			$scope.getDimension('jurisdiccion',3);
			$scope.getDimension('municipio',4);
			$scope.getDimension('zona',5);	
			$scope.getDimension('cone',6);
		}
		$scope.cambiarCategoria = function()
		{
			$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);
		}
		$scope.$watch(function(){
       		return $window.innerWidth;
		}, 
		function(value) {
			if(!$scope.isFullscreen)
			{
				$scope.tamano = 0;
				$scope.tieneTamano = false;
			}
   		});
   
		$scope.intentoOpcion = 0;
		$scope.getDimension = function(nivel,c)
		{
			$scope.opcion = true;
			var	url="recursoDimension";
			
			CrudDataApi.lista(url+'?filtro='+JSON.stringify($scope.filtro)+'&nivel='+nivel, function (data) { 				  
				$scope.datos[c] = data.data; 
				$scope.opcion = false;				
			},function (e) {
				if($scope.intentoOpcion<1)
				{
					$scope.getDimension(nivel,c);
					$scope.intentoOpcion++;
				}
				$scope.opcion = false;
			});							
		};				
					
		// obtiene los datos necesarios para crear el grid (listado)
		$scope.intento = 0;
		$scope.init = function() 
		{
			var url='TopRecursoGlobal';
				
			$scope.globalRecurso=true;
			CrudDataApi.lista(url+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";
	
				if(data.status==200)
				{	
					$scope.indicadores  = data.indicadores;								
					$scope.dato  = data.data; 					
					$scope.total = data.total;
					$scope.globalRecurso=false;
				}
				else
				{
					$scope.globalRecurso=false;
					errorFlash.error(data);
				}
				$scope.globalRecurso = false;
			},function (e) {
				if($scope.intento<1)
				{
					$scope.init();
					$scope.intento++;
				}
				$scope.globalRecurso = false;
			});
		};
		$scope.init();
	})
	
	
	.controller('globalCalidadController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, $mdUtil, $mdSidenav, $translate,CrudDataApi ) {
		
		$scope.globalCalidad= true;
	
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verGlobalCalidad="";
		$scope.dimension = [];
		
		$scope.tempIndicador = [];
		$scope.toggle = function (item, list) {
			var idx = list.indexOf(item);
			if (idx > -1) 
				list.splice(idx, 1);
			else 
			{
				list.push(item);
			}
		};
		//lenar los check box tipo array
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
		
		$scope.cambiarVerTodoClues = function ()
		{			
			$scope.filtro.clues = [];			
		}
			
		$scope.showAlert = function(ev) {
			$mdDialog.show(
			$mdDialog.alert()
				.parent(angular.element(document.getElementById('globalCalidad')))
				.title($translate.instant('TITULO_DIALOG'))
				.content($translate.instant('MENSAJE_DIALOG'))
				.ariaLabel('info')
				.ok('Ok')
				.targetEvent(ev)
			);
		};
  	
		var d = new Date();
		$scope.opcion = true;
		$scope.catVisible = false;
		$scope.tamano = 0;
		$scope.filtro = {};
		$scope.filtro.top = 5;
		$scope.mostrarTop = [];
		$scope.mostrarTop["TOP_MAS"] = true;
		$scope.mostrarTop["TOP_MENOS"] = true;
		$scope.filtro.tipo = "Calidad";
		$scope.filtro.visualizar = 'tiempo';
		$scope.filtro.anio = d.getFullYear();
		$scope.filtro.um = {};
		$scope.filtro.um.tipo='municipio';		
		$scope.filtro.clues = [];
		$scope.mostrarCategoria=[];
		$scope.filtro.verTodosIndicadores = true;
		$scope.filtro.verTodosUM = true;
		$scope.filtro.verTodosClues = true;
		$scope.chipIndicador = [];
		$scope.filtros = {};
    	$scope.filtros.activo = false;
		$scope.verInfo = false;
		
		$scope.valorMostrarTop = 1;
		$scope.cambiarVistaTop = function(valor)
		{console.log($scope.valorMostrarTop);
			if(valor==1)
			{
				$scope.mostrarTop["TOP_MAS"] = true;
				$scope.mostrarTop["TOP_MENOS"] = false;
			}
			if(valor==2)
			{
				$scope.mostrarTop["TOP_MAS"] = false;
				$scope.mostrarTop["TOP_MENOS"] = true;
			}
			if(valor==0)
			{
				$scope.mostrarTop["TOP_MAS"] = true;
				$scope.mostrarTop["TOP_MENOS"] = true;
			}
		};
		//aplicar los filtros al area del grafico
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
				
			}
			$scope.contador = 0;
			$scope.intento = 0;
			$scope.init();
			$mdSidenav('globalCalidad').close();
			if($scope.filtro.visualizar == 'parametro' & $scope.filtro.um.nivel == 'clues')
			{
				$scope.verInfo = true;
				$scope.showAlert();
			} 							
		};
		$scope.contador = 0;
		
		//quitar los filtros seleccionados del dialog
		$scope.quitarFiltro = function(avanzado)
		{
			$scope.filtro.indicador = [];
			$scope.filtro.clues = [];
			$scope.filtro.um = {};
			$scope.filtro.verTodosIndicadores = true;
			$scope.filtro.verTodosUM = true;
			$scope.filtros.activo=false;
			
			$scope.intento = 0;
			$scope.contador = 0;
			$scope.init();
			$mdSidenav('globalCalidad').close();
		};
		
		// cerrar el dialog
		$scope.hide = function() {
			$mdDialog.hide();
		};
		//cambiar a pantalla completa
		$scope.isFullscreen = false;	
		$scope.tieneTamano = false;
		$scope.toggleFullScreen = function(e) 
		{
			$scope.isFullscreen = !$scope.isFullscreen;	
			$scope.tieneTamano = !$scope.tieneTamano;
			if($scope.tieneTamano)
			{	
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chart")).attr("width") : $scope.tamano;				
			} 						 		 
		}		
		$scope.cargarFiltro = 0;				
		$scope.toggleRightOpciones = function(navID) {
			$scope.catVisible = false;		
			$mdSidenav(navID)
			.toggle()
			.then(function () {
				if($scope.cargarFiltro < 1)
				{
					$scope.getDimension('anio',0);
					$scope.getDimension('month',1);	
					$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
					$scope.getDimension('jurisdiccion',3);
					$scope.getDimension('municipio',4);
					$scope.getDimension('zona',5);	
					$scope.getDimension('cone',6);
					$scope.cargarFiltro++;
				}
			});					
		};
		$scope.contAnio = 0;
		$scope.cambiarAnio = function()
		{
			$scope.contAnio++;
			if($scope.contAnio>1)
			{
				$scope.getDimension('month',1);	
				$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
				$scope.getDimension('jurisdiccion',3);
				$scope.getDimension('municipio',4);
				$scope.getDimension('zona',5);	
				$scope.getDimension('cone',6);
			}
		}
		$scope.cambiarBimestre = function()
		{
			$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
			$scope.getDimension('jurisdiccion',3);
			$scope.getDimension('municipio',4);
			$scope.getDimension('zona',5);	
			$scope.getDimension('cone',6);
		}
		$scope.cambiarCategoria = function()
		{
			$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);
		}
		$scope.$watch(function(){
       		return $window.innerWidth;
		}, 
		function(value) {
			if(!$scope.isFullscreen)
			{
				$scope.tamano = 0;
				$scope.tieneTamano = false;
			}
   		});
   
		$scope.intentoOpcion = 0;
		$scope.getDimension = function(nivel,c)
		{
			$scope.opcion = true;
			var	url="calidadDimension";
			
			CrudDataApi.lista(url+'?filtro='+JSON.stringify($scope.filtro)+'&nivel='+nivel, function (data) { 				  
				$scope.datos[c] = data.data; 
				$scope.opcion = false;				
			},function (e) {
				if($scope.intentoOpcion<1)
				{
					$scope.getDimension(nivel,c);
					$scope.intentoOpcion++;
				}
				$scope.opcion = false;
			});							
		};				
					
		// obtiene los datos necesarios para crear el grid (listado)
		$scope.intento = 0;
		$scope.init = function() 
		{
			var url='TopCalidadGlobal';
				
			$scope.globalCalidad=true;
			CrudDataApi.lista(url+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";
	
				if(data.status==200)
				{	
					$scope.indicadores  = data.indicadores;								
					$scope.dato  = data.data; 					
					$scope.total = data.total;
					$scope.globalCalidad=false;
				}
				else
				{
					$scope.globalCalidad=false;
					errorFlash.error(data);
				}
				$scope.globalCalidad = false;
			},function (e) {
				if($scope.intento<1)
				{
					$scope.init();
					$scope.intento++;
				}
				$scope.globalCalidad = false;
			});
		};
		$scope.init();
	})
	
	.controller('gaugeRecursoController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, $mdUtil, $mdSidenav, $translate,CrudDataApi ) {
		
		$scope.gaugeRecurso = true;
	
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verGaugeRecurso="";
		$scope.dimension = [];
		
		$scope.tempIndicador = [];
		$scope.toggle = function (item, list) {
			var idx = list.indexOf(item);
			if (idx > -1) 
				list.splice(idx, 1);
			else 
			{
				list.push(item);
			}
		};
		//lenar los check box tipo array
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
		
		$scope.cambiarVerTodoClues = function ()
		{			
			$scope.filtro.clues = [];			
		}
  	
		var d = new Date();
		$scope.opcion = true;
		$scope.tamano = 0;
		$scope.filtro = {};
		$scope.filtro.tipo = "Recurso";
		$scope.filtro.visualizar = 'tiempo';
		$scope.filtro.anio = d.getFullYear();
		$scope.filtro.um = {};
		$scope.filtro.um.tipo='municipio';		
		$scope.filtro.clues = [];
		$scope.mostrarCategoria=[];
		$scope.filtro.verTodosIndicadores = true;
		$scope.filtro.verTodosUM = true;
		$scope.filtro.verTodosClues = true;
		$scope.chipIndicador = [];
		$scope.filtros = {};
    	$scope.filtros.activo = false;
		$scope.verInfo = false;
		//aplicar los filtros al area del grafico
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
				
			}
			$scope.contador = 0;
			$scope.intento = 0;
			$scope.init();
										
		};
		$scope.contador = 0;
		
		//quitar los filtros seleccionados del dialog
		$scope.quitarFiltro = function(avanzado)
		{
			$scope.filtro.indicador = [];
			$scope.filtro.clues = [];
			$scope.filtro.um = {};
			$scope.filtro.verTodosIndicadores = true;
			$scope.filtro.verTodosUM = true;
			$scope.filtros.activo=false;
			
			$scope.intento = 0;
			$scope.contador = 0;
			$scope.init();
			$mdSidenav('gaugeRecurso').close();
		};
		
		// cerrar el dialog
		$scope.hide = function() {
			$mdDialog.hide();
		};
		//cambiar a pantalla completa
		$scope.isFullscreen = false;	
		$scope.tieneTamano = false;
		$scope.toggleFullScreen = function(e) 
		{
			$scope.isFullscreen = !$scope.isFullscreen;	
			$scope.tieneTamano = !$scope.tieneTamano;
			if($scope.tieneTamano)
			{	
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chart")).attr("width") : $scope.tamano;				
			} 						 		 
		}		
		$scope.cargarFiltro = 0;				
		$scope.toggleRightOpciones = function(navID) {
			$scope.catVisible = false;		
			$mdSidenav(navID)
			.toggle()
			.then(function () {
				if($scope.cargarFiltro < 1)
				{
					$scope.getDimension('anio',0);
					$scope.getDimension('month',1);	
					$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
					$scope.getDimension('jurisdiccion',3);
					$scope.getDimension('municipio',4);
					$scope.getDimension('zona',5);	
					$scope.getDimension('cone',6);
					$scope.cargarFiltro++;
				}
			});					
		};
		$scope.contAnio = 0;
		$scope.cambiarAnio = function()
		{
			$scope.contAnio++;
			if($scope.contAnio>1)
			{
				$scope.getDimension('month',1);	
				$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
				$scope.getDimension('jurisdiccion',3);
				$scope.getDimension('municipio',4);
				$scope.getDimension('zona',5);	
				$scope.getDimension('cone',6);
			}
		}
		$scope.cambiarBimestre = function()
		{
			$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
			$scope.getDimension('jurisdiccion',3);
			$scope.getDimension('municipio',4);
			$scope.getDimension('zona',5);	
			$scope.getDimension('cone',6);
		}
		$scope.$watch(function(){
       		return document.getElementById("gaugeRecurso").offsetHeight;
		}, 
		function(value) {
			$scope.tamano = value - 50;
   		});
   	    $scope.tamano = document.getElementById("gaugeRecurso").offsetHeight-50;
   
		$scope.intentoOpcion = 0;
		$scope.getDimension = function(nivel,c)
		{
			var url="recursoDimension";
			
			CrudDataApi.lista(url+'?filtro='+JSON.stringify($scope.filtro)+'&nivel='+nivel, function (data) { 				  
				$scope.datos[c] = data.data; 
				$scope.opcion = false;				
			},function (e) {
				if($scope.intentoOpcion<1)
				{
					$scope.getDimension(nivel,c);
					$scope.intentoOpcion++;
				}
				$scope.opcion = false;
			});							
		};				
					
		// obtiene los datos necesarios para crear el grid (listado)
		$scope.intento = 0;
		$scope.init = function() 
		{
			var url='hallazgoGauge';
				
			$scope.gaugeRecurso=true;
			CrudDataApi.lista(url+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";
	
				if(data.status==200)
				{												
					$scope.value = data.valor;
					$scope.indicadores = data.indicadores;
					$scope.upperLimit = data.total;
					$scope.lowerLimit = 0;
					$scope.unit = "";
					$scope.precision = 1;
					$scope.ranges = data.rangos;
	
					$scope.dato = data.data;
					$scope.gaugeRecurso=false;
				}
				else
				{
					$scope.gaugeRecurso=false;
					errorFlash.error(data);
				}
				$scope.gaugeRecurso = false;
			},function (e) {
				if($scope.intento<1)
				{
					$scope.init();
					$scope.intento++;
				}
				$scope.gaugeRecurso = false;
			});
		};
		$scope.init();
	})
	
	.controller('gaugeCalidadController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, $mdUtil, $mdSidenav, $translate,CrudDataApi ) {
		
		$scope.gaugeCalidad = true;
	
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verGaugeCalidad="";
		$scope.dimension = [];
		
		$scope.tempIndicador = [];
		$scope.toggle = function (item, list) {
			var idx = list.indexOf(item);
			if (idx > -1) 
				list.splice(idx, 1);
			else 
			{
				list.push(item);
			}
		};
		//lenar los check box tipo array
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
		
		$scope.cambiarVerTodoClues = function ()
		{			
			$scope.filtro.clues = [];			
		}
  	
		var d = new Date();
		$scope.opcion = true;
		$scope.tamano = 0;
		$scope.filtro = {};
		$scope.filtro.tipo = "Calidad";
		$scope.filtro.visualizar = 'tiempo';
		$scope.filtro.anio = d.getFullYear();
		$scope.filtro.um = {};
		$scope.filtro.um.tipo='municipio';		
		$scope.filtro.clues = [];
		$scope.mostrarCategoria=[];
		$scope.filtro.verTodosIndicadores = true;
		$scope.filtro.verTodosUM = true;
		$scope.filtro.verTodosClues = true;
		$scope.chipIndicador = [];
		$scope.filtros = {};
    	$scope.filtros.activo = false;
		$scope.verInfo = false;
		//aplicar los filtros al area del grafico
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
				
			}
			$scope.contador = 0;
			$scope.intento = 0;
			$scope.init();						
		};
		$scope.contador = 0;
		
		//quitar los filtros seleccionados del dialog
		$scope.quitarFiltro = function(avanzado)
		{
			$scope.filtro.indicador = [];
			$scope.filtro.clues = [];
			$scope.filtro.um = {};
			$scope.filtro.verTodosIndicadores = true;
			$scope.filtro.verTodosUM = true;
			$scope.filtros.activo=false;
			
			$scope.intento = 0;
			$scope.contador = 0;
			$scope.init();
			$mdSidenav('gaugeCalidad').close();
		};
		
		// cerrar el dialog
		$scope.hide = function() {
			$mdDialog.hide();
		};
		//cambiar a pantalla completa
		$scope.isFullscreen = false;	
		$scope.tieneTamano = false;
		$scope.toggleFullScreen = function(e) 
		{
			$scope.isFullscreen = !$scope.isFullscreen;	
			$scope.tieneTamano = !$scope.tieneTamano;
			if($scope.tieneTamano)
			{	
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chart")).attr("width") : $scope.tamano;				
			} 						 		 
		}		
		$scope.cargarFiltro = 0;				
		$scope.toggleRightOpciones = function(navID) {
			$scope.catVisible = false;		
			$mdSidenav(navID)
			.toggle()
			.then(function () {
				if($scope.cargarFiltro < 1)
				{
					$scope.getDimension('anio',0);
					$scope.getDimension('month',1);	
					$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
					$scope.getDimension('jurisdiccion',3);
					$scope.getDimension('municipio',4);
					$scope.getDimension('zona',5);	
					$scope.getDimension('cone',6);
					$scope.cargarFiltro++;
				}
			});					
		};
		$scope.contAnio = 0;
		$scope.cambiarAnio = function()
		{
			$scope.contAnio++;
			if($scope.contAnio>1)
			{
				$scope.getDimension('month',1);	
				$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
				$scope.getDimension('jurisdiccion',3);
				$scope.getDimension('municipio',4);
				$scope.getDimension('zona',5);	
				$scope.getDimension('cone',6);
			}
		}
		$scope.cambiarBimestre = function()
		{
			$scope.getDimension("codigo,indicador,color, '"+$scope.filtro.tipo+"' as categoriaEvaluacion",2);	
			$scope.getDimension('jurisdiccion',3);
			$scope.getDimension('municipio',4);
			$scope.getDimension('zona',5);	
			$scope.getDimension('cone',6);
		}
		$scope.$watch(function(){
       		return document.getElementById("gaugeCalidad").offsetHeight;
		}, 
		function(value) {
			$scope.tamano = value - 50;
   		});
   	    $scope.tamano = document.getElementById("gaugeCalidad").offsetHeight-50;
		$scope.intentoOpcion = 0;
		$scope.getDimension = function(nivel,c)
		{
			$scope.opcion = true;
			var url="calidadDimension";			
			
			CrudDataApi.lista(url+'?filtro='+JSON.stringify($scope.filtro)+'&nivel='+nivel, function (data) { 				  
				$scope.datos[c] = data.data; 
				$scope.opcion = false;				
			},function (e) {
				if($scope.intentoOpcion<1)
				{
					$scope.getDimension(nivel,c);
					$scope.intentoOpcion++;
				}
				$scope.opcion = false;
			});							
		};				
					
		// obtiene los datos necesarios para crear el grid (listado)
		$scope.intento = 0;
		$scope.init = function() 
		{
			var url='hallazgoGauge';
				
			$scope.gaugeCalidad=true;
			CrudDataApi.lista(url+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";
	
				if(data.status==200)
				{												
					$scope.value = data.valor;
					$scope.indicadores = data.indicadores;
					$scope.upperLimit = data.total;
					$scope.lowerLimit = 0;
					$scope.unit = "";
					$scope.precision = 1;
					$scope.ranges = data.rangos;
	
					$scope.dato = data.data;
					$scope.gaugeCalidad=false;
				}
				else
				{
					$scope.gaugeCalidad=false;
					errorFlash.error(data);
				}
				$scope.gaugeCalidad = false;
			},function (e) {
				if($scope.intento<1)
				{
					$scope.init();
					$scope.intento++;
				}
				$scope.gaugeCalidad = false;
			});
		};
		$scope.init();
	})
	
	function DialogRecurso($scope, $mdDialog, EvaluacionShow, EvaluacionId, errorFlash, listaOpcion) {
		$scope.imprimirDetalle = true;	
		$scope.acciones=[];
		$scope.hallazgos = {};	
		listaOpcion.options('Accion').success(function(data)
		{
			$scope.acciones=data.data;			
		});
	
		$scope.plazos=[];
		listaOpcion.options('PlazoAccion').success(function(data)
		{
			$scope.plazos=data.data;
		});
		var id = EvaluacionId.getId();
		EvaluacionShow.ver('EvaluacionRecurso', id, function (data) {
          if(data.status  == '407')
            $window.location="acceso";

          if(data.status==200)
          {
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
        }); 

        EvaluacionShow.ver('EvaluacionRecursoCriterio', id, function (data) {
          	if(data.status  == '407')
            	$window.location="acceso";
			
          	if(data.status==200)
			{						
				$scope.indicadores = data.data;		
				$scope.estadistica = data.estadistica;		
			}
			else
			{
				flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" + data.messages);
			}
          	$scope.cargando = false;
        },function (e) {
            errorFlash.error(e);
            $scope.cargando = false;
        }); 

  		$scope.hide = function() {
    	$mdDialog.hide();
  	};
  }

  	function DialogCalidad($scope, $mdDialog, EvaluacionShow, EvaluacionId, errorFlash, listaOpcion) {

		$scope.acciones=[];
		$scope.hallazgos = {};	
		$scope.imprimirDetalle = true;	
		listaOpcion.options('Accion').success(function(data)
		{
			$scope.acciones=data.data;			
		});
	
		$scope.plazos=[];
		listaOpcion.options('PlazoAccion').success(function(data)
		{
			$scope.plazos=data.data;
		});
	
		var id = EvaluacionId.getId();
		EvaluacionShow.ver('EvaluacionCalidad', id, function (data) {
          if(data.status  == '407')
            $window.location="acceso";

          if(data.status==200)
          {
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
        }); 

        EvaluacionShow.ver('EvaluacionCalidadCriterio', id, function (data) {
          	if(data.status  == '407')
            	$window.location="acceso";

          	if(data.status==200)
			{
				$scope.total = 	data.total;					
				$scope.criterios = data.data.criterios;
				$scope.marcados = data.data.datos; 
				$scope.columnas = {}; $scope.indicadorColumna = [];
				$scope.hallazgos = data.hallazgos;	
				$scope.indicadores = [];
				
				angular.forEach(data.data.indicadores , function(val, key) 
				{
					$scope.indicadores.push(val);
					$scope.indicadorColumna[val.codigo]=[];
					var c=0;
					angular.forEach(val.columnas , function(v, k) 
					{
						$scope.columnas[v.expediente] = v.expediente;
						$scope.indicadorColumna[val.codigo][c]=v;
						c++;
					});
					
				});		
				$scope.cargando = false;		
			}
			else
			{
				$scope.cargando = false;
				flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" + data.messages);
			}	
          $scope.cargando = false;
        },function (e) {
            errorFlash.error(e);
            $scope.cargando = false;
        }); 

  		$scope.hide = function() {
    	$mdDialog.hide();
  	};  
}
})();