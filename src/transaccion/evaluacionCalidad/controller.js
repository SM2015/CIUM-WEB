(function(){
	'use strict';
	angular.module('CalidadModule')
	.controller('CalidadCtrl',
	       ['$rootScope', '$translate', '$mdDialog', '$scope', '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash', 'listaOpcion', 'Criterios', 'CrudDataApi', 'URLS', 
	function($rootScope,   $translate,   $mdDialog,   $scope,   $mdSidenav,  $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,   listaOpcion,   Criterios,   CrudDataApi, URLS){
	
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
		{id:"clues", nombre:"Clues"},
		{id:'fechaEvaluacion', nombre:$translate.instant('CREADO')}
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
	$scope.update=false;
		
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
	$scope.update=false;
	
	// obtener el leistado de clues que le corresponde al usuario
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
			},function (e) {
				errorFlash.error(e);
				$scope.cargando = false;
		});
	};
	
	// rellenar la ficha con los datos de la clues seleccionada
	$scope.CluesChange = function(value) 
	{ 	
		$scope.cargando = true;		
		CrudDataApi.ver('Clues', value, function (data) {
		  if(data.status  == '407')
			$window.location="acceso";

		  if(data.status==200)
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
				errorFlash.error(data);
			}
		  $scope.cargando = false;
		},function (e) {
			errorFlash.error(e);
			$scope.cargando = false;
		}); 
	}; 
	// cerrar el dialog
	$scope.hide = function() {
		$mdDialog.hide();
	};
	// abre la ficha de  la clues en un dialog
	$scope.abrirFicha = function(ev)
	{		    
	    $scope.editDialog = $mdDialog;
	    $scope.editDialog.show({
	    		targetEvent: ev,
	    		
	    		scope: $scope.$new(),
		        templateUrl: 'src/transaccion/evaluacionCalidad/views/ficha.html',
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
	/**
	 * Create filter function for a query string
	 */
	function createFilterFor(query) {
	  var lowercaseQuery = angular.lowercase(query);
	  return function filterFn(item) {
		return (item.value.indexOf(lowercaseQuery) === 0);
	  };
	}
	$scope.cambiarTipo = function(tipo)
	{
		if(tipo=="clues")
			$scope.repos = $scope.Clues;
		if(tipo=="jurisdiccion" )
			$scope.repos = $scope.Jurisdiccion;
	}
	//fin autocomplete
	
	//calidad
	$scope.showModal = false;
	$scope.terminado=false;

	$scope.delay = 0;
	$scope.minDuration = 0;
	$scope.message = 'Guardando...';
	$scope.backdrop = true;
	$scope.calidad = null;
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

	$scope.opciones = function(url) 
	{
		$scope.options=[];
		listaOpcion.options(url).success(function(data)
		{
			if(data.status  == '407')
				$window.location="acceso";
				
			if(data.status==200)
			{
				$scope.options=data.data;
			}
			else
		{
			errorFlash.error(data);
		}
		});
	};

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
	$scope.completo = []
	$scope.incompleto = [];
	// agregar columnas(expediente)
	$scope.columnas = [];
	$scope.agregarColumna = function(exp)
	{
		var indi = $scope.indicador;
		if(angular.isUndefined(exp))
		{
			if(angular.isUndefined($scope.completo[indi]))
				$scope.completo[indi] = [];

			if(angular.isUndefined($scope.incompleto[indi]))
				$scope.incompleto[indi] = [];

			$scope.completo[indi][$scope.columnas.length+1]=0;
			$scope.incompleto[indi][$scope.columnas.length+1]=0;
			exp=null;	
		}
		if($scope.columnas.length<20)
		{
			$scope.columnas.push({id:$scope.columnas.length+1,exp:exp});
			$scope.dato.totalExpediente=$scope.columnas.length;			
		}
	}
	
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

	// cargar los criterios que le correspondan por indicador y nivel de cone
	$scope.criterios = [];
	$scope.informacion = [];
	$scope.cargarCriterios= function()
	{
		var cone=$scope.dato.idCone;
		var indi=$scope.dato.idIndicador;
		var idev=$scope.dato.id;
		var op=0;
		$scope.verificarCambios();
		$scope.dato.tempExpediente = $scope.dato.expediente;
		if(!angular.isUndefined(cone)&&cone!=""&&!angular.isUndefined(indi)&&indi!="" && !$scope.modificado)
		{
			$scope.cargando = true;
			$scope.criterios = {};

			$scope.estadistica();
			$http.get(URLS.BASE_API+'CriterioEvaluacionCalidad/'+cone+'/'+indi+'/'+idev)
			.success(function(data, status, headers, config) 
			{
				if(data.status  == '407')
					$window.location="acceso";
				
				if(data.status==200)
				{
					if(data.tiene==1)
					{
						$scope.dato.totalExpediente=0;
						$scope.columnas = [];
					}								
					$scope.dato.totalCriterio = {};
					
					$scope.dato.cumple = {};
					$scope.dato.promedio = {};

					$scope.dato.aprobado={};
					if(angular.isUndefined($scope.dato.totalExpediente))
						$scope.dato.totalExpediente=0;	
					var total = data.total;	
					var totalCriterio = data.totalCriterio;	
					var promedioGeneral = 0; var aprobado = 0;
					$scope.dato.hallazgos = {};
					if(!angular.isUndefined(data.hallazgo[indi]))
					{
						$scope.dato.hallazgos={};
						
						$scope.dato.hallazgos.descripcion = data.hallazgo[indi].descripcion;
						$scope.dato.hallazgos.idAccion = data.hallazgo[indi].idAccion;
						$scope.dato.hallazgos.idPlazoAccion = data.hallazgo[indi].idPlazoAccion;
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

					angular.forEach(data.data , function(val, key) 
					{
						
						var exp = val.registro.expediente;
						if(exp==0)
						{ 
							exp=1; var c=0;
							angular.forEach($scope.dato.tempExpediente , function(valor, clave) 
							{
								if(c==0)
									val.registro.expediente=valor;								
								c++;
							});
							
						}
						if($scope.dato.totalExpediente<total)
							$scope.agregarColumna(exp);

						$scope.criterios = val;
						if(angular.isUndefined($scope.dato.expediente))
							$scope.dato.expediente=[];
						$scope.dato.expediente[exp] = val.registro.expediente;
						$scope.dato.cumple[exp] = val.registro.cumple;
						$scope.dato.promedio[exp] = val.registro.promedio;
						
						
						angular.forEach($scope.dato.aprobado[exp] , function(v, k) 
						{ aprobado++; });

						if(aprobado==0)
							$scope.dato.aprobado[exp]={};

						angular.forEach(val.aprobado , function(v1, k1) 
						{
							$scope.dato.aprobado[exp][v1]=1;
						});
						angular.forEach(val.noAprobado , function(v2, k2) 
						{
							$scope.dato.aprobado[exp][v2]=0;
						});
						angular.forEach(val.noAplica , function(v3, k3) 
						{
							$scope.dato.aprobado[exp][v3]=2;
						});	

									    
					});		
					$scope.obtenerPromedio();				    																			   
				}
				else					
				{
					$scope.dato.totalCriterio = {};
					$scope.dato.expediente = {};
					$scope.dato.cumple = {};
					$scope.dato.promedio = {};

					$scope.dato.aprobado = {};
					$scope.criterios = {};
					$scope.dato.totalExpediente = 0;
					$scope.columnas = [];

					$scope.dato.hallazgo = "";
					$scope.dato.accion = "";
					$scope.dato.plazoAccion = "";	
					$scope.esSeguimiento=false;
					flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" + data.messages);
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
	$scope.hallazgos = {};	
	// cargar los criterios para la vista ver
	$scope.cargarCriteriosVer = function()
	{			
		var idev=$location.search().id;
		$scope.cargando = true;
		$http.get(URLS.BASE_API+'EvaluacionCalidadCriterio/'+idev)
		.success(function(data, status, headers, config) 
		{
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
		})
		.error(function(data, status, headers, config) 
		{
			errorFlash.error(data);
		});		
	};
	
	$scope.tieneExpediente=[];
	// obtener las estadisticas de la evaluacion
	$scope.estadistica = function()
	{
		$scope.cargando = true;
		var indi=$scope.dato.idIndicador;
		var idev = $scope.dato.id;
		if(angular.isUndefined(idev) || idev == "" )
			idev = $location.search().id;
		var tco=0; var co=0;
		var tinc=0; var inc=0;
		$http.get(URLS.BASE_API+'EstadisticaCalidad/'+idev)
		.success(function(data, status, headers, config) 
		{
			if(data.status  == '407')
				$window.location = "acceso";
			
			if(data.status == 200)
			{									
				$scope.informacion = data.data;
				
				
				var tco = 0; var tinc = 0;
				$scope.misIndicadores=[];
				angular.forEach($scope.informacion , function(val, key) 
				{
					angular.forEach(val , function(v, k) 
					{
						$scope.completo[v.id]= [];					
						$scope.incompleto[v.id]= [];
						$scope.misIndicadores.push(v.id);
					})
				})	
				angular.forEach($scope.informacion , function(val, key) 
				{					
					var exp=key;
					angular.forEach($scope.misIndicadores , function(vl, ky) 
					{
						var co = 0; var inc = 0; 
						angular.forEach(val , function(v, k) 
						{ 
							if(v[v.codigo] == v.total)
							{
								tco = tco + 1;
								co = co + 1;
							}
							else
							{
								tinc = tinc + 1;
								inc = inc + 1;
							}
						});
						indi = vl;
						$scope.completo[indi][exp] = co;
						$scope.incompleto[indi][exp] = inc;
					});
				});
				if(tinc == 0 && tco > 0)
					$scope.terminado=true;
				else
					$scope.terminado=false;				
			}
			else
			{
				errorFlash.error(data);
			}
			$scope.cargando = false;	
		})
		.error(function(data, status, headers, config) 
		{
			$scope.cargando = false;
			errorFlash.error(data);
		});
	};
	
	
	$scope.json = {};
	$scope.TH={};
	$scope.AR={};
	$scope.tieneHallazgo=false;
	
	// optener el promedio para la evaluacion
	$scope.obtenerPromedio = function()
	{
		var totalCriterio = 0;
		var aprobado = 0;
		var noaprobado = 0;
		var noaplica = 0;
		var promedioGeneral = 0;
		var total = 0;
		$scope.dato.totalCriterio={};
		$scope.tieneHallazgo=false;
		
		angular.forEach($scope.dato.expediente, function(val, exp) {
			angular.forEach($scope.criterios, function(value, key) {
				if(value.hasOwnProperty("idCriterio"))
				{
					try
					{
						if($scope.dato.aprobado[exp][value.idCriterio] == 1)
							aprobado++;
						if($scope.dato.aprobado[exp][value.idCriterio] == 0)
							noaprobado++;
						if($scope.dato.aprobado[exp][value.idCriterio] == 2)
							noaplica++;
					}
					catch(e){}
					totalCriterio++;
				}
			});


			total = aprobado + noaplica;
			$scope.dato.totalCriterio[exp]=totalCriterio;
			if(total == totalCriterio)
				$scope.dato.cumple[exp] = 1;
			else
				$scope.dato.cumple[exp] = 0;
			
			$scope.dato.promedio[exp] = (total/totalCriterio)*100;
			promedioGeneral = promedioGeneral + $scope.dato.promedio[exp];			
			totalCriterio = 0; total = 0; aprobado = 0; noaplica = 0; noaprobado = 0;
		});	

		$scope.dato.promedioGeneral = promedioGeneral/$scope.dato.totalExpediente;
		if($scope.dato.promedioGeneral<80)
			$scope.tieneHallazgo=true;
		else
			$scope.dato.hallazgos={};
	};
	$scope.validarNoRepetirExpediente = function(valor,exp)
	{		
		angular.forEach($scope.dato.expediente, function(item, key) 
		{
			if(item==valor&&key!=exp)
				flash('warning', $translate.instant("REPITE_EXPEDIENTE") );
		});
	}
	// evaluacion de criterio si/no
	$scope.json = {};
	$scope.tieneHallazgo=false;
	$scope.aprobar = function(index,evaluacion,ap,exp,id)
	{		
		$scope.obtenerPromedio();
		if(exp==null)exp=id; 
		$scope.modificado = true;	
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
		angular.forEach($scope.dato.aprobado[exp], function(item, key) 
		{
			totalAprobado++;
		});
		
		totalCriterio=$scope.dato.totalCriterio[exp];
		
		angular.forEach($scope.informacion[exp], function(item, key) 
		{
			var existe = false; info++;
			angular.forEach($scope.informacion[exp], function(item, key) 
			{
				angular.forEach(item, function(v, k) 
				{
					if(k==code[0])
						existe=true;
				})
			});
			if(existe)
			{
				$scope.informacion[exp][key][code[0]] = totalAprobado;
			}
			else
			{
				$scope.informacion[exp][key]=
					{
				      "id": $scope.dato.idIndicador,
				      "codigo": code[0],
				      "nombre": code[1],
				      "total": totalCriterio
				    };
				$scope.informacion[exp][key][code[0]] = totalAprobado;
			}
		});
		if(info==0)
		{
			$scope.informacion[exp]=[];
			$scope.informacion[exp][0]=
				{
			      "id": $scope.dato.idIndicador,
			      "codigo": code[0],
			      "nombre": code[1],
			      "total": totalCriterio
			    };
			$scope.informacion[exp][0][code[0]] = totalAprobado;
		}
		var tco = 0; var tinc = 0;
		$scope.misIndicadores=[]; 

		angular.forEach($scope.informacion , function(val, key) 
		{
			angular.forEach(val , function(v, k) 
			{
				$scope.completo[v.id]= [];					
				$scope.incompleto[v.id]= [];
				$scope.misIndicadores.push(v.id);
			})
		}); 
		angular.forEach($scope.informacion , function(val, key) 
		{					
			var exp=key;
			angular.forEach($scope.misIndicadores , function(vl, ky) 
			{
				var co = 0; var inc = 0; 
				angular.forEach(val , function(v, k) 
				{ 
					if(v[v.codigo] == v.total)
					{
						tco = tco + 1;
						co = co + 1;
					}
					else
					{
						tinc = tinc + 1;
						inc = inc + 1;
					}
				});
				indi = vl; 
				$scope.completo[indi][exp] = co;
				$scope.incompleto[indi][exp] = inc;
			});
		});
		if(tinc == 0 && tco > 0)
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
   
	$scope.valido=false;
	

	//cerrar
	$scope.cerrar = function(id) 
	{
		$scope.dato.cerrado = 1;
		
		$scope.modificar(id);
	};
	//fin calidad
	
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
	
	// obtiene los datos necesarios para crear el grid (listado)// obtiene los datos necesarios para crear el grid (listado)
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
				$scope.nombre=data.data.nombre;
				$scope.clues=data.data.clues;
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
		var json = {}; var registros = []; var i = 0;
		if(f==1)$scope.clues = $scope.dato.clues;
		angular.forEach($scope.dato.aprobado , function(val, key) 
		{
			if(!angular.isUndefined($scope.dato.expediente[key]))
			{
				i++;
				registros.push(
								{
									idIndicador:$scope.dato.idIndicador, 
									expediente:$scope.dato.expediente[key], 
									columna: i, 
									cumple: $scope.dato.cumple[key], 
									promedio: $scope.dato.promedio[key], 
									totalCriterio: $scope.dato.totalCriterio[key]
								});
				registros[i-1].criterios=[];
				angular.forEach(val , function(v, k) 
				{
					registros[i-1].criterios.push({idCriterio:k,idIndicador:$scope.dato.idIndicador,aprobado:v});
				});
			}
		});
		json.evaluaciones=[];
		json.evaluaciones[0] = {id:$scope.dato.id,clues:$scope.clues, fechaEvaluacion:$scope.dato.fechaEvaluacion,cerrado:$scope.dato.cerrado};
		json.evaluaciones[0].registros = registros;
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

			CrudDataApi.eliminar("EvaluacionCalidadCriterio", eva+"?idIndicador="+ind, function (data) {
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
	//Borrar. Elimina el recurso del parametro id
	$scope.borrarExpediente = function(exp,col) 
	{ 
		var ind = $scope.dato.idIndicador;
		var eva = $location.search().id;
		if(angular.isUndefined($scope.tieneExpediente[exp]))
		{
			$scope.columnas.splice(col,1);	
			delete $scope.completo[exp];	
			delete $scope.incompleto[exp];
		}
		else if ($window.confirm($translate.instant('CONFIRM_DELETE'))) {   
			var url=$scope.ruta;
            $scope.cargando = true;

			CrudDataApi.eliminar("EvaluacionCalidadCriterio", eva+"?idIndicador="+ind+"&expediente="+exp, function (data) {
				if(data.status  == '407')
					$window.location="acceso";
				
				if(data.status==200)
				{					
					flash('success', data.messages);
								
					$scope.cargando = false;

					$scope.columnas.splice(col,1);	
					delete $scope.completo[exp];	
					delete $scope.incompleto[exp];						
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