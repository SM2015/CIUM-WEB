(function(){
	'use strict';
    angular.module('CrudModule')
    .controller('CrudCtrl',
           ['$rootScope', '$translate', '$window', '$http', '$scope', 'CrudDataApi', '$mdSidenav','$location','$mdBottomSheet', 'Auth','Menu','errorFlash', 'flash', '$mdToast', 'URLS', 
    function($rootScope,   $translate,   $window,   $http,   $scope,   CrudDataApi,   $mdSidenav,  $location,  $mdBottomSheet,   Auth,  Menu,  errorFlash,   flash,   $mdToast,   URLS){

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
                      {id:"nombre", nombre:$translate.instant('NOMBRE')},
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

    $scope.ir = function(path){
        $location.path(path).search({id: null});
    };
    $scope.nuevo = function()
    {
        var uri=$scope.url.split('/');

        uri="/"+uri[1]+"/nuevo";
        $location.path(uri).search({id: null});
    }

    //export
    $scope.excel = function()
    {
        var url = $scope.ruta;
        var json={tabla:url,tipo:'xlsx'};
        CrudDataApi.crear('Export', json, function (data) {
            $window.open(URLS.BASE_API+"ExportOpen")
          },function (e) {
            errorFlash.error(e);
            $scope.cargando = false;
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

      $scope.init = function(buscar) 
		{
			var url=$scope.ruta;
			
			var pagina=$scope.paginacion.pag;
			var limite=$scope.paginacion.lim;
		
			if(!angular.isUndefined(buscar))
				limite=limite+"&columna="+$scope.columna+"&valor="+$scope.buscar+"&buscar=true";


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
      $scope.buscarL = function(buscar) 
		{
		  	$scope.init(buscar);
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
        });    
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

    // Guardar
      $scope.guardar = function(form) 
      {
          
          var url=$scope.ruta;
          var json=$scope.dato;

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
      };


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

  }])
})();