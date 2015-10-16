/**
* @ngdoc object
* @name Dashboard.DashboardCtrl
* @description
* Manejo de los eventos del gráfico en el dashboard
*/
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

	// inicializa el modulo ruta y url se le asigna el valor de la página actual
	$scope.ruta="";
    $scope.url=$location.url();


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
	$scope.tamano =  $window.innerHeight-70;
	$scope.$watch(function(){
       		return $window.innerHeight;
		}, 
		function(value) {	
			$scope.tamano = value-70;
   		});	
		
	}])
	
	.controller('recursoController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, $mdUtil, $mdSidenav, $translate, EvaluacionId,CrudDataApi ) {
		
		$scope.recurso = true;
	
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verRecurso="";
		$scope.dimension = [];
		$scope.despegarInfo = true;
		$scope.datosOk = true;
		$scope.datosOk = true;
		$scope.abrirSelect = function()
		{
			angular.element(document.getElementById("principal")).attr("class","sin-scroll");
		}
/**
* @ngdoc method
* @name Dashboard.DashboardCtrl#toggle
* @methodOf Dashboard.DashboardCtrl
*
* @description
* Agrega un dato a un modelo tipo array
* @param {string} item valor a insertar
* @param {model} list modelo 
*/			
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
/**
* @ngdoc method
* @name Dashboard.DashboardCtrl#exists
* @methodOf Dashboard.DashboardCtrl
*
* @description
* Comrpueba que el item no exista en el modelo
* @param {string} item valor a insertar
* @param {model} list modelo 
*/	
		$scope.exists = function (item, list) {
			return list.indexOf(item) > -1;
		};
/**
* @ngdoc method
* @name Dashboard.DashboardCtrl#cambiarVerTodoIndicador
* @methodOf Dashboard.DashboardCtrl
*
* @description
* Mostrar u ocultar la lista de indicadores agrupado por categoria
*/			
		$scope.cambiarVerTodoIndicador = function ()
		{
			if($scope.filtro.verTodosIndicadores)
			{
				$scope.filtro.indicador = [];
				$scope.chipIndicador = [];
				$scope.tempIndicador = [];
			}
		}
/**
* @ngdoc method
* @name Dashboard.DashboardCtrl#cambiarVerTodoUM
* @methodOf Dashboard.DashboardCtrl
*
* @description
* Mostrar u ocultar las opciones de filtrado por parametros
*/			
		$scope.cambiarVerTodoUM = function ()
		{
			if($scope.filtro.verTodosUM)
				$scope.filtro.um = [];
		}
/**
* @ngdoc method
* @name Dashboard.DashboardCtrl#cambiarVerTodoUM
* @methodOf Dashboard.DashboardCtrl
*
* @description
* Mostrar u ocultar las opciones de filtrado por clues
*/			
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
/**
* @ngdoc method
* @name Dashboard.DashboardCtrl#aplicarFiltro
* @methodOf Dashboard.DashboardCtrl
*
* @description
* Accion para procesar el filtro en la base de datos
* @param {bool} avanzado compprueba si el filtro es avanzado o de la lista de indicadores activos
* @param {string} item compsolo tiene un datorueba si indicadores es un array o  
*/			
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
/**
* @ngdoc method
* @name Dashboard.DashboardCtrl#quitarFiltro
* @methodOf Dashboard.DashboardCtrl
*
* @description
* Accion para quitar el filtro en la base de datos
* @param {bool} avanzado compprueba si el filtro es avanzado o de la lista de indicadores activos 
*/
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
		

		$scope.hide = function() {
			$mdDialog.hide();
		};
/**
* @ngdoc method
* @name Dashboard.DashboardCtrl#quitarFiltro
* @methodOf Dashboard.DashboardCtrl
*
* @description
* Accion para poner en modo fullscreen el área del gráfico
* @param {string} e área para hacer el fullscreen
*/
		$scope.isFullscreen = false;	
		$scope.tieneTamano = false;
		$scope.toggleFullScreen = function(e) 
		{
			$scope.isFullscreen = !$scope.isFullscreen;	
			$scope.tieneTamano = !$scope.tieneTamano;
			if($scope.tieneTamano)
			{	
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chartChart")).attr("width") : $scope.tamano;				
			} 						 		 
		}	
/**
* @ngdoc method
* @name Dashboard.DashboardCtrl#buildToggler
* @methodOf Dashboard.DashboardCtrl
*
* @description
* Crea un sidenav con las opciones de filtrado
* @param {string} navID identificador del sidenav
*/					
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
/**
* @ngdoc method
* @name Dashboard.DashboardCtrl#cambiarAnio
* @methodOf Dashboard.DashboardCtrl
*
* @description
* Evento change para el filtro año
*/			
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
/**
* @ngdoc method
* @name Dashboard.DashboardCtrl#cambiarBimestre
* @methodOf Dashboard.DashboardCtrl
*
* @description
* Evento change para el filtro bimestre
*/			
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
			if(($window.outerWidth - value) >= 0)
			{
				var tama = (value - ($window.outerWidth - value))/2.8;
				
				if(value>1200)					
					angular.element(document.getElementById("recurso")).attr("style","width:"+tama+"px");
				else	
					angular.element(document.getElementById("recurso")).attr("style","");
				
				var temp = $scope.data;
				$scope.data = null;
				setTimeout(function()
				{
					$scope.data = temp;
				},20);							
			}
   		});
/**
* @ngdoc method
* @name Dashboard.DashboardCtrl#getDimension
* @methodOf Dashboard.DashboardCtrl
*
* @description
* Cargar las opciones de filtrado por nivel
* @param {string} nivel nivel a extraer de la base de datos
* @param {int} c posicion para almacenar la información en el modelo datos
*/	   
		$scope.intentoOpcion = 0;
		$scope.selectedIndex = 2;
		$scope.getDimension = function(nivel,c)
		{
			$scope.opcion = true;
			if(c==7)
			{
				$scope.selectedIndex = 3;
			}
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
/**
* @ngdoc method
* @name Dashboard.DashboardCtrl#getDimension
* @methodOf Dashboard.DashboardCtrl
*
* @description
* obtiene los datos necesarios para crear el gráfico
*/						
		$scope.intento = 0;
		$scope.init = function() 
		{
			var url='recurso';
				
			$scope.recurso=true;
			CrudDataApi.lista(url+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";
				if(!angular.isUndefined(data.data.datasets))
				{									
					$scope.data  = data.data; 					
					$scope.total = data.total;
					$scope.recurso=false;
				}
				else
				{
					$scope.datosOk = false;
					$scope.recurso=false;
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
		$scope.quitar = true;
		$scope.quitarAlert = function()
		{
			$scope.quitar = !$scope.quitar; 
			$scope.options.barShowStroke = !$scope.quitar;
			var temp = $scope.data;
			$scope.data = null;
			setTimeout(function()
			{
				$scope.data = temp;
			},10);
			
		}
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
			barShowStroke : false,
			
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
		$scope.despegarInfo = true;
		$scope.datosOk = true;
		$scope.abrirSelect = function()
		{
			angular.element(document.getElementById("principal")).attr("class","sin-scroll");
		}
		
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
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chartChart")).attr("width") : $scope.tamano;				
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
			if(($window.outerWidth - value) >= 0)
			{
				var tama = (value - ($window.outerWidth - value))/2.8;	
				
				if(value>1200)			
					angular.element(document.getElementById("calidad")).attr("style","width:"+tama+"px");
				else	
					angular.element(document.getElementById("calidad")).attr("style","");
					
				var temp = $scope.data;
				$scope.data = null;
				setTimeout(function()
				{
					$scope.data = temp;
				},20);	
			}
   		});
   
		$scope.intentoOpcion = 0;
		$scope.selectedIndex = 2;
		$scope.getDimension = function(nivel,c)
		{
			$scope.opcion = true;
			if(c==7)
			{
				$scope.selectedIndex = 3;
			}
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
	
				if(!angular.isUndefined(data.data.datasets))
				{									
					$scope.data  = data.data; 					
					$scope.total = data.total;
					$scope.calidad=false;
				}
				else
				{
					$scope.calidad=false;
					$scope.datosOk = false;
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
		$scope.quitar = true;
		$scope.quitarAlert = function()
		{
			$scope.quitar = !$scope.quitar; 
			$scope.options.barShowStroke = !$scope.quitar;
			var temp = $scope.data;
			$scope.data = null;
			setTimeout(function()
			{
				$scope.data = temp;
			},10);
			
		}
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
			barShowStroke : false,
			
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
	
	
	.controller('pieRecursoController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, $mdUtil, $mdSidenav, $translate,CrudDataApi, $filter ) {
		
		$scope.pieRecurso = true;
	
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verpieRecurso="";
		$scope.dimension = [];
		$scope.datosOk = true;
		$scope.abrirSelect = function()
		{
			angular.element(document.getElementById("principal")).attr("class","sin-scroll");
		}
		
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
		$scope.filtro.bimestre = $filter('numeroBimestre')(d.getMonth());		
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
			$mdSidenav('pieRecurso').close();					
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
			$mdSidenav('pieRecurso').close();
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
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chartChart")).attr("width") : $scope.tamano;				
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
			if(($window.outerWidth - value) >= 0)
			{
				var tama = (value - ($window.outerWidth - value))/2.8;	
				
				if(value>1200)			
					angular.element(document.getElementById("pieRecurso")).attr("style","width:"+tama+"px");
				else	
					angular.element(document.getElementById("pieRecurso")).attr("style","");
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
				
			$scope.pieRecurso=true;
			CrudDataApi.lista(url+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";
	
				if(data.status==200)
				{									
					$scope.data  = data.data; 					
					$scope.total = data.total;
					$scope.pieRecurso=false;
				}
				else
				{
					$scope.pieRecurso=false;
					errorFlash.error(data);
				}
				$scope.pieRecurso = false;
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
	
	.controller('pieCalidadController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, $mdUtil, $mdSidenav, $translate,CrudDataApi, $filter ) {
		
		$scope.pieCalidad = true;
	
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verpieCalidad="";
		$scope.dimension = [];
		$scope.datosOk = true;
		$scope.abrirSelect = function()
		{
			angular.element(document.getElementById("principal")).attr("class","sin-scroll");
		}
		
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
		$scope.filtro.bimestre =  $filter('numeroBimestre')(d.getMonth());	
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
			$mdSidenav('pieCalidad').close();					
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
			$mdSidenav('pieCalidad').close();
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
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chartChart")).attr("width") : $scope.tamano;				
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
			if(($window.outerWidth - value) >= 0)
			{
				var tama = (value - ($window.outerWidth - value))/2.8;	
				
				if(value>1200)			
					angular.element(document.getElementById("pieCalidad")).attr("style","width:"+tama+"px");
				else	
					angular.element(document.getElementById("pieCalidad")).attr("style","");
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
				
			$scope.pieCalidad=true;
			CrudDataApi.lista(url+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";
	
				if(data.status==200)
				{									
					$scope.data  = data.data; 					
					$scope.total = data.total;
					$scope.pieCalidad=false;
				}
				else
				{
					$scope.pieCalidad=false;
					errorFlash.error(data);
				}
				$scope.pieCalidad = false;
			},function (e) {
				if($scope.intento<1)
				{
					$scope.init();
					$scope.intento++;
				}
				$scope.pieCalidad = false;
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
	
	.controller('alertaRecursoController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, $mdUtil, $mdSidenav, $translate,CrudDataApi ) {
		
		$scope.alertaRecurso = true;
	
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.veralertaRecurso="";
		$scope.dimension = [];
		$scope.datosOk = true;
		$scope.abrirSelect = function()
		{
			angular.element(document.getElementById("principal")).attr("class","sin-scroll");
		}
		
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
			$mdSidenav('alertaRecurso').close();						
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
			$mdSidenav('alertaRecurso').close();
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
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chartChart")).attr("width") : $scope.tamano;				
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
			if(($window.outerWidth - value) >= 0)
			{
				var tama = (value - ($window.outerWidth - value))/2.8;	
				
				if(value>1200)			
					angular.element(document.getElementById("alertaRecurso")).attr("style","width:"+tama+"px");
				else	
					angular.element(document.getElementById("alertaRecurso")).attr("style","");
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
				
			$scope.alertaRecurso=true;
			CrudDataApi.lista(url+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";
	
				if(data.status==200)
				{									
					$scope.dato  = data.data; 					
					$scope.total = data.total;
					$scope.alertaRecurso=false;
				}
				else
				{
					$scope.alertaRecurso=false;
					$scope.datosOk = false;
				}
				$scope.alertaRecurso = false;
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
	
	.controller('alertaCalidadController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, $mdUtil, $mdSidenav, $translate,CrudDataApi ) {
		
		$scope.alertaCalidad = true;
	
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.veralertaCalidad="";
		$scope.dimension = [];
		$scope.datosOk = true;
		$scope.abrirSelect = function()
		{
			angular.element(document.getElementById("principal")).attr("class","sin-scroll");
		}
		
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
			$mdSidenav('alertaCalidad').close();						
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
			$mdSidenav('alertaCalidad').close();
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
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chartChart")).attr("width") : $scope.tamano;				
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
			if(($window.outerWidth - value) >= 0)
			{
				var tama = (value - ($window.outerWidth - value))/2.8;	
				
				if(value>1200)			
					angular.element(document.getElementById("alertaCalidad")).attr("style","width:"+tama+"px");
				else	
					angular.element(document.getElementById("alertaCalidad")).attr("style","");
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
				
			$scope.alertaCalidad=true;
			CrudDataApi.lista(url+"?filtro="+JSON.stringify($scope.filtro), function (data) {
			if(data.status  == '407')
				$window.location="acceso";
	
				if(data.status==200)
				{									
					$scope.dato  = data.data; 					
					$scope.total = data.total;
					$scope.alertaCalidad=false;
				}
				else
				{
					$scope.alertaCalidad=false;
					$scope.datosOk = false;
				}
				$scope.alertaCalidad = false;
			},function (e) {
				if($scope.intento<1)
				{
					$scope.init();
					$scope.intento++;
				}
				$scope.alertaCalidad = false;
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
		$scope.datosOk = true;
		$scope.abrirSelect = function()
		{
			angular.element(document.getElementById("principal")).attr("class","sin-scroll");
		}
		
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
		
		$scope.valorMostrarTop = 0;
		$scope.cambiarVistaTop = function(valor)
		{
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
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chartChart")).attr("width") : $scope.tamano;				
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
			if(($window.outerWidth - value) >= 0)
			{
				var tama = (value - ($window.outerWidth - value))/2.8;	
				
				if(value>1200)			
					angular.element(document.getElementById("globalRecurso")).attr("style","width:"+tama+"px");
				else	
					angular.element(document.getElementById("globalRecurso")).attr("style","");
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
	
				if(data.data.TOP_MAS.length>0)
				{	
					$scope.indicadores  = data.indicadores;								
					$scope.dato  = data.data; 					
					$scope.total = data.total;
					$scope.globalRecurso=false;
				}
				else
				{
					$scope.globalRecurso=false;
					$scope.datosOk=false;
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
		$scope.datosOk = true;
		$scope.abrirSelect = function()
		{
			angular.element(document.getElementById("principal")).attr("class","sin-scroll");
		}
		
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
		
		$scope.valorMostrarTop = 0;
		$scope.cambiarVistaTop = function(valor)
		{
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
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chartChart")).attr("width") : $scope.tamano;				
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
			if(($window.outerWidth - value) >= 0)
			{
				var tama = (value - ($window.outerWidth - value))/2.8;	
				
				if(value>1200)			
					angular.element(document.getElementById("globalCalidad")).attr("style","width:"+tama+"px");
				else	
					angular.element(document.getElementById("globalCalidad")).attr("style","");
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
	
				if(data.data.TOP_MAS.length>0)
				{	
					$scope.indicadores  = data.indicadores;								
					$scope.dato  = data.data; 					
					$scope.total = data.total;
					$scope.globalCalidad=false;
				}
				else
				{
					$scope.globalCalidad=false;
					$scope.datosOk=false;
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
		$scope.datosOk = true;
		$scope.abrirSelect = function()
		{
			angular.element(document.getElementById("principal")).attr("class","sin-scroll");
		}
		
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
		$scope.indicadores = [];
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
			$mdSidenav('gaugeRecurso').close();										
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
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chartChart")).attr("width") : $scope.tamano;				
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
       		return document.getElementById("gaugeRecursos").offsetWidth;
		}, 
		function(value) {
			if(($window.outerWidth - value) >= 0)
			{
				var tama = (value - ($window.outerWidth - value))/2.8;	
				
				if(value>1200)			
					angular.element(document.getElementById("gaugeRecursos")).attr("style","width:"+tama+"px");
				else	
					angular.element(document.getElementById("gaugeRecursos")).attr("style","");
			}
			$scope.tamano = (value/1.7) - ($scope.indicadores.length*20);
   		});
   	    
   
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
					
					$scope.tamano = (document.getElementById("gaugeRecursos").offsetWidth/1.7) - ($scope.indicadores.length*20);
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
		$scope.datosOk = true;
		$scope.abrirSelect = function()
		{
			angular.element(document.getElementById("principal")).attr("class","sin-scroll");
		}
		
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
		$scope.indicadores = [];
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
			$mdSidenav('gaugeCalidad').close();						
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
				$scope.tamano = $scope.tamano == 0 ? angular.element(document.getElementById("chartChart")).attr("width") : $scope.tamano;				
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
       		return document.getElementById("gaugeCalidad").offsetWidth;
		}, 
		function(value) {
			if(($window.outerWidth - value) >= 0)
			{
				var tama = (value - ($window.outerWidth - value))/2.8;	
				
				if(value>1200)			
					angular.element(document.getElementById("gaugeCalidad")).attr("style","width:"+tama+"px");
				else	
					angular.element(document.getElementById("gaugeCalidad")).attr("style","");
			}
			$scope.tamano = (value/1.7) - ($scope.indicadores.length*20); 
   		});   	    
		   
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
					
					$scope.tamano = (document.getElementById("gaugeCalidad").offsetWidth/1.7) - ($scope.indicadores.length*20);
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
						$scope.indicadorColumna[val.codigo][v.expediente]=v;
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