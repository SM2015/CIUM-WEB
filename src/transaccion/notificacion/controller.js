(function(){
	'use strict';
	angular.module('NotificacionModule')
	.controller('NotificacionCtrl',
	       ['$rootScope', '$translate', '$scope', '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash',  'CrudDataApi', 'URLS', 'Notificaciones', 
	function($rootScope,   $translate,   $scope,   $mdSidenav,  $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,    CrudDataApi,   URLS,   Notificaciones){
	
	
		Notificaciones.preparar();
			
		$scope.$on('notificacionInicio', function() {
			$scope.notificaciones = Notificaciones.notificacion.data;
			$scope.total = Notificaciones.notificacion.total;
		});
		
		$scope.visto = function(id)
		{
			var json={};
			json.visto=1;
			$http.put(URLS.BASE_API+'Notificacion'+'/'+id,json)
			.success(function(data, status, headers, config) 
			{	
				Notificaciones.preparar();	
			})
		}
		
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
	    
	    $scope.ir = function(path){
	        $scope.menuSelected = path;
	       $location.path(path).search({id: null});
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
	}])
})();