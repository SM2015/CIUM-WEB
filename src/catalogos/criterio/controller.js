/**
* @ngdoc object
* @name Catalogos.CriterioCtrl
* @description
* Complemento del controlador CrudCtrl  para tareas especificas en criterios
*/
(function(){
	'use strict';
	angular.module('CriterioModule')
	.controller('CriterioCtrl',
	       ['$rootScope', '$translate', '$scope', '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash', 'listaOpcion', 'CrudDataApi', 'URLS', 
	function($rootScope,   $translate,   $scope,   $mdSidenav,  $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,   listaOpcion,   CrudDataApi,   URLS){
	
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
		order: 'Criterio.id',
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

	$scope.icono=[];
	$scope.criterio = [];
	$scope.criterio.indicador = {};
	
/**
* @ngdoc method
* @name Catalogos.CriterioCtrl#treeClick
* @methodOf Catalogos.CriterioCtrl
*
* @description
* Evento para expandir o colapsar el arbol de criterios por indicador
* @param {property} a id del area donde se genero el evento click  
*/	
	$scope.treeClick =function(a)
	{
		var children = angular.element(document.getElementById(a)).parent('li.parent_li').find('ul').find('li');
		
		if (children.attr("style")=="display: none;") {
			children.attr("style","display: ;");
			angular.element(document.getElementById(a)).attr('title', 'Expandir');
			$scope.icono[a]=true;
		} else {
			children.attr("style","display: none;");
			angular.element(document.getElementById(a)).attr('title', 'Cerrar');
			$scope.icono[a]=false;
		}
	};
	$scope.che=[];
/**
* @ngdoc method
* @name Catalogos.CriterioCtrl#treeClickCheck
* @methodOf Catalogos.CriterioCtrl
*
* @description
* Marca los checkbox al hacer click en cada uno y pinta el indicador al que pertenezca segun la valización
* @param {property} a id del indicador 
* @param {property} b bandera para determinar si tiene datos por defaul 
* @param {property} c id de los hijos del indicador
*/	
	$scope.treeClickCheck =function(a,b,c)
	{
		var cone = null;
		if($scope.criterio.indicador[a].hasOwnProperty("cone"))
			cone = $scope.criterio.indicador[a].cone;
		var lugar = 0;
		if($scope.criterio.indicador[a].hasOwnProperty("lugar"))
			lugar = $scope.criterio.indicador[a].lugar;
	
		if(lugar === null || angular.isUndefined(lugar))
		{
			delete $scope.criterio.indicador[a].lugar;
			lugar = 0;
		}
	
		if(cone === null || angular.isUndefined(cone) || cone.length<1)
		{
			delete $scope.criterio.indicador[a].cone;
			cone = null;
		}
		
		var children = angular.element(document.getElementById(c));
		if(cone==null & lugar==0)
		{				
			delete $scope.criterio.indicador[a];
			children.removeAttr("style");
		}
		else if(cone==null & lugar>0)	
			children.attr("style","background-color: red;");
		else if(cone!=null & lugar<1)	
			children.attr("style","background-color: darkorange;");
		else 
			children.attr("style","background-color: cornflowerblue;");
	
		if(b==-1)
		{
			$scope.che[a]=false;			
		}
		else
		{
			if(!$scope.che[a])
			{				
				$scope.che[a]=true;
			}
			if(b!=0)
			{
				if(!$scope.che[b])
					$scope.che[b]=true;
			}
		}
	};
/**
* @ngdoc method
* @name Catalogos.CriterioCtrl#opciones
* @methodOf Catalogos.CriterioCtrl
*
* @description
* Carga los datos como catalago de la url
* @param {string} url url para hacer la petición 
* @param {string} cat nombre del catalogo a crear
*/	
	
	$scope.opciones = function(url,cat) 
	{
		$scope.options=[];   
		listaOpcion.options(url).success(function(data)
		{
			if(data.status  == '407')
				$window.location="acceso";
				
			if(data.status==200)
			{
				$scope.options[cat]=data.data;	
				if(cat=="lugares")
					$scope.ver('Criterio');		
			}
			else
		{
			errorFlash.error(data);
		}
			$scope.cargando = false;
		});
	};
/**
* @ngdoc method
* @name Catalogos.CriterioCtrl#seleccionado
* @methodOf Catalogos.CriterioCtrl
*
* @description
* Marca los indicadores que ya contienen datos
* @param {object} data contiene el json con los datos
*/
	
	$scope.seleccionado = function(data) 
	{
		$scope.criterio.indicador={}; var cone=[];
		
		angular.forEach(data, function(value, key) {					
			angular.forEach(value.cones, function(c, k) {
				cone.push(value.id+','+c.id);		
			});
			angular.element(document.getElementById('indicador'+value.id)).attr("style","background-color: cornflowerblue;");
			
			$scope.criterio.indicador[value.id]={lugar:value.lugarVerificacion.id,cone:cone};
	
			cone=[];
		});			
	}
/**
* @ngdoc method
* @name Catalogos.CriterioCtrl#validarIndicador
* @methodOf Catalogos.CriterioCtrl
*
* @description
* Validar que en el indicador exista por lo menos un nivel de cone y el lugar de verificacion para poder ser insertado
*/
	
	$scope.validarIndicador = function() 
	{	
		var bien=true; var cone=0;	
		angular.forEach($scope.criterio.indicador, function(value, key) {					
			angular.forEach(value.cone, function(c, k) {
				cone++;		
			});	
	
			if(!value.hasOwnProperty("lugar")||cone==0)			
				bien=false;
			
		});	
		
		if(!bien)
			flash('danger', "Ooops! Ocurrio un error: Verifique que los indicadores seleccionados esten de color azul");
		return bien;		
	}
	
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

		$scope.cargando = true;
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
				$scope.id=data.data.id;
				$scope.dato=data.data;

				$scope.criterio=data.data;				
				$scope.seleccionado(data.data.indicadores);	

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
		var url=$scope.ruta;
		
		var json={};
		json.nombre=$scope.dato.nombre;					
		json.indicadores = $scope.getIndicadores($scope.criterio.indicador);
		
		if(!$scope.validarIndicador())
		{
			json=false;
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
	
/**
* @ngdoc method
* @name Catalogos.CriterioCtrl#getIndicadores
* @methodOf Catalogos.CriterioCtrl
*
* @description
* Formatea los datos del arbol para poder ser enviados a la api y esta pueda interpretarla
* @param {object} valores contiene el json con los datos del arbol
*/	
	$scope.getIndicadores = function(valores)
	{
		var indicadores = []; var i = 0;
		angular.forEach(valores, function(value, key) {
			var cones = [] ;
			angular.forEach(value["cone"], function(val, k) {
				var valor = val.split(",");	
				cones.push({"id": valor[1]});
			});
			indicadores.push({"id": key, "idLugarVerificacion": value["lugar"], "cones": cones});
		});
		return indicadores;
	}
	
	// Guardar
	$scope.guardar = function(form) 
	{
		
		var url=$scope.ruta;
		var json={};
		json.nombre=$scope.dato.nombre;					
		json.indicadores = $scope.getIndicadores($scope.criterio.indicador);
		
		if($scope.validarIndicador())
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
	}])
})();