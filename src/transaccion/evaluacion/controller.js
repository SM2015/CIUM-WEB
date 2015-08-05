(function(){
	'use strict';
	angular.module('AbastoModule')
	.controller('AbastoCtrl',
	       ['$rootScope', '$translate', '$scope', '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash', 'listaOpcion', 'Criterios', 'CrudDataApi', 'URLS', 
	function($rootScope,   $translate,   $scope,   $mdSidenav,  $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,   listaOpcion,   Criterios,   CrudDataApi, URLS){
	
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

	    $scope.BuscarPor=[                      
                      {id:"clues", nombre:'clues'},
                      {id:'creadoAl', nombre:$translate.instant('CREADO')},
                      {id:'modificadoAl', nombre:$translate.instant('MODIFICADO')}
                     ];

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
	    
	    $scope.redirect = function(id)
	    {
	        var uri=$scope.url.split('/');

	        uri="/"+uri[1]+"/ver";
	        $location.path(uri).search({id: id});	
	    }

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
		$scope.update=false;
		//clues
		$scope.getClues=function()
		{
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
						flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
					}
					$scope.cargando = false;
				},function (e) {
					errorFlash.error(e);
					$scope.cargando = false;
			});
		};
		$scope.CluesChange = function(value) 
		{ 			
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
				flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
			  }
			  $scope.cargando = false;
			},function (e) {
				errorFlash.error(e);
				$scope.cargando = false;
			}); 
		}; 
		//autocomplete
		
		$scope.simulateQuery = false;
		$scope.isDisabled    = false;		         
		$scope.querySearch   = querySearch;
		$scope.selectedItemChange = selectedItemChange;
		$scope.searchTextChange   = searchTextChange;
		
	
		// ******************************
		// Internal methods
		// ******************************
		/**
		 * Search for repos... use $timeout to simulate
		 * remote dataservice call.
		 */
		function querySearch (query) {
		  var results = query ? $scope.repos.filter( createFilterFor(query) ) : $scope.repos,
			  deferred;
		  if ($scope.simulateQuery) {
			deferred = $q.defer();
			$timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
			return deferred.promise;
		  } else {
			return results;
		  }
		}
		function searchTextChange(text) {
		}
		function selectedItemChange(item) {
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
					flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
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
					flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
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
					flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
				}
			});
		};
	
		$scope.criterios = [];
		$scope.cargarCriterios= function()
		{
			var cone=$scope.dato.idCone;
			var indi=$scope.dato.idIndicador;
			var idev=$scope.dato.id;
			
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
						$scope.criterios = data.data;
						if(!angular.isUndefined(data.hallazgo))
						{
							if(!angular.isUndefined(data.hallazgo[indi]))
							{
								$scope.dato.hallazgo = data.hallazgo[indi].descripcion;
								$scope.dato.accion = data.hallazgo[indi].idAccion;
								$scope.dato.plazoAccion = data.hallazgo[indi].idPlazoAccion;
								if($scope.dato.plazoAccion>0)
									$scope.esSeguimiento=true;
								$scope.tieneHallazgo=true;op=1;
							}							
						}
						$scope.actualizar();				    							
						$scope.estadistica();
					}
					else
						flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" + data.messages);
						
					if(data.status!=200 || op==0)
					{
						$scope.dato.hallazgo = "";
						$scope.dato.accion = "";
						$scope.dato.plazoAccion = "";	
						$scope.esSeguimiento=false;
						$scope.tieneHallazgo=false;
						
					}	
				})
				.error(function(data, status, headers, config) 
				{
					errorFlash.error(data);
				});
			}
		};
		$scope.cargarCriteriosVer = function()
		{			
			var idev=$location.search().id;
				
			$http.get(URLS.BASE_API+'CriterioEvaluacionVer/'+idev)
			.success(function(data, status, headers, config) 
			{
				if(data.status  == '407')
					$window.location="acceso";
				
				if(data.status==200)
				{						
					$scope.criterios = data.data;			    
					$scope.actualizar();			
				}
				else
				{
					flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" + data.messages);
				}	
			})
			.error(function(data, status, headers, config) 
			{
				errorFlash.error(data);
			});		
		};
			
		$scope.actualizar = function()
		{
			$scope.clase = 'default';
	
			$scope.hallazgos = $scope.criterios.hallazgo;
	
			$scope.mishallazgos = [];
			angular.forEach($scope.hallazgos , function(val, key) 
			{
				$scope.mishallazgos.push(key);
			});	
			
			$scope.valores = $scope.criterios.evaluacion;	
		};
	
		$scope.informacion = [];
		$scope.estadistica = function()
		{
			var idev = $scope.dato.id;
			if(angular.isUndefined(idev) || idev == "" )
				idev = $location.search().id;
			CrudDataApi.ver('Estadistica', idev, function (data) {
				if(data.status  == '407')
					$window.location="acceso";
			
				if(data.status==200)
				{
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
					flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
				}
					$scope.cargando = false;
				},function (e) {
					errorFlash.error(e);
					$scope.cargando = false;
				});    			
		};
		$scope.json = {};
		$scope.TH={};
		$scope.AR={};
		$scope.tieneHallazgo=false;
		$scope.aprobar = function(index,evaluacion,ap)
		{				
			$scope.json.idCriterio = index;
			$scope.json.idEvaluacion = evaluacion;
			var apx = $scope.dato.aprobado[index];
			if( apx == 1 || apx == 2)
			{		
				$scope.AR[index]=1;
				$scope.TH[ap]=$scope.AR;
			}
			else
			{
				$scope.AR[index]=0;
				$scope.TH[ap]=$scope.AR;
	
			}
			$scope.tieneHallazgo=false;
			angular.forEach($scope.TH[ap], function(item, key) 
			{
				if(item==0)
				{
					$scope.tieneHallazgo=true;
				}
			});
			$scope.json.idIndicador = $scope.dato.idIndicador;
			$scope.json.aprobado = apx;
			
			$scope.guardarCriterio('EvaluacionCriterio');
		};
		
		$scope.esSeguimiento=[];
		$scope.verSeguimiento = function()
		{	
			var este = angular.element('#accion');
			var selected = $(':selected', este);		
			var text = selected.closest('optgroup').attr('label');
			
			if(text=='Seguimiento')
				$scope.esSeguimiento=true;
			else
				$scope.esSeguimiento=false;
								
		};
	   
		$scope.valido=false;
		$scope.completar = function()
		{
			var h = $scope.dato.hallazgo;
			var a = $scope.dato.accion;
			var p = $scope.dato.plazoAccion;   
						
			if(!angular.isUndefined(h)&!angular.isUndefined(a))
			{
				$scope.valido=false;		
									
				$scope.json.idIndicador = $scope.dato.idIndicador;
				$scope.json.idEvaluacion = $scope.dato.id;
	
				$scope.json.hallazgo = h;
				$scope.json.accion = a;
				$scope.json.resuelto = 0;
				if(angular.isUndefined(p))
				{
					p=0;
					$scope.json.resuelto = 1;
				}
				$scope.json.plazoAccion = p;		
				
				$scope.json.aprobado = 0;
				$scope.json.clues = $("#clues").val();
				
				$scope.guardarCriterio('EvaluacionHallazgo');		
			}
			else 
				$scope.valido=true;
		};
	
		// guardarCriterio
		$scope.guardarCriterio = function(url) 
		{
			var json=$scope.json;
	
			$scope.abasto = $http.post(URLS.BASE_API+url, json)
			.success(function(data, status, headers, config) 
			{
				if(data.status == '201' || data.status == '200')
				{							
					$scope.estadistica();							
					//flash('success', data.messages);				    		
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
			var json={'idClues':$scope.dato.clues, 'cerrado':1};
			
			$http.put(URLS.BASE_API+'Evaluacion/' + id, json)
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
    //Lista
      $scope.index = function(ruta) 
      {
          $scope.ruta=ruta;  
          var uri=$scope.url;
       
          if(uri.search("nuevo")==-1)
          $scope.init();     
      };

	    $scope.init = function(buscar,columna) 
		{
			var url=$scope.ruta;
			
			var pagina=$scope.paginacion.pag;
			var limite=$scope.paginacion.lim;
		
			if(!angular.isUndefined(buscar))
				limite=limite+"&columna="+columna+"&valor="+buscar+"&buscar=true";


	        CrudDataApi.lista(url+'?pagina=' + pagina + '&limite=' + limite, function (data) {
	        if(data.status  == '407')
	        	$window.location="acceso";

	      		if(data.status==200)
	      		{
	    			$scope.datos = data.data;
	    			$scope.paginacion.paginas = data.total;
	      		}
	      		else
	      		{
	    			flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
	      		}
	      		$scope.cargando = false;
	        },function (e) {
	      		errorFlash.error(e);
	      		$scope.cargando = false;
	        });
	    };  

	    $scope.siguiente = function() 
	    {
	        if ($scope.paginacion.pag < $scope.paginacion.paginas) 
	        {
		    	$scope.paginacion.pag=$scope.paginacion.pag+$scope.paginacion.lim;
		      	$scope.init();
	        }
	    };
	    $scope.anterior = function() 
	    {
	        if ($scope.paginacion.pag > 1) 
	        {
	      		$scope.paginacion.pag=$scope.paginacion.pag-$scope.paginacion.lim;
	      		$scope.init();
	        }
	    };

	    $scope.primero = function() 
	    {
	        
	        $scope.paginacion.pag=1;
	        $scope.init();	        
	    };
	    $scope.ultimo = function() 
	    {
	        
	        $scope.paginacion.pag=$scope.paginacion.paginas-$scope.paginacion.lim+1;
	        $scope.init();
	        
	    };
	    $scope.buscarL = function(buscar,columna) 
	  {
		  	$scope.init(buscar,columna);
	  };	
		//Ver
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
		
		//Modificar
		$scope.modificar = function(id) 
		{    
		  var url=$scope.ruta;
		  var json=$scope.dato;
		  
		  if(json)
		  {
			CrudDataApi.editar(url, id, json, function (data) {
		  if(data.status  == '407')
			$window.location="acceso";
		  
		  if(data.status==200)
		  {
			  flash('success', data.messages);
		  }
		  else
		  {
			  flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
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

						if(url.search("Modulo")>-1||url.search("modulo")>-1)    
						{
						    MenuOption.preparar();
						    $scope.$on('menuInicio', function() {
						  $scope.menuOptions = MenuOption.menu;
						    });
						}

						$location.path(uri).search({id: data.data.id});
			  		}
			  		else
			  		{
						flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
			  		}
			  		$scope.cargando = false;
			    },function (e) {
			  		errorFlash.error(e);
			  		$scope.cargando = false;
			    }); 
			}    
		};

		//Borrar
	    $scope.borrar = function(id, $index) 
	    {    
	        var op=1;
	        if(angular.isUndefined(id))
	        {
	      		id=$location.search().id;
	      		op=0;
	        }
	        if ($window.confirm('Esta seguro?')) 
	        {   
	      		var url=$scope.ruta;

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

	        			if(url.search("Modulo")>-1||url.search("modulo")>-1)    
	        			{
	      					MenuOption.preparar();
	      					$scope.$on('menuInicio', function() {
	    						$scope.menuOptions = MenuOption.menu;
	      					});
	        			}
	        			$scope.cargando = false;
				    }
				    else
				    {
				        flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
				    }
	    			$scope.cargando = false;
	      		},function (e) {
				    errorFlash.error(e);
				    $scope.cargando = false;
	      		}); 
	        } 	       
	    };
	}])
})();