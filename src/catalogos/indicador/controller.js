/**
* @ngdoc object
* @name Catalogos.IndicadorCtrl
* @description
* Complemento del controlador CrudCtrl  para tareas especificas en Indicador
*/
(function(){
	'use strict';
	angular.module('IndicadorModule')
	.controller('IndicadorCtrl',
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
	
	
	$scope.dato = {};
	$scope.colorColor = [];
	$scope.alertas = [];
	
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
/**
* @ngdoc method
* @name Catalogos.IndicadorCtrl#Alertas
* @methodOf Catalogos.IndicadorCtrl
*
* @description
* Obtiene las alertas del indicador
*/	
	$scope.Alertas = function() 
	{
		$scope.options=[];   
		listaOpcion.options("Alerta").success(function(data)
		{
			if(data.status  == '407')
				$window.location="acceso";
				
			if(data.status==200)
			{
				$scope.alertas = data.data;				
			}
			else
		{
			errorFlash.error(data);
		}
			$scope.cargando = false;
		});		
	};	
	$scope.dato.indicador_alertas=[];

/**
* @ngdoc method
* @name Catalogos.IndicadorCtrl#quitarAlerta
* @methodOf Catalogos.IndicadorCtrl
*
* @description
* Quitar una alerta de la lista 
* @param {int} $index posicion del elemento en la lista a quitar 
*/
	
	$scope.quitarAlerta = function($index) 
	{
		$scope.dato.indicador_alertas.splice($index, 1);		
	}
	
/**
* @ngdoc method
* @name Catalogos.IndicadorCtrl#calcularMinimo
* @methodOf Catalogos.IndicadorCtrl
*
* @description
* Crea la posicion minima para la alerta
* @param {int} t posicion del ultimo elemento en el listado para hacer el calculo siguiente
*/
	
	$scope.calcularMinimo = function(t) 
	{	
		if(!angular.isUndefined($scope.dato.indicador_alertas[t+1]))
		{
			$scope.dato.indicador_alertas[t+1].minimo=parseInt($scope.dato.indicador_alertas[t].maximo)+0.01;
			$scope.dato.indicador_alertas[t+1].maximo=parseInt($scope.dato.indicador_alertas[t+1].minimo)+10;
		}
	}
	
/**
* @ngdoc method
* @name Catalogos.IndicadorCtrl#agregarAlerta
* @methodOf Catalogos.IndicadorCtrl
*
* @description
* Agrega una linea mas al formulario de alertas
*/	
	$scope.agregarAlerta = function() 
	{	
		var t=$scope.dato.indicador_alertas.length;
		if(t>0)	
		{
			var valor=parseInt($scope.dato.indicador_alertas[t-1].maximo)+0.01;
			if(valor<100)
				$scope.dato.indicador_alertas.push({minimo:valor,maximo:(valor+10) > 100 ? 100 : valor+10,color:0});
		}
		else
			$scope.dato.indicador_alertas.push({minimo:0,maximo:0,color:0});
		
	};
	
/**
* @ngdoc method
* @name Catalogos.IndicadorCtrl#getIndexOf
* @methodOf Catalogos.IndicadorCtrl
*
* @description
* Valida si existe un elemento en una lista
* @param {string} val valor a buscar
* @param {int} index posicion del elemento 
*/		
	$scope.getIndexOf = function(val,index) 
	{	
		var l = $scope.alertas.length;
		var k = 0;
		for (k = 0; k < l; k = k + 1) 
		{
			if ($scope.alertas[k].id === parseInt(val)) 
			{
				$scope.colorColor[index] = $scope.alertas[k].color;
			}
		}
	};	
	
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
		var json=$scope.dato;
		
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
				}
			);    
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
		
	// Guardar
	$scope.guardar = function(form) 
	{	  
		var url=$scope.ruta;
		var json=$scope.dato;
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
			}
		);     
	};
	}])
})();