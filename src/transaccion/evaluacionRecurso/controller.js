/**
* @ngdoc object
* @name Transaccion.RecursoCtrl
* @description
* Complemento del controlador CrudCtrl  para tareas especificas en EvaluacionRecurso
*/
(function(){
	'use strict';
	angular.module('RecursoModule')
	.controller('RecursoCtrl',
	       ['$rootScope', '$translate', '$localStorage', '$mdDialog', '$scope', '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash', 'listaOpcion', 'Criterios', 'CrudDataApi', 'URLS', 
	function($rootScope,   $translate,   $localStorage,   $mdDialog,   $scope,   $mdSidenav,  $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,   listaOpcion,   Criterios,   CrudDataApi, URLS){
	
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

    $scope.permisoModificar = $localStorage.cium.menu.indexOf("EvaluacionRecursoController.update")>=0 ? true : false;
    $scope.permisoEliminar  = $localStorage.cium.menu.indexOf("EvaluacionRecursoController.destroy")>=0 ? true : false;
    $scope.permisoVer       = $localStorage.cium.menu.indexOf("EvaluacionRecursoController.show")>=0 ? true : false;
    $scope.permisoAgregar   = $localStorage.cium.menu.indexOf("EvaluacionRecursoController.store")>=0 ? true : false;

    // cambia los textos del paginado de cada grid
    $scope.paginationLabel = {
      text: $translate.instant('ROWSPERPAGE'),
      of: $translate.instant('DE')
    };
	   
    // Inicializa el campo para busquedas disponibles para cada grid
    $scope.BuscarPor=
    [
		{id:"clues", nombre:"clues"},
		{id:'fechaEvaluacion', nombre:$translate.instant('CREADO')}
	];
	   
	// inicia configuración para los data table (grid)
    $scope.selected = [];

    // incializa el modelo para el filtro, ordenamiento y paginación
	$scope.query = {
		filter: '',
		order: '-fechaEvaluacion',
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
	$scope.imprimirDetalle = true;	
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
	
	$scope.opcionEvaluacion = function(ir,id)
	{		
		$location.path($location.path()+"/"+ir).search({id: id});
	}	
	// evento para el boton nuevo, redirecciona a la vista nuevo
	$scope.nuevo = function()
	{
	    var uri=$scope.url.split('/');

	    uri="/"+uri[1]+"/nuevo";
	    $location.path(uri).search({id: null});
	}
	$scope.tamanoHeight = $window.innerHeight-230;
	$scope.$watch(function(){
		return window.innerWidth;
	}, function(value) {
		$scope.tamanoHeight = $window.innerHeight-230;
	});
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
		
	$scope.update=false;
	
/**
* @ngdoc method
* @name Transaccion.RecursoCtrl#getClues
* @methodOf Transaccion.RecursoCtrl
*
* @description
* Obtiene las clues que le corresponden al usuario
*/	
	$scope.getClues=function()
	{
		$scope.cargando = true;
		CrudDataApi.lista('CluesUsuario', function (data) {
			if(data.status  == '407')
				$window.location="acceso";	
		
				if(data.status==200)
				{
					$scope.Clues = data.data.map( function (repo) {
						repo.value = repo.nombre.toLowerCase();
						return repo;
					});
					$scope.repos=$scope.Clues;					
				}
				else
				{
					errorFlash.error(data);
				}
				$scope.cargando = false;
				return $scope.repos;
			},function (e) {
				errorFlash.error(e);
				$scope.cargando = false;
		});
	};
/**
* @ngdoc method
* @name Transaccion.RecursoCtrl#CluesChange
* @methodOf Transaccion.RecursoCtrl
*
* @description
* Carga los datos de la ficha para clues
* @param {string} value codigo de la clues
*/	
	$scope.CluesChange = function(value) 
	{ 	
		$scope.cargando = true;		
		CrudDataApi.ver('Clues', value, function (data) {
		  if(data.status  == '407')
			$window.location="acceso";

		  if(data.status==200)
		  {
		  	if(data.data.cone_clues!=null)
		  	{
				$scope.dato.idCone = data.data.cone_clues.idCone;
				$scope.dato.nivelCone = data.data.cone.cone.nombre;
				
				$scope.dato.nombre = data.data.nombre;
				$scope.dato.clues = data.data.clues;
				$scope.dato.jurisdiccion = data.data.jurisdiccion;
				$scope.dato.municipio = data.data.municipio;
				$scope.dato.localidad = data.data.localidad;
				$scope.dato.domicilio = data.data.domicilio;
				$scope.dato.codigoPostal = data.data.codigoPostal;					
				$scope.dato.tipoUnidad = data.data.tipoUnidad;
				$scope.dato.tipologia = data.data.tipologia;
			}
			else
			{
				flash('danger', "Ooops! "+$translate.instant('NO_CONE'));
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
		}); 
	}; 
/**
* @ngdoc method
* @name Transaccion.RecursoCtrl#hide
* @methodOf Transaccion.RecursoCtrl
*
* @description
* Cerrar el dialogo de la ficha
*/
	$scope.hide = function() {
		$mdDialog.hide();
	};
/**
* @ngdoc method
* @name Transaccion.RecursoCtrl#abrirFicha
* @methodOf Transaccion.RecursoCtrl
*
* @description
* abre la ficha de la clues en un dialog
* @param {event} ev evento click
*/	
	$scope.abrirFicha = function(ev)
	{	 
	    $scope.editDialog = $mdDialog;
	    $scope.editDialog.show({
	    		targetEvent: ev,
	    		
	    		scope: $scope.$new(),
		        templateUrl: 'src/transaccion/evaluacionRecurso/views/ficha.html',
		        clickOutsideToClose: true			        			        	  
	    });	    	   
	};
	
	$scope.abrirEvaluacionFicha = function(ev)
	{	 
	    $scope.editDialog = $mdDialog;
	    $scope.editDialog.show({
	    		targetEvent: ev,
	    		
	    		scope: $scope.$new(),
		        templateUrl: 'src/transaccion/evaluacionRecurso/views/evaluacionFicha.html',
		        clickOutsideToClose: true			        			        	  
	    });	    	   
	};
	//autocomplete 	

	// ******************************
	// Internal methods
	// ******************************
	/**
	 * Search for repos... use $timeout to simulate
	 * remote dataservice call.
	 */
	$scope.querySearch = function (query) {
		return $http.get(URLS.BASE_API + 'CluesUsuario',{ params:{termino: query}})
		.then(function(res)
		{
            return res.data.data;                            
        });
	}
	$scope.selectedItemChange = function(item) {
		if(!angular.isUndefined(item))
		{
			$scope.CluesChange(item.clues);
		}
	}
	$scope.cambiarTipo = function(tipo)
	{
		if(tipo=="clues")
			$scope.repos = $scope.Clues;
		if(tipo=="jurisdiccion" )
			$scope.repos = $scope.Jurisdiccion;
	}
	//fin autocomplete
	
	//Recurso
	$scope.showModal = false;
	$scope.terminado=false;

	$scope.delay = 0;
	$scope.minDuration = 0;
	$scope.message = 'Guardando...';
	$scope.backdrop = true;
	$scope.recurso = null;
	$scope.dato={};

	$scope.today = function() {
		$scope.dato.fechaEvaluacion = new Date();
	};

	$scope.clear = function () {
		$scope.dato.fechaEvaluacion = null;
	};

	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		$scope.opened = true;
	};

	$scope.dateOptions = {
		formatYear: 'yyyy',
		startingDay: 1
	};
	$scope.format='yyyy-MM-dd';

	$scope.opciones = function(url, hacer) 
	{
		$scope.options=[];
		listaOpcion.options(url).success(function(data)
		{
			if(data.status  == '407')
				$window.location="acceso";
				
			if(data.status==200)
			{
				$scope.options=data.data;
				if(angular.isUndefined(hacer))
					$scope.estadistica();
			}
			else
		{
			errorFlash.error(data);
		}
		});
	};
/**
* @ngdoc method
* @name Transaccion.RecursoCtrl#acciones
* @methodOf Transaccion.RecursoCtrl
*
* @description
* Carga el catalogo de acciones 
*/
	$scope.acciones = function() 
	{
		$scope.acciones=[];
		listaOpcion.options('Accion').success(function(data)
		{
			if(data.status  == '407')
				$window.location="acceso";
				
			if(data.status==200)
			{
				$scope.acciones=data.data;
				$scope.groupList = $scope.acciones.reduce(function(previous, current) {
				    if (previous.indexOf(current.tipo) === -1) {
				      previous.push(current.tipo);
				    }

				    return previous;
				}, []);
			}
			else
			{
				errorFlash.error(data);
			}
		});
	};
/**
* @ngdoc method
* @name Transaccion.RecursoCtrl#accionesPlazo
* @methodOf Transaccion.RecursoCtrl
*
* @description
* Carga el catalogo de plazo acciones 
*/
	$scope.accionesPlazo = function() 
	{
		$scope.plazos=[];
		listaOpcion.options('PlazoAccion').success(function(data)
		{
			if(data.status  == '407')
				$window.location="acceso";
				
			if(data.status==200)
			{
				$scope.plazos=data.data;
			}
			else
			{
				errorFlash.error(data);
			}
		});
	};
/**
* @ngdoc method
* @name Transaccion.RecursoCtrl#verificarCambios
* @methodOf Transaccion.RecursoCtrl
*
* @description
* Comprueba que el indicador actual no tenga cambios en la evaluacion
*/		
	
	$scope.criterios = []; $scope.modificado = false;
	$scope.verificarCambios = function()
	{
		if($scope.modificado)
		{
			if ($window.confirm($translate.instant('CONFIRM_MODIFICADO'))) {  
				$scope.modificado = false;
			}
			event.preventDefault();
            event.stopPropagation();
		}
	}
/**
* @ngdoc method
* @name Transaccion.RecursoCtrl#cargarCriterios
* @methodOf Transaccion.RecursoCtrl
*
* @description
* cargar los criterios que le correspondan por indicador y nivel de cone
*/	
	$scope.cargarCriterios = function(id,codigo,nombre,$index)
	{
		var cone=$scope.dato.idCone;
		var indi=$scope.dato.idIndicador;
		var idev=$scope.dato.id;
		
		$scope.verificarCambios();
		
		if(!angular.isUndefined(cone)&&cone!=""&&!angular.isUndefined(indi)&&indi!=""&& !$scope.modificado)
		{
			$scope.cargando = true;
			$http.get(URLS.BASE_API+'CriterioEvaluacionRecurso/'+cone+'/'+indi+'/'+idev)
			.success(function(data, status, headers, config) 
			{
				if(data.status  == '407')
					$window.location="acceso";
				var op=0;
				if(data.status==200)
				{	
					if(!angular.isUndefined(nombre))
					{						
						$scope.informacion.push(
						{			      
							"id": id,
							"codigo": codigo,
							"nombre": nombre,
							"total": data.total-3
						});
						$scope.informacion[$scope.informacion.length-1][codigo] = 0;
						$scope.totalDeTotal[id] = [];
						$scope.totalDeTotal[id]["de"] =  0;
						$scope.totalDeTotal[id]["total"] =data.total-3;
						
						$scope.options.splice($index, 1);
					}				
					$scope.criterios = {};				
					$scope.criterios = data.data;
					$scope.dato.aprobado = {};
					if(!angular.isUndefined(data.hallazgo))
					{
						$scope.dato.hallazgos={};
						
						$scope.dato.hallazgos.descripcion = data.hallazgo.descripcion;
						$scope.dato.hallazgos.idAccion = data.hallazgo.idAccion;
						$scope.dato.hallazgos.idPlazoAccion = data.hallazgo.idPlazoAccion;
						if($scope.dato.hallazgos.idPlazoAccion>0)
							$scope.esSeguimiento=true;
						if(!angular.isUndefined(data.hallazgo.descripcion))
							$scope.tieneHallazgo=true;
						else
							$scope.tieneHallazgo=false;
						op=1;												
					}
					else
					{
						op=0;
					}
					if(data.total==3)
						flash('warning', $translate.instant("NO_CRITERIO"));
				}
				else
					flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" + data.messages);
					
				if(data.status!=200 || op==0)
				{
					$scope.dato.hallazgos.descripcion = "";
					$scope.dato.hallazgos.idAccion = "";
					$scope.dato.hallazgos.idPlazoAccion = "";	
					$scope.esSeguimiento=false;
					$scope.tieneHallazgo=false;
					
				}
				$scope.cargando = false;	
			})
			.error(function(data, status, headers, config) 
			{
				$scope.cargando = false;
				errorFlash.error(data);
			});
		}		
	};
	$scope.hallazgos={};
/**
* @ngdoc method
* @name Transaccion.RecursoCtrl#cargarCriteriosVer
* @methodOf Transaccion.RecursoCtrl
*
* @description
* cargar los criterios para la vista ver
*/
	$scope.cargarCriteriosVer = function()
	{			
		var idev=$location.search().id;
		$scope.cargando = true;	
		$http.get(URLS.BASE_API+'EvaluacionRecursoCriterio/'+idev)
		.success(function(data, status, headers, config) 
		{
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
		})
		.error(function(data, status, headers, config) 
		{
			$scope.cargando = false;
			errorFlash.error(data);
		});		
	};
//generar impreso
	$scope.tieneExpediente=[];
	$scope.abrirIndicadores = function(e)
	{
		angular.element(document.getElementById("principal")).attr("class","sin-scroll");
	}
	
	$scope.tempIndicador = [];
	$scope.toggle = function (item, list) {
		var idx = list.indexOf(item.id);
		if (idx > -1) 
			list.splice(idx, 1);
		else 
		{
			list.push(item.id);
		}
	};	
	$scope.exists = function (item, list) {
		return list.indexOf(item) > -1;
	};
	$scope.generarImpreso = function()
	{
		$localStorage.cium.recurso = {};
		$localStorage.cium.recurso.imprimir = {};
		$localStorage.cium.recurso.imprimir.um = $scope.dato;
		$localStorage.cium.recurso.imprimir.indicadores = $scope.tempIndicador;
		$location.path("evaluacion-recurso/evaluacionImpresa");
	}
	$scope.vistaImpreso = function()
	{
		$scope.dato = $localStorage.cium.recurso.imprimir.um;
		$scope.indicadores = [];
		var cone = $scope.dato.idCone;
		angular.forEach($localStorage.cium.recurso.imprimir.indicadores , function(val, key) 
		{
			CrudDataApi.lista('CriterioEvaluacionRecursoImprimir/' + cone + '/' + val, function (data) {	
				if(data.status==200)
				{
					$scope.indicadores.push(data.data);	
				}
			},function (e) {
				errorFlash.error(e);				
			});			
		});
		$scope.cargando = false;
	}
// fin generar impreso
/**
* @ngdoc method
* @name Transaccion.RecursoCtrl#estadistica
* @methodOf Transaccion.RecursoCtrl
*
* @description
* obtener las estadisticas de la evaluacion
*/	
	$scope.informacion = [];
	$scope.totalDeTotal = [];
	$scope.estadistica = function()
	{
		$scope.cargando = true;
		var idev = $scope.dato.id;
		if(angular.isUndefined(idev) || idev == "" )
			idev = $location.search().id;
		CrudDataApi.ver('EstadisticaRecurso', idev, function (data) {
			if(data.status  == '407')
				$window.location="acceso";
		
			if(data.status==200)
			{
				$scope.modificado = false;
				$scope.informacion = data.data;
					
				angular.forEach($scope.informacion , function(val, key) 
				{
					angular.forEach($scope.options , function(v, k) 
					{
						if(val.codigo == v.codigo)
						{
							$scope.options.splice(k, 1);
						}
					});					
				});
				
				$scope.completo = 0;
				$scope.incompleto = 0;
				var co = 0; var inc = 0;
				
				angular.forEach(data.data , function(val, key) 
				{
					$scope.totalDeTotal[val.id] = [];
					$scope.totalDeTotal[val.id]["de"] =  val[val.codigo];
					$scope.totalDeTotal[val.id]["total"] = val.total;
					if(val[val.codigo] == val.total)
						co = co + 1;
					else
						inc = inc + 1;
				});
				$scope.completo = co;
				$scope.incompleto = inc;
				if(inc == 0 && co > 0)
					$scope.terminado=true;
				else
					$scope.terminado=false;
			}
			
				$scope.cargando = false;
			},function (e) {
				
				$scope.cargando = false;
			});    			
	};
	
/**
* @ngdoc method
* @name Transaccion.RecursoCtrl#aprobar
* @methodOf Transaccion.RecursoCtrl
*
* @description
* Evaluar los criterios si/no
* @param {string} index identificador del criterio
* @param {string} evaluacion id de la evaluación
* @param {string} ap lugar de verificación
*/
	$scope.json = {};
	$scope.tieneHallazgo=false;
	$scope.aprobar = function(index,evaluacion,ap)
	{
		$scope.modificado = true;						
		$scope.tieneHallazgo=false;
		angular.forEach($scope.dato.aprobado, function(item, key) 
		{
			if(item==0)
			{
				$scope.tieneHallazgo=true;
			}
		});
		if(!$scope.tieneHallazgo)
			$scope.dato.hallazgos = {};

		var indi = angular.element(document.querySelector('#indicador'));

		var code = indi[0].innerText;
		code = code.split(" - ");
		var info = 0; var totalAprobado = 0; var totalCriterio = 0;
		angular.forEach($scope.dato.aprobado, function(item, key) 
		{
			totalAprobado++;
		});
		angular.forEach($scope.criterios, function(item, key) 
		{
			totalCriterio++;
		});
		totalCriterio=totalCriterio-3;
		angular.forEach($scope.informacion, function(item, key) 
		{
			info++; var existe = false;
			angular.forEach($scope.informacion, function(item, key) 
			{
				angular.forEach(item, function(v, k) 
				{
					if(k==code[0])
						existe=true;
				})
			});
			if(existe)
			{
				$scope.informacion[info-1][code[0]] = totalAprobado;
			}
			else
			{
				$scope.informacion.push(
					{
				      "id": $scope.dato.idIndicador,
				      "codigo": code[0],
				      "nombre": code[1],
				      "total": totalCriterio
				    }
				);
				$scope.informacion[key][code[0]] = totalAprobado;
			}
		});
		if(info==0)
		{
			$scope.informacion.push(
				{			      
			      "id": $scope.dato.idIndicador,
			      "codigo": code[0],
			      "nombre": code[1],
			      "total": totalCriterio
			    }
			);
			$scope.informacion[0][code[0]] = totalAprobado;
		}
		
		$scope.completo = 0;
		$scope.incompleto = 0;
		var co = 0; var inc = 0;
		angular.forEach($scope.informacion , function(val, key) 
		{
			if(angular.isUndefined($scope.totalDeTotal[val.id]))
				$scope.totalDeTotal[val.id] = [];
			$scope.totalDeTotal[val.id]["de"] =  val[val.codigo];
			$scope.totalDeTotal[val.id]["total"] = val.total;
			if(val[val.codigo] == val.total)
				co = co + 1;
			else
				inc = inc + 1;
		});
		$scope.completo = co;
		$scope.incompleto = inc;

		if(inc == 0 && co > 0)
			$scope.terminado=true;
		else
			$scope.terminado=false;
	};
	$scope.esSeguimiento = false;
	$scope.verSeguimiento = function(text)
	{				
		if(text=='s' || text == 'S')
			$scope.esSeguimiento=true;
		else
			$scope.esSeguimiento=false;							
	};
   
	

/**
* @ngdoc method
* @name Transaccion.RecursoCtrl#cerrar
* @methodOf Transaccion.RecursoCtrl
*
* @description
* Cerrar evaluación
* @param {string} id identificador de la evaluación
*/
	$scope.cerrar = function(id) 
	{
		if ($window.confirm($translate.instant('CONFIRM_CERRAR'))) {
			$scope.dato.cerrado = 1;			
			$scope.modificar(id);
		}		
	};
	//fin Recurso
	
	//export PDF
    $scope.exportar = function()
    {
        $scope.generarExport("pdf");              
    }

    //export EXCEL
    $scope.excel = function()
    {        
         $scope.generarExport("xlsx");     
    }
    $scope.generarExport =  function(tipo)
    {
        $scope.btexcel=true;
        $scope.btexportar=true;

        var url = $scope.ruta;
        var json={tabla:url,tipo:tipo};
        CrudDataApi.crear('Export', json, function (data) {
            $scope.btexcel=false;
            $scope.btexportar=false;
            $window.open(URLS.BASE+"export."+tipo)
          },function (e) {
            errorFlash.error(e);
            $scope.cargando = false;
            $scope.btexcel=false;
            $scope.btexportar=false;
          }); 
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


      	CrudDataApi.lista(url+'?pagina=' + pagina + '&limite=' + limite+"&order="+order, function (data) {
        if(data.status  == '407')
        	$window.location="acceso";

      		if(data.status==200)
      		{
    			$scope.datos = data.data;
    			$scope.paginacion.paginas = data.total;
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
		$scope.cargando = true;
		CrudDataApi.ver(url, id, function (data) {
			if(data.status  == '407')
				$window.location="acceso";

			if(data.status==200)
			{
				$scope.id = data.data.id;
				$scope.dato = data.data;
				$scope.nombre = data.data.nombre;
				$scope.clues = data.data.clues;				
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
		
	//Modificar. Actualiza el recurso con los datos que envia el usuario
	$scope.modificar = function(id,f) 
	{    
		var url = $scope.ruta;
		var json = {}; var criterios = [];
		if(f==1)$scope.clues = $scope.dato.clues;
		angular.forEach($scope.dato.aprobado , function(val, key) 
		{
			criterios.push({idCriterio:key,idIndicador:$scope.dato.idIndicador,aprobado:val});
		});
		json.evaluaciones=[];
		json.evaluaciones[0] = {id:$scope.dato.id,clues:$scope.clues, fechaEvaluacion:$scope.dato.fechaEvaluacion,cerrado:$scope.dato.cerrado};
		json.evaluaciones[0].criterios = criterios;
		json.evaluaciones[0].hallazgos=[];
		if(!angular.isUndefined($scope.dato.hallazgos))
		if($scope.dato.hallazgos.idAccion)
		{
			json.evaluaciones[0].hallazgos[0] = $scope.dato.hallazgos;
			json.evaluaciones[0].hallazgos[0].idIndicador = $scope.dato.idIndicador;
		}
		
		if(json)
		{
			$scope.cargando = true;
			CrudDataApi.editar(url, id, json, function (data) {
				if(data.status  == '407')
				$window.location="acceso";
				
				if(data.status==200)
				{
				  flash('success', data.messages);
				  if($scope.dato.cerrado==1)
				  {
				  	var uri=$scope.url.split('/');	
					uri="/"+uri[1]+"/ver";
					$location.path(uri).search({id: data.data.id});	
				  }
				  if(f==1)
				  	$scope.nombre=$scope.dato.nombre;
				  $scope.clues=data.data.clues;
				  $scope.modificado=false;
				  $scope.cargarCriterios();
				  $scope.estadistica();
				  $mdDialog.hide();
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
		}
	};
	// Guardar
	$scope.guardar = function(form) 
	{
		
		var url=$scope.ruta;
		var json=$scope.dato;

		if(json)
		{
			$scope.cargando = true;
			CrudDataApi.crear(url, json, function (data) {
				if(data.status  == '407')
					$window.location="acceso";

				if(data.status==201)
				{
					$scope.dato = angular.copy($scope.limpio);
					form.$setPristine();
					form.$setUntouched();   
					flash('success', data.messages);
					var uri=$scope.url.split('/');

					uri="/"+uri[1]+"/modificar";

					$location.path(uri).search({id: data.data.id});
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
		}    
	};

	//Borrar. Elimina el recurso del parametro id
	$scope.borrar = function(id, $index) 
	{    
		var op=1;
		if(angular.isUndefined(id))
		{
			id=$location.search().id;
			op=0;
		}
		if ($window.confirm($translate.instant('CONFIRM_DELETE'))) {   
			var url=$scope.ruta;
            $scope.cargando = true;

			CrudDataApi.eliminar(url, id, function (data) {
				if(data.status  == '407')
					$window.location="acceso";
				
				if(data.status==200)
				{
					if(op==1)
					  $scope.datos.splice($index, 1);
					else
					  angular.element('#lista').click();
					flash('success', data.messages);
				
					
					$scope.cargando = false;
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
		}
	}; 

	//Borrar. Elimina el recurso del parametro id
	$scope.borrarIndicador = function() 
	{ 
		var ind = $scope.dato.idIndicador;
		var eva = $location.search().id;
		
		if ($window.confirm($translate.instant('CONFIRM_DELETE'))) {   
			var url=$scope.ruta;
            $scope.cargando = true;

			CrudDataApi.eliminar("EvaluacionRecursoCriterio", eva+"?idIndicador="+ind, function (data) {
				if(data.status  == '407')
					$window.location="acceso";
				
				if(data.status==200)
				{					
					flash('success', data.messages);
								
					$scope.cargando = false;

					$route.reload();	
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
		}          
	};
	}])
})();