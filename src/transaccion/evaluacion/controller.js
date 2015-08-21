(function(){
	'use strict';
	angular.module('AbastoModule')
	.controller('AbastoCtrl',
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
		{id:"clues", nombre:"clues"},
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
	
	// obtener el listado de clues que le correspondan al usuario
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
	
	// crear la ficha de la clues seleccionada
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
		        templateUrl: 'src/transaccion/evaluacion/views/ficha.html',
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
	
	//abasto
	$scope.showModal = false;
	$scope.terminado=false;

	$scope.delay = 0;
	$scope.minDuration = 0;
	$scope.message = 'Guardando...';
	$scope.backdrop = true;
	$scope.abasto = null;
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
	// cargar los criterios que le correspondan al indicador por el tipo de cone
	$scope.cargarCriterios = function()
	{
		var cone=$scope.dato.idCone;
		var indi=$scope.dato.idIndicador;
		var idev=$scope.dato.id;
		
		
		$scope.cargando = true;
		if(!angular.isUndefined(cone)&&cone!=""&&!angular.isUndefined(indi)&&indi!="")
		{
			$http.get(URLS.BASE_API+'CriterioEvaluacion/'+cone+'/'+indi+'/'+idev)
			.success(function(data, status, headers, config) 
			{
				if(data.status  == '407')
					$window.location="acceso";
				var op=0;
				if(data.status==200)
				{						
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
	
	// cargar los criterios de la evaluacion para la vista ver
	$scope.cargarCriteriosVer = function()
	{			
		var idev=$location.search().id;
		$scope.cargando = true;	
		$http.get(URLS.BASE_API+'EvaluacionCriterio/'+idev)
		.success(function(data, status, headers, config) 
		{
			if(data.status  == '407')
				$window.location="acceso";
			
			if(data.status==200)
			{						
				$scope.criterios = data.data;				
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

	// crear el estadistico de la evaluacion
	$scope.informacion = [];
	$scope.estadistica = function()
	{
		$scope.cargando = true;
		var idev = $scope.dato.id;
		if(angular.isUndefined(idev) || idev == "" )
			idev = $location.search().id;
		CrudDataApi.ver('Estadistica', idev, function (data) {
			if(data.status  == '407')
				$window.location="acceso";
		
			if(data.status==200)
			{
				$scope.modificado = false;
				$scope.informacion = data.data;

				$scope.completo = 0;
				$scope.incompleto = 0;
				var co = 0; var inc = 0;
				angular.forEach(data.data , function(val, key) 
				{
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
	
	// evaluacion de criterio si/no
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
	$scope.verSeguimiento = function()
	{	
		var este = angular.element(document.getElementById('accion'));
		var text = este[0].selectedOptions[0].parentElement.label;
				
		if(text=='Seguimiento')
			$scope.esSeguimiento=true;
		else
			$scope.esSeguimiento=false;
							
	};
   
	
	//cerrar
	$scope.cerrar = function(id) 
	{
		$scope.dato.cerrado = 1;
		
		$scope.modificar(id);
	};
	//fin abasto
	
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
		
	//Modificar. Actualiza el recurso con los datos que envia el usuario
	$scope.modificar = function(id) 
	{    
		var url = $scope.ruta;
		var json = {}; var criterios = [];
		angular.forEach($scope.dato.aprobado , function(val, key) 
		{
			criterios.push({idCriterio:key,idIndicador:$scope.dato.idIndicador,aprobado:val});
		});
		json.evaluaciones=[];
		json.evaluaciones[0] = {id:$scope.dato.id,clues:$scope.dato.clues, fechaEvaluacion:$scope.dato.fechaEvaluacion,cerrado:$scope.dato.cerrado};
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

			CrudDataApi.eliminar("EvaluacionCriterio", eva+"?idi="+ind, function (data) {
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