(function(){
	'use strict';
	angular.module('DashboardModule')
	.controller('DashboardCtrl',
	       ['$rootScope', '$scope', '$translate',  '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash', 'listaOpcion', 'Criterios', 'CrudDataApi', 'URLS', 
	function($rootScope,   $scope, $translate,    $mdSidenav,  $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,   listaOpcion,   Criterios,   CrudDataApi, URLS){
	
		 $scope.menuSelected = "/"+$location.path().split('/')[1];
	    $scope.menu = Menu.getMenu();
	    $scope.fecha_actual = new Date();
	    
	    $scope.cargando = true;

	    $scope.ruta="";
    $scope.url=$location.url();

    $scope.paginationLabel = {
      text: $translate.instant('ROWSPERPAGE'),
      of: $translate.instant('DE')
    };

	    

	    
	    // data table
    $scope.selected = [];

  $scope.query = {
    filter: '',
    order: 'id',
    limit: 5,
    page: 1
  };


  $scope.onOrderChange = function (order) {
    $scope.query.order=order;
    $scope.cargando = true;
    $scope.init(); 
  };


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
		
	}])
	
	.controller('abastoController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, EvaluacionId ) {
		
		$scope.abasto = true;
	
		$scope.contador=0;
		$scope.parametro={};
		$scope.bread=[];
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verAbasto="";
		$scope.dato = {};
		$scope.dimension = [];

		$scope.hide = function() {
			$mdDialog.hide();
		};

		$scope.chartClick  = function (event) 
		{ 
	  var points = $scope.chart.getBarsAtEvent( event ) ;	
	  var campo=""; var nivel="";
	  
	  $scope.parametro[$scope.contador]=points[0].label;
	  if($scope.contador==0)
	  {
		campo="mes";nivel="month";  
		$scope.parDimension[0]=" and anio = '"+points[0].label+"'";
		$scope.bread.push({label:"Año: "+points[0].label});
	  }
	  if($scope.contador==1)
	  {	  	
	  	campo="jurisdiccion";nivel="jurisdiccion"; 
	  	$scope.parDimension[1]=$scope.parDimension[0]+" and month='"+points[0].label+"'"
		$scope.bread.push({label:"Mes: "+points[0].label});
	
	  }
	  if($scope.contador==2)
	  {
		campo="zona";nivel="zona"; 
		$scope.parDimension[2]=$scope.parDimension[1]+" and jurisdiccion = '"+points[0].label+"'";
		$scope.bread.push({label:"Jurisdiccion: "+points[0].label}); 
	  } 
	  if($scope.contador==3)
	  {
		campo="clues";nivel="clues"; 
		$scope.parDimension[3]=$scope.parDimension[2];
		$scope.bread.push({label:"Equipo: "+points[0].label}); 
	  } 
	  
	  if($scope.contador==4)
	  {	
	  	  	
		var posision=$scope.contador-1;
		$scope.dibujarGrafico('abastoClues?anio='+$scope.parametro[0]+'&mes='+$scope.parametro[1]+'&clues='+points[0].label+"&parametro="+$scope.parametro[posision]) 		
		$scope.bread.push({label:"Clues: "+points[0].label}); 
	  }

	  if($scope.contador<4)
	  {
	  	var posision=$scope.contador;
	  	var parametro=$scope.parametro[posision];
	  	$scope.irDibujar(campo,
	  						$scope.parDimension[$scope.contador],
	  						nivel,
	  						(posision+1),
	  						parametro);
	  }
	   if($scope.contador==5)
	   {	   				
			var punto=points[0].label;
			punto=punto.split('#');
			$scope.parametro[$scope.contador]=punto[1];
			   
			$scope.showModalCriterio = !$scope.showModalCriterio;
			EvaluacionId.setId(punto[1]);
			$mdDialog.show({
		      controller: DialogAbasto,
		      templateUrl: 'src/dashboard/views/verAbasto.html',
		      parent: angular.element(document.body),
		    })					
			
		}
		if($scope.contador<5)
			$scope.contador++;
		};
		
		$scope.dibujarGrafico = function (url)
		{
		  $scope.abasto=true;
		  $http.get(URLS.BASE_API+url)     
		  .success(function(data, status, headers, config) 
		  {   
			$scope.data  = data.data; 
		  	$scope.abasto=false;
		  })
		  .error(function(data, status, headers, config) 
		  {
			errorFlash.error(data);
			$scope.abasto=false;
		  });
		};
	
		
		$scope.isFullscreen = false;
	
		$scope.toggleFullScreen = function(e) 
		{
	  		$scope.isFullscreen = !$scope.isFullscreen;
	
		  
		}
		
		$scope.regresar = function()
		{  
			if($scope.contador>0)  
		  		$scope.contador--;
		  	var temp=[];
		
			for(var x=0;x<$scope.contador;x++)
			temp.push($scope.bread[x]);
			$scope.bread=temp;
			var campo="";
			if($scope.contador==0)
			{    
				$scope.dibujarGrafico("abasto?campo=anios&valor= and anio='"+$scope.parametro[0]+"'&nivel=anio");
			}
			if($scope.contador==1)
			{
				var parametro=" and anio='"+$scope.parametro[0]+"' and month='"+$scope.parametro[1]+"'";
				$scope.dibujarGrafico('abasto?campo=mes&valor='+parametro+'&nivel=mes');
			}
			if($scope.contador==2)
			{
				campo="jurisdiccion"; 
			}
			if($scope.contador==3)
			{
				campo="zona"; 
			}
			if($scope.contador==4)
			{					 	
				campo="clues"; 
			}
			if($scope.contador>1)
			{
				var posision=$scope.contador-1;
			  	$scope.irDibujar(campo,
		  						$scope.parDimension[posision],
		  						campo,
		  						posision,
		  						$scope.parametro[posision]);
			}
		}
		
		$scope.recargar = function()
		{  
		  $scope.dibujarGrafico('abasto?campo=anio&valor=&nivel=anio');
		  $scope.contador=0;
		  $scope.parametro={};
		  $scope.bread=[];
		  $scope.datos={};
		  $scope.dimension={};
		  $scope.parDimension={};
		  $scope.parametro = [];
		};
		
		$scope.irDibujar = function(campo,valor,nivel,c,ultimo)
		{
			$scope.dibujarGrafico('abasto?campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo);
		}
		$scope.dimensiones = function(campo,valor,nivel,c,ultimo)
		{
	  		$http.get(URLS.BASE_API+'abastoDimension?campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo)     
		  	.success(function(data, status, headers, config) 
		  	{   
				$scope.datos[c] = data.data; 
				if(c==4)
				{
					$scope.repos = data.data.map( function (repo) {
							repo.value = repo.nombre.toLowerCase();
							return repo;
						}); 
				}
				
				$scope.dibujarGrafico('abasto?campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo);
		  	})
		  	.error(function(data, status, headers, config) 
			{
				$scope.datos[c]={};
				$scope.dimension[c]={};
			});
		};
		
		$scope.parDimension={};
		$scope.getDimension = function(campo,nivel,c)
		{
		  if(c==1)
			$scope.parDimension[0]=" and anio = '"+$scope.dimension[0]+"'";
		  if(c==2)
			$scope.parDimension[1]=$scope.parDimension[0]+" and mes between "+$scope.dimension[1];
		  if(c==3)
			$scope.parDimension[2]=$scope.parDimension[1]+" and jurisdiccion = '"+$scope.dimension[2]+"'";
		  if(c==4)
			$scope.parDimension[3]=$scope.parDimension[2];
		
		  $scope.dimensiones(campo,$scope.parDimension[c-1],nivel,c,$scope.dimension[c-1]);
		};
		
		//autocomplete
		$scope.repos = {};
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
				$scope.dimension[4]=item.clues;
				$scope.completar();
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
		
		$scope.toggleModal = function(ev)
		{	
			$scope.catVisible=false;
			$scope.umVisible=true;
			
			$scope.contador=0;
			$scope.parametro={};
			$scope.bread=[];
			$scope.datos={};
			$scope.dimension={};
			$scope.parDimension={};
			$scope.parametro = [];

		    $scope.showModal = !$scope.showModal;		    
		    $scope.editDialog = $mdDialog;
		    $scope.editDialog.show({
		    		targetEvent: ev,
		    		
		    		scope: $scope.$new(),
			        templateUrl: 'src/dashboard/views/dialog.html',
			        clickOutsideToClose: true			        			        	  
		    });
		    
		    $scope.dimensiones('anio','','anio',0);		    
		};
		
		$scope.completar = function()
		{ 		
		  if(!angular.isUndefined($scope.dimension[2])&&$scope.dimension[4]!=null)
		  { 
		    $scope.abasto=true;
			$http.get(URLS.BASE_API+'abastoClues?anio='+$scope.dimension[0]+'&mes='+$scope.dimension[1]+'&clues='+$scope.dimension[4])     
			.success(function(data, status, headers, config) 
			{ 				
				$scope.bread=[];  
				$scope.data = data.data; 
				
				if($scope.dimension[0]!="")
					$scope.bread.push({label:"Año: "+$scope.dimension[0]});
				if($scope.dimension[1]!="")
					$scope.bread.push({label:"Bimestre: "+$scope.dimension[1]});
				if($scope.dimension[2]!="")
					$scope.bread.push({label:"Jurisdiccion: "+$scope.dimension[2]});
				if($scope.dimension[3]!="")
					$scope.bread.push({label:"Zona: "+$scope.dimension[3]});
				if($scope.dimension[4]!="")
					$scope.bread.push({label:"Clues: "+$scope.dimension[4]});
			
				$scope.contador=5;
				$scope.parametro[0]=$scope.dimension[0];
				$scope.parametro[1]=$scope.dimension[1];
				$scope.parametro[2]=$scope.dimension[4];
				$scope.abasto=false;			
				   
			})
			.error(function(data, status, headers, config) 
			{
				errorFlash.error(data);
				$scope.abasto=false;
			});
		  }
		};
		$scope.dibujarGrafico('abasto?campo=anio&valor=&nivel=anio');
	
	
	
		$scope.options =  {
	
	// Sets the chart to be responsive
	responsive: true,
	
	//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
	scaleBeginAtZero : true,
	
	//Boolean - Whether grid lines are shown across the chart
	scaleShowGridLines : true,
	
	//String - Colour of the grid lines
	scaleGridLineColor : "rgba(0,0,0,.05)",
	
	//Number - Width of the grid lines
	scaleGridLineWidth : 1,
	
	//Boolean - If there is a stroke on each bar
	barShowStroke : true,
	
	//Number - Pixel width of the bar stroke
	barStrokeWidth : 5,
	
	//Number - Spacing between each of the X value sets
	barValueSpacing : 5,
	
	//Number - Spacing between data sets within X values
	barDatasetSpacing : 1,
	
	//String - A legend template
	legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].fillColor%>"></span><%if(datasets[i].label){ %><%=datasets[i].label%><%}%></li><%}%></ul>'
		};
	})
	
	
	.controller('calidadController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, EvaluacionShow, EvaluacionId ) {
		
		$scope.calidad = true;
	
		$scope.contador=0;
		$scope.parametro={};
		$scope.bread=[];
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verCalidad="";
		$scope.dato = {};
		$scope.dimension = [];

		$scope.hide = function() {
			$mdDialog.hide();
		};
		$scope.chartClick  = function (event) 
		{ 
	  var points = $scope.chart.getPointsAtEvent( event ) ;
	
	  var campo=""; var nivel="";
	  
	  $scope.parametro[$scope.contador]=points[0].label;
	  if($scope.contador==0)
	  {
		campo="mes";nivel="month";  
		$scope.parDimension[0]=" and anio = '"+points[0].label+"'";
		$scope.bread.push({label:"Año: "+points[0].label});
	  }
	  if($scope.contador==1)
	  {	  	
	  	campo="jurisdiccion";nivel="jurisdiccion"; 
	  	$scope.parDimension[1]=$scope.parDimension[0]+" and month='"+points[0].label+"'"
		$scope.bread.push({label:"Mes: "+points[0].label});
	
	  }
	  if($scope.contador==2)
	  {
		campo="zona";nivel="zona"; 
		$scope.parDimension[2]=$scope.parDimension[1]+" and jurisdiccion = '"+points[0].label+"'";
		$scope.bread.push({label:"Jurisdiccion: "+points[0].label}); 
	  } 
	  if($scope.contador==3)
	  {
		campo="clues";nivel="clues"; 
		$scope.parDimension[3]=$scope.parDimension[2];
		$scope.bread.push({label:"Equipo: "+points[0].label}); 
	  } 
	  
	  if($scope.contador==4)
	  {	
	  	  	
		var posision=$scope.contador-1;
		$scope.dibujarGrafico('calidadClues?anio='+$scope.parametro[0]+'&mes='+$scope.parametro[1]+'&clues='+points[0].label+"&parametro="+$scope.parametro[posision]) 		
		$scope.bread.push({label:"Clues: "+points[0].label}); 
	  }

	  if($scope.contador<4)
	  {
	  	var posision=$scope.contador;
	  	var parametro=$scope.parametro[posision];
	  	$scope.irDibujar(campo,
	  						$scope.parDimension[$scope.contador],
	  						nivel,
	  						(posision+1),
	  						parametro);
	  }
	   if($scope.contador==5)
	   {	   				
			var punto=points[0].label;
			punto=punto.split('#');
			$scope.parametro[$scope.contador]=punto[1];
			   
			$scope.showModalCriterio = !$scope.showModalCriterio;
			EvaluacionId.setId(punto[1]);
			$mdDialog.show({
		      controller: DialogCalidad,
		      templateUrl: 'src/dashboard/views/verCalidad.html',
		      parent: angular.element(document.body),
		    })					
			
		}
		if($scope.contador<5)
			$scope.contador++;
		};    
		
	
		$scope.dibujarGrafico = function (url)
		{
	  		$scope.calidad = true;
			$http.get(URLS.BASE_API+url)     
			.success(function(data, status, headers, config) 
			{   
				$scope.data  = data.data; 
				if($scope.data.datasets[0].data.length==1)
				{
					$scope.data.datasets[0].data=[0,$scope.data.datasets[0].data[0]];
					$scope.data.labels=['',$scope.data.labels[0]];
				}
				$scope.calidad=false;
			})
			.error(function(data, status, headers, config) 
			{
				errorFlash.error(data);
				$scope.calidad=false;
			});
		};
	
		
		$scope.isFullscreen = false;
	
		$scope.toggleFullScreen = function(e) 
		{
			$scope.isFullscreen = !$scope.isFullscreen;
		
		  	
		}
		$scope.regresar = function()
		{    
		  	if($scope.contador>0)  
			  		$scope.contador--;
			 var temp=[];
			
			for(var x=0;x<$scope.contador;x++)
			temp.push($scope.bread[x]);
			$scope.bread=temp;
			var campo="";
			if($scope.contador==0)
			{    
				$scope.dibujarGrafico("calidad?campo=anios&valor= and anio='"+$scope.parametro[0]+"'&nivel=anio");
			}
			if($scope.contador==1)
			{
				var parametro=" and anio='"+$scope.parametro[0]+"' and month='"+$scope.parametro[1]+"'";
				$scope.dibujarGrafico('calidad?campo=mes&valor='+parametro+'&nivel=mes');
			}
			if($scope.contador==2)
			{
				campo="jurisdiccion"; 
			}
			if($scope.contador==3)
			{
				campo="zona"; 
			}
			if($scope.contador==4)
			{					 	
				campo="clues"; 
			}
			if($scope.contador>1)
			{
				var posision=$scope.contador-1;
			  	$scope.irDibujar(campo,
		  						$scope.parDimension[posision],
		  						campo,
		  						posision,
		  						$scope.parametro[posision]);
			}
		}
		
		$scope.recargar = function()
		{  
			$scope.dibujarGrafico('calidad?campo=anio&valor=&nivel=anio');
			$scope.contador=0;
			$scope.parametro={};
			$scope.bread=[];
			$scope.datos={};
			$scope.dimension={};
			$scope.parDimension={};
			$scope.parametro = [];
		};
		
		$scope.irDibujar = function(campo,valor,nivel,c,ultimo)
		{
			$scope.dibujarGrafico('calidad?campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo);
		};
		$scope.dimensiones = function(campo,valor,nivel,c,ultimo)
		{
	  		$http.get(URLS.BASE_API+'calidadDimension?campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo)     
	  		.success(function(data, status, headers, config) 
	  		{   
				$scope.datos[c] = data.data;  
				if(c==4)
				{
					$scope.repos = data.data.map( function (repo) {
							repo.value = repo.nombre.toLowerCase();
							return repo;
						}); 
				}  
	  			$scope.dibujarGrafico('calidad?campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo);
		  	})
		  	.error(function(data, status, headers, config) 
			{
				$scope.datos[c]={};
				$scope.dimension[c]={};
			});
		};
		
		$scope.parDimension={};
		$scope.getDimension = function(campo,nivel,c)
		{
		  if(c==1)
			$scope.parDimension[0]=" and anio = '"+$scope.dimension[0]+"'";
		  if(c==2)
			$scope.parDimension[1]=$scope.parDimension[0]+" and mes between "+$scope.dimension[1];
		  if(c==3)
			$scope.parDimension[2]=$scope.parDimension[1]+" and jurisdiccion = '"+$scope.dimension[2]+"'";
		  if(c==4)
			$scope.parDimension[3]=$scope.parDimension[2];
		
		  $scope.dimensiones(campo,$scope.parDimension[c-1],nivel,c,$scope.dimension[c-1]);
		}
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
				$scope.dimension[4]=item.clues;
				$scope.completar();
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
		
		$scope.toggleModal = function(ev)
		{ 
			$scope.catVisible=false;
			$scope.umVisible=true;
			
		    $scope.showModal = !$scope.showModal;
		    $scope.contador=0;
			$scope.parametro={};
			$scope.bread=[];
			$scope.datos={};
			$scope.dimension={};
			$scope.parDimension={};
			$scope.parametro = [];

		    $scope.showModal = !$scope.showModal;		    
		    $scope.editDialog = $mdDialog;
		    $scope.editDialog.show({
		    		targetEvent: ev,
		    		
		    		scope: $scope.$new(),
			        templateUrl: 'src/dashboard/views/dialog.html',
			        clickOutsideToClose: true			        			        	  
		    });
		    
		    $scope.dimensiones('anio','','anio',0);
		};
	
		$scope.completar = function()
		{    
	  		if(!angular.isUndefined($scope.dimension[2])&&$scope.dimension[4]!=null)
	  		{ 
				$scope.calidad = true;
				$http.get(URLS.BASE_API+'calidadClues?anio='+$scope.dimension[0]+'&mes='+$scope.dimension[1]+'&clues='+$scope.dimension[4])     
				.success(function(data, status, headers, config) 
				{  
		
					$scope.bread=[];  
					$scope.data = data.data; 
					
					if($scope.data.datasets[0].data.length==1)
					{
						$scope.data.datasets[0].data=[0,$scope.data.datasets[0].data[0]];
					  	$scope.data.labels=['',$scope.data.labels[0]];
					}

					if($scope.dimension[0]!="")
						$scope.bread.push({label:"Año: "+$scope.dimension[0]});
					if($scope.dimension[1]!="")
						$scope.bread.push({label:"Bimestre: "+$scope.dimension[1]});
					if($scope.dimension[2]!="")
						$scope.bread.push({label:"Jurisdiccion: "+$scope.dimension[2]});
					if($scope.dimension[3]!="")
						$scope.bread.push({label:"Zona: "+$scope.dimension[3]});
					if($scope.dimension[4]!="")
						$scope.bread.push({label:"Clues: "+$scope.dimension[4]});
				
					$scope.contador=5;
					$scope.parametro[0]=$scope.dimension[0];
					$scope.parametro[1]=$scope.dimension[1];
					$scope.parametro[2]=$scope.dimension[4];
					$scope.calidad=false;
		   
			})
			.error(function(data, status, headers, config) 
			{
				errorFlash.error(data);
				$scope.calidad=false;
			});
		}
	};
	$scope.dibujarGrafico('calidad?campo=anio&valor=&nivel=anio');
	
		
	
		$scope.options =  {
	
	// Sets the chart to be responsive
	responsive: true,
	
	///Boolean - Whether grid lines are shown across the chart
	scaleShowGridLines : true,
	
	//String - Colour of the grid lines
	scaleGridLineColor : "rgba(0,0,0,.05)",
	
	//Number - Width of the grid lines
	scaleGridLineWidth : 1,
	
	//Boolean - Whether the line is curved between points
	bezierCurve : true,
	
	//Number - Tension of the bezier curve between points
	bezierCurveTension : 0.4,
	
	//Boolean - Whether to show a dot for each point
	pointDot : true,
	
	//Number - Radius of each point dot in pixels
	pointDotRadius : 8,
	
	//Number - Pixel width of point dot stroke
	pointDotStrokeWidth : 5,
	
	//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
	pointHitDetectionRadius : 20,
	
	//Boolean - Whether to show a stroke for datasets
	datasetStroke : true,
	
	//Number - Pixel width of dataset stroke
	datasetStrokeWidth : 1,
	
	//Boolean - Whether to fill the dataset with a colour
	datasetFill : true,
	
	// Function - on animation progress
	onAnimationProgress: function(){},
	
	// Function - on animation complete
	onAnimationComplete: function(){},
	
	//String - A legend template
	legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].pointColor%>"></span><%if(datasets[i].label){ %><%=datasets[i].label%><%}%></li><%}%></ul>'
		};
	})
	
	
	.controller('pieController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog ) {
		
	
		
		$scope.pie = true;
	
		$scope.contador=0;
		$scope.parametro={};
		$scope.bread=[];
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verCalidad="";
		$scope.dato = {};
		$scope.datos = [];
		$scope.dimension = {};
	
		$scope.tipo="Abasto";
		
		$scope.hide = function() {
			$mdDialog.hide();
		};

		$scope.getTipo = function(tipo)
		{
			$scope.tipo=tipo;
			$scope.bread = [];
			$scope.datos[0] = {};
			$scope.datos[1] = {};
			$scope.dimension = [];
			$scope.dimensiones('anio','','anio',0);
			$scope.bread.push({label:tipo});
		};

		$scope.recargar = function()
		{			
			$scope.contador=0;
			$scope.parametro={};
			$scope.bread=[];
			$scope.datos={};
			$scope.dimension={};
			$scope.parDimension={};
			$scope.parametro = [];
			$scope.dibujarGrafico('pieVisita?tipo='+$scope.tipo);
		};
		
		$scope.irDibujar = function(campo,valor,nivel,c,ultimo)
		{
			$scope.dibujarGrafico('pieVisita?tipo='+$scope.tipo);
		};

		$scope.dimensiones = function(campo,valor,nivel,c,ultimo)
		{
			var url="calidadDimension";
			if($scope.tipo=="Abasto")
				url="abastoDimension";
	  		$http.get(URLS.BASE_API+url+'?campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo+"&tipo="+$scope.tipo)     
	  		.success(function(data, status, headers, config) 
	  		{   
				$scope.datos[c] = data.data;  
				if(c==4)
				{
					$scope.repos = data.data.map( function (repo) {
							repo.value = repo.nombre.toLowerCase();
							return repo;
						}); 
				}  
	  			$scope.dibujarGrafico('pieVisita?tipo='+$scope.tipo);
		  	})
		  	.error(function(data, status, headers, config) 
			{
				$scope.datos[c]={};
				$scope.dimension[c]={};
			});
		};
		
		$scope.parDimension={};
		$scope.getDimension = function(campo,nivel,c)
		{
		  	if(c==1)
				$scope.parDimension[0]=" and anio = '"+$scope.dimension[0]+"'";
		  	if(c==2)
				$scope.parDimension[1]=$scope.parDimension[0]+" and mes between "+$scope.dimension[1];
		  	if(c==3)
				$scope.parDimension[2]=$scope.parDimension[1]+" and jurisdiccion = '"+$scope.dimension[2]+"'";
		  	if(c==4)
				$scope.parDimension[3]=$scope.parDimension[2];
		
		  	$scope.dimensiones(campo,$scope.parDimension[c-1],nivel,c,$scope.dimension[c-1]);
		}		
		
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
				$scope.dimension[4]=item.clues;
				$scope.completar();
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
		
		$scope.toggleModal = function(ev)
		{ 
			$scope.catVisible=false;
			$scope.umVisible=true;
			
		    $scope.showModal = !$scope.showModal;
		    $scope.contador=0;
			$scope.parametro={};
			$scope.bread=[];
			$scope.datos={};
			$scope.dimension={};
			$scope.parDimension={};
			$scope.parametro = [];

		    $scope.showModal = !$scope.showModal;		    
		    $scope.editDialog = $mdDialog;
		    $scope.editDialog.show({
		    		targetEvent: ev,
		    		
		    		scope: $scope.$new(),
			        templateUrl: 'src/dashboard/views/dialog.html',
			        clickOutsideToClose: true			        			        	  
		    });
		    
		    $scope.dimensiones('anio','','anio',0);
		};
	
		$scope.completar = function()
		{    
			if(!angular.isUndefined($scope.dimension[2])&&$scope.dimension[4]!=null)
			{ 
				$scope.pie = true;
				$http.get(URLS.BASE_API+'pieVisita?tipo='+$scope.tipo)     
				.success(function(data, status, headers, config) 
				{  
		
					$scope.bread=[];  
					$scope.data = data.data; 
					
					if($scope.data.datasets[0].data.length==1)
					{
						$scope.data.datasets[0].data=[0,$scope.data.datasets[0].data[0]];
						$scope.data.labels=['',$scope.data.labels[0]];
					}

					if($scope.dimension[0]!="")
						$scope.bread.push({label:"Año: "+$scope.dimension[0]});
					if($scope.dimension[1]!="")
						$scope.bread.push({label:"Bimestre: "+$scope.dimension[1]});
					if($scope.dimension[2]!="")
						$scope.bread.push({label:"Jurisdiccion: "+$scope.dimension[2]});
					if($scope.dimension[3]!="")
						$scope.bread.push({label:"Zona: "+$scope.dimension[3]});
					if($scope.dimension[4]!="")
						$scope.bread.push({label:"Clues: "+$scope.dimension[4]});
	
					$scope.contador=5;
					$scope.parametro[0]=$scope.dimension[0];
					$scope.parametro[1]=$scope.dimension[1];
					$scope.parametro[2]=$scope.dimension[4];
					$scope.pie = false;
		   
				})
				.error(function(data, status, headers, config) 
				{
					errorFlash.error(data);
					$scope.pie = false;
				});
	  		}
		};	
		
		
		$scope.dibujarGrafico = function (url)
		{
			$scope.pie = true;
	  		$http.post(URLS.BASE_API+url,{dimension:$scope.dimension})     
	 	 	.success(function(data, status, headers, config) 
	  		{   
				$scope.data  = data.data; 
				$scope.dato = data.data;
				$scope.bread = [];
				
				var total=data.total;
				if(total==0) total = "No hay datos"; 

				$scope.bread.push({label:$scope.tipo});

				if(!angular.isUndefined($scope.dimension[0]))
					$scope.bread.push({label:"Año: "+$scope.dimension[0]});
				if(!angular.isUndefined($scope.dimension[1]))
					$scope.bread.push({label:"Bimestre: "+$scope.dimension[1]});
				if(!angular.isUndefined($scope.dimension[2]))
					$scope.bread.push({label:"Jurisdiccion: "+$scope.dimension[2]});
				if(!angular.isUndefined($scope.dimension[3]))
					$scope.bread.push({label:"Zona: "+$scope.dimension[3]});
				if(!angular.isUndefined($scope.dimension[4]))
					$scope.bread.push({label:"Clues: "+$scope.dimension[4]});

				$scope.bread.push({label:"Total: "+total});
				$scope.pie = false;
	  
	  		})
	  		.error(function(data, status, headers, config) 
	  		{
				errorFlash.error(data);
				$scope.pie = false;
	  		});
		};
	
		$scope.isFullscreen = false;
	
		$scope.toggleFullScreen = function(e) 
		{
	  		$scope.isFullscreen = !$scope.isFullscreen;
	
	  		
		};
	
		
		$scope.toggleModal = function(ev)
		{ 
			$scope.catVisible=true;
			$scope.biVisible=true;
			$scope.umVisible=true;
			$scope.showModal = !$scope.showModal;

			$scope.contador=0;
			$scope.parametro={};
			$scope.bread=[];
			$scope.datos={};
			$scope.dimension={};
			$scope.parDimension={};
			$scope.parametro = [];

		    $scope.showModal = !$scope.showModal;		    
		    $scope.editDialog = $mdDialog;
		    $scope.editDialog.show({
		    		targetEvent: ev,
		    		
		    		scope: $scope.$new(),
			        templateUrl: 'src/dashboard/views/dialog.html',
			        clickOutsideToClose: true			        			        	  
		    });
		    
		    $scope.dimensiones('anio','','anio',0);
		};
		
		$scope.dibujarGrafico('pieVisita?tipo='+$scope.tipo);
		$scope.bread.push({label:$scope.tipo});
	

	
		$scope.options =  {

      // Sets the chart to be responsive
      responsive: true,

      //Boolean - Whether we should show a stroke on each segment
      segmentShowStroke : true,

      //String - The colour of each segment stroke
      segmentStrokeColor : '#fff',

      //Number - The width of each segment stroke
      segmentStrokeWidth : 2,

      //Number - The percentage of the chart that we cut out of the middle
      percentageInnerCutout : 0, // This is 0 for Pie charts

      //Number - Amount of animation steps
      animationSteps : 100,

      //String - Animation easing effect
      animationEasing : 'easeOutBounce',

      //Boolean - Whether we animate the rotation of the Doughnut
      animateRotate : true,

      //Boolean - Whether we animate scaling the Doughnut from the centre
      animateScale : false,

      //String - A legend template
      legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'

		};
	})
	
	.controller('alertaController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog ) {
		
		$scope.alerta = true;
	
		$scope.contador=0;
		$scope.parametro={};
		$scope.bread=[];
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verCalidad="";
		$scope.dato = {};
		$scope.datos = [];
		$scope.dimension = [];

		$scope.hide = function() {
			$mdDialog.hide();
		};
	
		$scope.dibujarGrafico = function (url)
		{
	  		$scope.alerta = true;
			$http.get(URLS.BASE_API+url)     
			.success(function(data, status, headers, config) 
			{   
				$scope.dato  = data.data; 
				$scope.bread = [];
						
				$scope.bread.push({label:$scope.tipo});

				if(!angular.isUndefined($scope.dimension[0]))
					$scope.bread.push({label:"Año: "+$scope.dimension[0]});
				if(!angular.isUndefined($scope.dimension[1]))
					$scope.bread.push({label:"Bimestre: "+$scope.dimension[1]});
				if(!angular.isUndefined($scope.dimension[2]))
					$scope.bread.push({label:"Jurisdiccion: "+$scope.dimension[2]});
				if(!angular.isUndefined($scope.dimension[3]))
					$scope.bread.push({label:"Zona: "+$scope.dimension[3]});
				if(!angular.isUndefined($scope.dimension[4]))
					$scope.bread.push({label:"Clues: "+$scope.dimension[4]});
				$scope.alerta = false;
			})
			.error(function(data, status, headers, config) 
			{
				errorFlash.error(data);
				$scope.alerta = false;
			});
		};
	
		
		$scope.isFullscreen = false;
	
		$scope.toggleFullScreen = function(e) 
		{
			$scope.isFullscreen = !$scope.isFullscreen;
			
			
		}
		
		$scope.recargar = function()
		{  
			$scope.contador=0;
			$scope.parametro={};
			$scope.bread=[];
			$scope.datos={};
			$scope.dimension={};
			$scope.parDimension={};
			$scope.parametro = [];
			
			$scope.tipo="Abasto";
			$scope.bread.push({label:$scope.tipo});
			$scope.dibujarGrafico('alertaDash?tipo='+$scope.tipo+'&campo=&valor=&nivel=anio');  
		};

		

		$scope.irDibujar = function(campo,valor,nivel,c,ultimo)
		{
			$scope.dibujarGrafico('alertaDash?tipo='+$scope.tipo);
		};

		$scope.dimensiones = function(campo,valor,nivel,c,ultimo)
		{
			var url="calidadDimension";
			if($scope.tipo=="Abasto")
				url="abastoDimension";
	  		$http.get(URLS.BASE_API+url+'?campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo+"&tipo="+$scope.tipo)     
	  		.success(function(data, status, headers, config) 
	  		{   
				$scope.datos[c] = data.data;  
				if(c==4)
				{
					$scope.repos = data.data.map( function (repo) {
							repo.value = repo.nombre.toLowerCase();
							return repo;
						}); 
				}  
	  			$scope.dibujarGrafico('alertaDash?tipo='+$scope.tipo+'&campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo);
		  	})
		  	.error(function(data, status, headers, config) 
			{
				$scope.datos[c]={};
				$scope.dimension[c]={};
			});
		};
		
		$scope.parDimension={};
		$scope.getDimension = function(campo,nivel,c)
		{
		  	if(c==1)
				$scope.parDimension[0]=" and anio = '"+$scope.dimension[0]+"'";
		  	if(c==2)
				$scope.parDimension[1]=$scope.parDimension[0]+" and mes between "+$scope.dimension[1];
		  	if(c==3)
				$scope.parDimension[2]=$scope.parDimension[1]+" and jurisdiccion = '"+$scope.dimension[2]+"'";
		  	if(c==4)
				$scope.parDimension[3]=$scope.parDimension[2];
		
		  	$scope.dimensiones(campo,$scope.parDimension[c-1],nivel,c,$scope.dimension[c-1]);
		}	

		$scope.getTipo = function(tipo)
		{
			$scope.tipo=tipo;
			$scope.bread = [];
			$scope.datos[0] = {};
			$scope.datos[1] = {};
			$scope.dimension = [];
			$scope.dimensiones('anio','','anio',0);
			$scope.bread.push({label:tipo});
		};
		
	
	//autocomplete
		$scope.repos = {};
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
				$scope.dimension[4]=item.clues;
				$scope.completar();
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
		$scope.toggleModal = function(ev)
		{ 
			$scope.catVisible=true;
			$scope.umVisible=true;
			$scope.showModal = !$scope.showModal;

			$scope.contador=0;
			$scope.parametro={};
			$scope.bread=[];
			$scope.datos={};
			$scope.dimension={};
			$scope.parDimension={};
			$scope.parametro = [];

		    $scope.showModal = !$scope.showModal;		    
		    $scope.editDialog = $mdDialog;
		    $scope.editDialog.show({
		    		targetEvent: ev,
		    		
		    		scope: $scope.$new(),
			        templateUrl: 'src/dashboard/views/dialog.html',
			        clickOutsideToClose: true			        			        	  
		    });
		    
		    $scope.dimensiones('anio','','anio',0);
		};
	
		$scope.completar = function()
		{    
	 		$scope.dibujarGrafico('alertaDash?anio='+$scope.dimension[0]+'&mes='+$scope.dimension[1]+'&clues='+$scope.dimension[4]+'&tipo='+$scope.tipo);
		};
	
		
		$scope.tipo="Abasto";
		$scope.bread.push({label:$scope.tipo});
		$scope.dibujarGrafico('alertaDash?tipo='+$scope.tipo+'&campo=&valor=&nivel=anio');  			
	})
	
	
	
	.controller('globalController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog ) {
		
	
		
		$scope.global = true;
	
		$scope.contador=0;
		$scope.parametro={};
		$scope.bread=[];
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verCalidad="";
		$scope.dato = {};
		$scope.indicadores = {};
		$scope.datos = [];
		$scope.dimension = [];    
		
		$scope.hide = function() {
			$mdDialog.hide();
		};

		$scope.dimensiones = function(campo,valor,nivel,c,ultimo)
		{
	  		$http.get(URLS.BASE_API+'calidadDimension?campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo)     
	  		.success(function(data, status, headers, config) 
	  		{   
				$scope.datos[c] = data.data;  
				if(c==4)
				{
					$scope.repos = data.data.map( function (repo) {
							repo.value = repo.nombre.toLowerCase();
							return repo;
						}); 
				}  
	  			$scope.dibujarGrafico('CalidadGlobal?campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo); 
		  	})
		  	.error(function(data, status, headers, config) 
			{
				$scope.datos[c]={};
				$scope.dimension[c]={};
			});
		};
		
		$scope.parDimension={};
		$scope.getDimension = function(campo,nivel,c)
		{
		  if(c==1)
			$scope.parDimension[0]=" and anio = '"+$scope.dimension[0]+"'";
		  if(c==2)
			$scope.parDimension[1]=$scope.parDimension[0]+" and mes between "+$scope.dimension[1];
		  if(c==3)
			$scope.parDimension[2]=$scope.parDimension[1]+" and jurisdiccion = '"+$scope.dimension[2]+"'";
		  if(c==4)
			$scope.parDimension[3]=$scope.parDimension[2];
		
		  $scope.dimensiones(campo,$scope.parDimension[c-1],nivel,c,$scope.dimension[c-1]);
		}


		$scope.dibujarGrafico = function (url)
		{
			$scope.global = true;
			$scope.indicadores={};
			$scope.dato={};
			$http.get(URLS.BASE_API+url)     
			.success(function(data, status, headers, config) 
			{   
				$scope.dato = data.data;
				$scope.indicadores = data.indicadores;

				$scope.bread = [];
						
				$scope.bread.push({label:$scope.tipo});

				if(!angular.isUndefined($scope.dimension[0]))
					$scope.bread.push({label:"Año: "+$scope.dimension[0]});
				if(!angular.isUndefined($scope.dimension[1]))
					$scope.bread.push({label:"Bimestre: "+$scope.dimension[1]});
				if(!angular.isUndefined($scope.dimension[2]))
					$scope.bread.push({label:"Jurisdiccion: "+$scope.dimension[2]});
				if(!angular.isUndefined($scope.dimension[3]))
					$scope.bread.push({label:"Zona: "+$scope.dimension[3]});

				var total=data.total;
				if(total==0) total = "No hay datos"; 
					$scope.bread.push({label:"Total: "+total});
				$scope.global = false;

			})
			.error(function(data, status, headers, config) 
			{
				errorFlash.error(data);
				$scope.global = false;
			});
		};
	
		$scope.isFullscreen = false;
	
		$scope.toggleFullScreen = function(e) {
	  		$scope.isFullscreen = !$scope.isFullscreen;
	
	  		
		};
	
		$scope.recargar = function()
		{  
	  		$scope.contador=0;
			$scope.parametro={};
			$scope.bread=[];
			$scope.datos={};
			$scope.dato = {};
			$scope.indicadores = {};
			$scope.dimension={};
			$scope.parDimension={};
			$scope.parametro = [];

	  		$scope.dibujarGrafico('CalidadGlobal?campo=&valor=&nivel=anio');   
		};
	
		$scope.toggleModal = function(ev)
		{ 
			$scope.catVisible=false;
			$scope.umVisible=false;
	  		$scope.showModal = !$scope.showModal;
	
	  		$scope.contador=0;
			$scope.parametro={};
			$scope.bread=[];
			$scope.datos={};
			$scope.dato = {};
			$scope.indicadores = {};
			$scope.dimension={};
			$scope.parDimension={};
			$scope.parametro = [];

		    $scope.showModal = !$scope.showModal;		    
		    $scope.editDialog = $mdDialog;
		    $scope.editDialog.show({
		    		targetEvent: ev,
		    		
		    		scope: $scope.$new(),
			        templateUrl: 'src/dashboard/views/dialog.html',
			        clickOutsideToClose: true			        			        	  
		    });
		    
		    $scope.dimensiones('anio','','anio',0);
		};
		
		$scope.dibujarGrafico('CalidadGlobal?campo=&valor=&nivel=anio');
	})
	
	.controller('gaugeController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog ) {
		
	
		
		$scope.gauge = true; 
	
		$scope.contador=0;
		$scope.parametro={};
		$scope.bread=[];
		$scope.datos={};
	
		$scope.showModal = false;
		$scope.showModalCriterio = false;
		$scope.chart;
		$scope.verCalidad="";
		$scope.dato = {};
		$scope.datos = [];
		$scope.dimension = [];
	
		$scope.tipo="Abasto";
		
		$scope.hide = function() {
			$mdDialog.hide();
		};
		
		$scope.getTipo = function(tipo)
		{
			$scope.tipo=tipo;
			$scope.bread = [];
			$scope.datos[0] = {};
			$scope.datos[1] = {};
			$scope.dimension = [];
			$scope.dimensiones('anio','','anio',0);
			$scope.dibujarGrafico('hallazgoGauge?tipo='+$scope.tipo);
			$scope.bread.push({label:tipo});
		};

		$scope.irDibujar = function(campo,valor,nivel,c,ultimo)
		{
			$scope.dibujarGrafico('alertaDash?tipo='+$scope.tipo);
		};

		$scope.dimensiones = function(campo,valor,nivel,c,ultimo)
		{
			var url="calidadDimension";
			if($scope.tipo=="Abasto")
				url="abastoDimension";
	  		$http.get(URLS.BASE_API+url+'?campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo+"&tipo="+$scope.tipo)     
	  		.success(function(data, status, headers, config) 
	  		{   
				$scope.datos[c] = data.data;  
				if(c==4)
				{
					$scope.repos = data.data.map( function (repo) {
							repo.value = repo.nombre.toLowerCase();
							return repo;
						}); 
				}  
	  			$scope.dibujarGrafico('hallazgoGauge?tipo='+$scope.tipo+'&campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo);
		  	})
		  	.error(function(data, status, headers, config) 
			{
				$scope.datos[c]={};
				$scope.dimension[c]={};
			});
		};
		
		$scope.parDimension={};
		$scope.getDimension = function(campo,nivel,c)
		{
		  	if(c==1)
				$scope.parDimension[0]=" and anio = '"+$scope.dimension[0]+"'";
		  	if(c==2)
				$scope.parDimension[1]=$scope.parDimension[0]+" and mes between "+$scope.dimension[1];
		  	if(c==3)
				$scope.parDimension[2]=$scope.parDimension[1]+" and jurisdiccion = '"+$scope.dimension[2]+"'";
		  	if(c==4)
				$scope.parDimension[3]=$scope.parDimension[2];
		
		  	$scope.dimensiones(campo,$scope.parDimension[c-1],nivel,c,$scope.dimension[c-1]);
		}
	
		$scope.completar = function()
		{    	  
	  		$scope.dibujarGrafico('hallazgoGauge?campo=fin&valor='+$scope.parDimension[3]+'&nivel=fin&tipo='+$scope.tipo);
		};
		$scope.dibujarGrafico = function (url)
		{
			var anio="";var mes=""; var clues="";
			if(!angular.isUndefined($scope.dimension[0]))
				anio=$scope.dimension[0];
			if(!angular.isUndefined($scope.dimension[1]))
				mes=$scope.dimension[1];
			if(!angular.isUndefined($scope.dimension[4]))
				clues=$scope.dimension[4];

			url=url+"&anio="+anio+"&mes="+mes+"&clues="+clues;
			$scope.gauge = true; 
			$http.get(URLS.BASE_API+url)     
			.success(function(data, status, headers, config) 
			{   
				$scope.value = data.valor;
				$scope.upperLimit = data.total;
				$scope.lowerLimit = 0;
				$scope.unit = "";
				$scope.precision = 1;
				$scope.ranges = data.rangos;

				$scope.dato = data.data;

				$scope.bread = [];
						
				$scope.bread.push({label:$scope.tipo});

				if(!angular.isUndefined($scope.dimension[0]))
					$scope.bread.push({label:"Año: "+$scope.dimension[0]});
				if(!angular.isUndefined($scope.dimension[1]))
					$scope.bread.push({label:"Bimestre: "+$scope.dimension[1]});
				if(!angular.isUndefined($scope.dimension[2]))
					$scope.bread.push({label:"Jurisdiccion: "+$scope.dimension[2]});
				if(!angular.isUndefined($scope.dimension[3]))
					$scope.bread.push({label:"Zona: "+$scope.dimension[3]});
				if(!angular.isUndefined($scope.dimension[4]))
					$scope.bread.push({label:"Clues: "+$scope.dimension[4]});

				var total=data.total;
					if(total==0) total = "No hay datos"; 
				$scope.bread.push({label:"Total: "+total});
				$scope.gauge = false; 

			})
			.error(function(data, status, headers, config) 
			{
			errorFlash.error(data);
			$scope.gauge = false; 
			});
		};
	
		$scope.isFullscreen = false;
	
		$scope.toggleFullScreen = function(e) {
	  		$scope.isFullscreen = !$scope.isFullscreen;
	
			
		};
	
		$scope.recargar = function()
		{  
	  		$scope.tipo="Abasto"; 
	  		$scope.contador=0;
			$scope.parametro={};
			$scope.bread=[];
			$scope.datos={};
			$scope.dimension={};
			$scope.parDimension={};
			$scope.parametro = [];
	  		
	  		$scope.bread.push({label:$scope.tipo}); 
	  		$scope.dibujarGrafico('hallazgoGauge?campo=&valor=&nivel=anio&tipo='+$scope.tipo);    
		};
		
		//autocomplete
		$scope.repos = {};
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
				$scope.dimension[4]=item.clues;
				$scope.completar();
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
		
		$scope.toggleModal = function(ev)
		{ 
			$scope.catVisible=true;
			$scope.umVisible=true;
			$scope.showModal = !$scope.showModal;

			$scope.contador=0;
			$scope.parametro={};
			$scope.bread=[];
			$scope.datos={};
			$scope.dimension={};
			$scope.parDimension={};
			$scope.parametro = [];

		    $scope.showModal = !$scope.showModal;		    
		    $scope.editDialog = $mdDialog;
		    $scope.editDialog.show({
		    		targetEvent: ev,
		    		
		    		scope: $scope.$new(),
			        templateUrl: 'src/dashboard/views/dialog.html',
			        clickOutsideToClose: true			        			        	  
		    });
		    
		    $scope.dimensiones('anio','','anio',0);
		};
		
		$scope.dibujarGrafico('hallazgoGauge?campo=&valor=&nivel=anio&tipo='+$scope.tipo);
		$scope.bread.push({label:$scope.tipo});
	
		
	})
	function DialogAbasto($scope, $mdDialog, EvaluacionShow, EvaluacionId) {
		var id = EvaluacionId.getId();
		EvaluacionShow.ver('Evaluacion', id, function (data) {
          if(data.status  == '407')
            $window.location="acceso";

          if(data.status==200)
          {
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
        }); 

        EvaluacionShow.ver('CriterioEvaluacionVer', id, function (data) {
          if(data.status  == '407')
            $window.location="acceso";

          if(data.status==200)
          {
            $scope.criterios=data.data;
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

  		$scope.hide = function() {
    	$mdDialog.hide();
  	};
  }

  	function DialogCalidad($scope, $mdDialog, EvaluacionShow, EvaluacionId) {
		var id = EvaluacionId.getId();
		EvaluacionShow.ver('EvaluacionCalidad', id, function (data) {
          if(data.status  == '407')
            $window.location="acceso";

          if(data.status==200)
          {
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
        }); 

        EvaluacionShow.ver('CriterioEvaluacionCalidadVer', id, function (data) {
          if(data.status  == '407')
            $window.location="acceso";

          if(data.status==200)
          {
              $scope.total =  data.total;     
			  $scope.criterios = data.data.criterios;
			  $scope.marcados = data.data.datos; 
			  $scope.columnas = {}; $scope.indicadorColumna = [];
			
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

  		$scope.hide = function() {
    	$mdDialog.hide();
  	};  
}
})();