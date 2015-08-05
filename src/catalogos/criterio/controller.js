(function(){
	'use strict';
	angular.module('CriterioModule')
	.controller('CriterioCtrl',
	       ['$rootScope', '$translate', '$scope', '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash', 'listaOpcion', 'CrudDataApi', 'URLS', 
	function($rootScope,   $translate,   $scope,   $mdSidenav,  $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,   listaOpcion,   CrudDataApi,   URLS){
	
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
	    $scope.nuevo = function()
	    {
	        var uri=$scope.url.split('/');

	        uri="/"+uri[1]+"/nuevo";
	        $location.path(uri).search({id: null});
	    }

		$scope.criterio = [];
		$scope.criterio.indicador = {};
		$scope.treeClick =function(a)
		{
			var children = $("#"+a).parent('li.parent_li').find(' > ul > li');

			if (children.is(":visible")) {
				children.hide('fast');
				$("#"+a).attr('title', 'Expandir');
				$("#"+a).find('> md-icon').attr('md-svg-src','add').find("> svg >path").attr('d','M38 26H26v12h-4V26H10v-4h12V10h4v12h12v4z');
			} else {
				children.show('fast');
				$("#"+a).attr('title', 'Cerrar');
				$("#"+a).find('> md-icon').attr('md-svg-src','remove').find("> svg >path").attr('d','M38 26H10v-4h28v4z');
			}
		};
		$scope.che=[];
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
			
			var children = $("#"+c);
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
				}
				else
				{
					flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
				}
				$scope.cargando = false;
			});
		};
		$scope.seleccionado = function(data) 
		{
			$scope.criterio.indicador={}; var cone=[];
			angular.forEach(data, function(value, key) {					
				angular.forEach(value.cones, function(c, k) {
					cone.push(value.id+','+c.id);		
				});
				$('#LugarVerificacion'+value.id).parent("span").parent("li").parent("ul").parent("li").find(".principal").attr("style","background-color: cornflowerblue;");	
				$scope.criterio.indicador[value.id]={lugar:value.lugarVerificacion.id,cone:cone};													
				cone=[];
			});			
		}
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

					$scope.criterio=data.data;				
					$scope.seleccionado(data.data.indicadores);	
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
		    
		    var json=$scope.criterio;
			if(!$scope.validarIndicador())
			{
				json=false;
			}
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
		    var json={};
			json.nombre=$scope.criterio.nombre;
			json.indicador=$scope.criterio.indicador;
		    if($scope.validarIndicador())
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