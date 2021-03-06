(function(){
/**
* @ngdoc object
* @name Catalogos.CrudCtrl
* @description
* Controlador general que maneja el CRUD(crear,leer,actualizar,eliminar) de la pagina
*/
	
	'use strict';
    angular.module('CrudModule')
    .controller('CrudCtrl',
           ['$rootScope', '$translate', '$window', '$http', '$scope', 'CrudDataApi', '$mdSidenav','$location','$mdBottomSheet', 'Auth','Menu','errorFlash', 'flash', '$mdToast', 'URLS', 
    function($rootScope,   $translate,   $window,   $http,   $scope,   CrudDataApi,   $mdSidenav,  $location,  $mdBottomSheet,   Auth,  Menu,  errorFlash,   flash,   $mdToast,   URLS){

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
/**
* @ngdoc method
* @name Catalogos.CrudCtrl#onOrderChange
* @methodOf Catalogos.CrudCtrl
*
* @description
* Evento para incializar el ordenamiento segun la columna clickeada
* @param {string} order campo para el ordenamiento  
*/
	$scope.onOrderChange = function (order) {
		$scope.query.order=order;
		$scope.cargando = true;
		$scope.init(); 
	};
/**
* @ngdoc method
* @name Catalogos.CrudCtrl#onOrderChange
* @methodOf Catalogos.CrudCtrl
*
* @description
* Evento para el control del paginado.
* @param {int} page pagina actual
* @param {int} limit resultados por pagina 
*/
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
/**
* @ngdoc method
* @name Catalogos.CrudCtrl#onOrderChange
* @methodOf Catalogos.CrudCtrl
*
* @description
* Evento para el boton nuevo, redirecciona a la vista nuevo
*/
	
	$scope.nuevo = function()
	{
	    var uri=$scope.url.split('/');

	    uri="/"+uri[1]+"/nuevo";
	    $location.path(uri).search({id: null});
	}

	$scope.showSearch = false;
	$scope.listaTemp={};
	$scope.moduloName=angular.uppercase($location.path().split('/')[1]);
/**
* @ngdoc method
* @name Catalogos.CrudCtrl#mostrarSearch
* @methodOf Catalogos.CrudCtrl
*
* @description
* Oculta o muestra la barra de busqueda en las vistas tipo lista.
* @param {int} t bandera para regresar los datos antes de la busqueda
*/	
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
/**
* @ngdoc method
* @name Catalogos.CrudCtrl#index
* @methodOf Catalogos.CrudCtrl
*
* @description
* inicializa las rutas para crear los href correspondientes en la vista actual
* @param {string} ruta ruta del módulo actual
*/	

	$scope.index = function(ruta) 
	{
	  $scope.ruta=ruta;  
	  var uri=$scope.url;

	  if(uri.search("nuevo")==-1)
	  $scope.init();     
	};

/**
* @ngdoc method
* @name Catalogos.CrudCtrl#init
* @methodOf Catalogos.CrudCtrl
*
* @description
* obtiene los datos necesarios para crear el grid (listado) con ayuda del servicio CrudDataApi
* @param {string} buscar contiene el texto a buscar en la base de datos
* @param {string} columna contiene el nombre de la columna en donde hacer la busqueda 
*/		
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
/**
* @ngdoc method
* @name Catalogos.CrudCtrl#buscarL
* @methodOf Catalogos.CrudCtrl
*
* @description
* incia la busqueda con los parametros, columna = campo donde buscar, buscar = valor para la busqueda
* @param {string} buscar contiene el texto a buscar en la base de datos
* @param {string} columna contiene el nombre de la columna en donde hacer la busqueda 
*/	
	$scope.buscarL = function(buscar,columna) 
	{
	    $scope.cargando = true;
	  	$scope.init(buscar,columna);
	};

/**
* @ngdoc method
* @name Catalogos.CrudCtrl#ver
* @methodOf Catalogos.CrudCtrl
*
* @description
* Muestra los datos del elemento que se le pase como parametro
* @param {string} ruta contiene la ruta para hacer la petición a la api
*/	       
    $scope.ficha = function(ruta) 
    {
		alert(ruta);
	}
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
/**
* @ngdoc method
* @name Catalogos.CrudCtrl#modificar
* @methodOf Catalogos.CrudCtrl
*
* @description
* Actualiza el recurso con los datos que envia el usuario
* @param {int} id contiene el identificador del elemento a modificar
*/	   	
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
		});    
	  }
	};

/**
* @ngdoc method
* @name Catalogos.CrudCtrl#borrar
* @methodOf Catalogos.CrudCtrl
*
* @description
* Elimina el recurso especificado
* @param {int} id contiene el identificador del elemento a eliminar
* @param {int} $index contiene el identificador del elemento a quitar del moodelo en caso de que el evento se ejecute en un listado
*/	 	 

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

/**
* @ngdoc method
* @name Catalogos.CrudCtrl#guardar
* @methodOf Catalogos.CrudCtrl
*
* @description
* Envia la petición para crear un nuevo registro con los datos especificados
* @param {object} form para identificar el formulario que lanzo la petición para procesar los datos y limpiar el formulario una vez se reciba un mensaje de confirmacion de parte de la api
*/	
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
	  });     
	};

  }])
})();