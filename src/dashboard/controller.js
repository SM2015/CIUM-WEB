(function(){
	'use strict';
	angular.module('DashboardModule')
	.controller('DashboardCtrl',
	       ['$rootScope', '$scope', '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', '$http', '$window', '$timeout', '$route', 'flash', 'errorFlash', 'listaOpcion', 'Criterios', 'CrudDataApi', 'URLS', 
	function($rootScope,   $scope,   $mdSidenav,  $location,  $mdBottomSheet,  Auth,  Menu,   $http,   $window,   $timeout,   $route,   flash,   errorFlash,   listaOpcion,   Criterios,   CrudDataApi, URLS){
	
		$scope.menuSelected = $location.path();
	    $scope.menu = Menu.getMenu();
	    $scope.fecha_actual = new Date();
	    
	    $scope.cargando = true;

	    $scope.ruta="";
	    $scope.url=$location.url();

	    $scope.tableCardIsEnabled = false;
	    $scope.tableIsSelectable = false;
	    $scope.tableIsSortable = true;
	    $scope.htmlContent = true;

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
		$scope.delay = 0;
		$scope.minDuration = 0;
		$scope.message = 'Cargando...';
		$scope.backdrop = true;
		$scope.abasto = null;
	
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
		  $scope.abasto = $http.get(URLS.BASE_API+url)     
		  .success(function(data, status, headers, config) 
		  {   
			$scope.data  = data.data; 
		  
		  })
		  .error(function(data, status, headers, config) 
		  {
			errorFlash.error(data);
		  });
		};
	
		
		$scope.isFullscreen = false;
	
		$scope.toggleFullScreen = function(e) 
		{
	  		$scope.isFullscreen = !$scope.isFullscreen;
	
		  if($scope.isFullscreen)
		  {
			$("#"+e).find('> md-icon').attr('md-svg-src','add').find("> svg >path").attr('d','M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z');}
		  else
		  {
			$("#"+e).find('> md-icon').attr('md-svg-src','add').find("> svg >path").attr('d','M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z');		
		  }
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
	  		$scope.abastoOpcion = $http.get(URLS.BASE_API+'abastoDimension?campo='+campo+'&valor='+valor+'&nivel='+nivel+"&parametro="+ultimo)     
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
		}
		
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
				$scope.dimension[2]=item.clues;
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
		    $scope.datos[0]={};$scope.datos[1]={};$scope.datos[2]={};$scope.datos[3]={};		    
		};
		
		$scope.completar = function()
		{ 		
		  if(!angular.isUndefined($scope.dimension[2])&&$scope.dimension[2]!=null)
		  { 
			$scope.abasto = $http.get(URLS.BASE_API+'abastoClues?anio='+$scope.dimension[0]+'&mes='+$scope.dimension[1]+'&clues='+$scope.dimension[4])     
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
			
				$scope.contador=3;
				$scope.parametro[0]=$scope.dimension[0];
				$scope.parametro[1]=$scope.dimension[1];
				$scope.parametro[2]=$scope.dimension[4];			
				   
			})
			.error(function(data, status, headers, config) 
			{
				errorFlash.error(data);
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
	barStrokeWidth : 2,
	
	//Number - Spacing between each of the X value sets
	barValueSpacing : 5,
	
	//Number - Spacing between data sets within X values
	barDatasetSpacing : 1,
	
	//String - A legend template
	legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].fillColor%>"></span><%if(datasets[i].label){ %><%=datasets[i].label%><%}%></li><%}%></ul>'
		};
	})
	
	
	.controller('calidadController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog, EvaluacionShow, EvaluacionId ) {
		$scope.delay = 0;
		$scope.minDuration = 0;
		$scope.message = 'Cargando...';
		$scope.backdrop = true;
		$scope.calidad = null;
	
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
		$scope.chartClick  = function (event) 
		{ 
	  var points = $scope.chart.getPointsAtEvent( event ) ;
	
	  if(points[0].label!=""&&points[0].label!=0)
	  {
	if($scope.contador==0)
	{
		$scope.parametro[$scope.contador]=points[0].label;    
		$scope.dibujarGrafico("calidad?campo=mes&valor= and anio='"+$scope.parametro[$scope.contador]+"'&nivel=month");
		$scope.bread.push({label:"Año: "+points[0].label});
	}
	if($scope.contador==1)
	{
		$scope.parametro[$scope.contador]=points[0].label;
		var parametro=" and anio='"+$scope.parametro[$scope.contador-1]+"' and month='"+points[0].label+"'";
		$scope.dibujarGrafico('calidad?campo=clues&valor='+parametro+'&nivel=clues');
		$scope.bread.push({label:"Mes: "+points[0].label});
	
	}
	if($scope.contador==2)
	{
		$scope.parametro[$scope.contador]=points[0].label;
		$scope.dibujarGrafico('calidadClues?anio='+$scope.parametro[0]+'&mes='+$scope.parametro[1]+'&clues='+$scope.parametro[2]) 
		$scope.bread.push({label:"Clues: "+points[0].label}); 
	} 
	if($scope.contador==3)
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
	if($scope.contador<3)
		$scope.contador++;  
	  }    
		};
	
		$scope.dibujarGrafico = function (url)
		{
	  
	  $scope.calidad = $http.get(URLS.BASE_API+url)     
	  .success(function(data, status, headers, config) 
	  {   
	$scope.data  = data.data; 
	if($scope.data.datasets[0].data.length==1)
	{
		$scope.data.datasets[0].data=[0,$scope.data.datasets[0].data[0]];
		$scope.data.labels=['',$scope.data.labels[0]];
	}
	  
	  })
	  .error(function(data, status, headers, config) 
	  {
	errorFlash.error(data);
	  });
		};
	
		
		$scope.isFullscreen = false;
	
		$scope.toggleFullScreen = function(e) {
	  $scope.isFullscreen = !$scope.isFullscreen;
	
	  if($scope.isFullscreen)
	  {
	$("#"+e).find('> md-icon').attr('md-svg-src','add').find("> svg >path").attr('d','M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z');}
	  else
	  {
	$("#"+e).find('> md-icon').attr('md-svg-src','add').find("> svg >path").attr('d','M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z');
	  }
		}
		$scope.regresar = function()
		{    
	  $scope.contador--;
	  var temp=[];
	
	  for(var x=0;x<$scope.contador;x++)
	temp.push($scope.bread[x]);
	  $scope.bread=temp;
	  if($scope.contador==1)
	  {    
	$scope.dibujarGrafico("calidad?campo=mes&valor= and anio='"+$scope.parametro[$scope.contador-1]+"'&nivel=month");
	  }
	  if($scope.contador==2)
	  {
	var parametro=" and anio='"+$scope.parametro[$scope.contador-2]+"' and month='"+$scope.parametro[$scope.contador-1]+"'";
	$scope.dibujarGrafico('calidad?campo=clues&valor='+parametro+'&nivel=clues');
	  }
		}
		$scope.recargar = function()
		{  
	  $scope.dibujarGrafico('calidad?campo=anio&valor=&nivel=anio');
	  $scope.contador=0;
	  $scope.parametro={};
	  $scope.bread=[];
		};
		$scope.dimensiones = function(campo,valor,nivel,c)
		{
	  $scope.calidadOpcion = $http.get(URLS.BASE_API+'calidadDimension?campo='+campo+'&valor='+valor+'&nivel='+nivel)     
	  .success(function(data, status, headers, config) 
	  {   
	$scope.datos[c] = data.data;  
			if(c==2)
				{
					$scope.repos = data.data.map( function (repo) {
							repo.value = repo.nombre.toLowerCase();
							return repo;
						}); 
				}  
	  })
		};
		$scope.parDimension={};
		$scope.getDimension = function(campo,nivel,c)
		{
	  if(c==1)
	$scope.parDimension[0]=" and anio = '"+$scope.dimension[0]+"'";
	  if(c==2)
	$scope.parDimension[1]=$scope.parDimension[0]+" and month='"+$scope.dimension[1]+"'";
	
	  $scope.dimensiones(campo,$scope.parDimension[c-1],nivel,c);
		}
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
				$scope.dimension[2]=item.clues;
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
		
		$scope.toggleModal = function(title)
		{ 
		$scope.catVisible=false;
		$scope.umVisible=true;
	  $scope.showModal = !$scope.showModal;
	
	  $scope.dimensiones('anio','','anio',0);
		};
	
		$scope.completar = function()
		{    
	  if(!angular.isUndefined($scope.dimension[2])&&$scope.dimension[2]!=null)
	  { 
	
	$scope.calidad = $http.get(URLS.BASE_API+'calidadClues?anio='+$scope.dimension[0]+'&mes='+$scope.dimension[1]+'&clues='+$scope.dimension[2])     
	.success(function(data, status, headers, config) 
	{  
		$scope.bread=[];  
		$scope.data = data.data; 
		if($scope.data.datasets[0].data.length==1)
		{
	  $scope.data.datasets[0].data=[0,$scope.data.datasets[0].data[0]];
	  $scope.data.labels=['',$scope.data.labels[0]];
		}
		$scope.bread.push({label:"Año: "+$scope.dimension[0]});
		$scope.bread.push({label:"Mes: "+$scope.dimension[1]});
		$scope.bread.push({label:"Clues: "+$scope.dimension[2]});
	
		$scope.contador=3;
		$scope.parametro[0]=$scope.dimension[0];
		$scope.parametro[1]=$scope.dimension[1];
		$scope.parametro[2]=$scope.dimension[2];
	
		   
	})
	.error(function(data, status, headers, config) 
	{
		errorFlash.error(data);
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
	pointDotRadius : 5,
	
	//Number - Pixel width of point dot stroke
	pointDotStrokeWidth : 2,
	
	//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
	pointHitDetectionRadius : 20,
	
	//Boolean - Whether to show a stroke for datasets
	datasetStroke : true,
	
	//Number - Pixel width of dataset stroke
	datasetStrokeWidth : 2,
	
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
		
	
		$scope.delay = 0;
		$scope.minDuration = 0;
		$scope.message = 'Cargando...';
		$scope.backdrop = true;
		$scope.pie = null;
	
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
		
		$scope.getTipo = function(tipo)
		{
			$scope.tipo=tipo;
			$scope.bread = [];
			$scope.datos[0] = {};
			$scope.datos[1] = {};
			$scope.dimension = [];
			$scope.dimensiones('anio','','anio',0);
			$scope.dibujarGrafico('pieVisita?tipo='+$scope.tipo);
			$scope.bread.push({label:tipo});
		};
		$scope.dimensiones = function(campo,valor,nivel,c)
		{
			$scope.pie = $http.get(URLS.BASE_API+'pieDimension?campo='+campo+'&valor='+valor+'&nivel='+nivel+'&tipo='+$scope.tipo)     
			.success(function(data, status, headers, config) 
			{   
			$scope.datos[c] = data.data; 
			$scope.jurisdicciones=data.jurisdiccion;
			
			$scope.completar();  
			});
		};
	
		$scope.parDimension={};
		$scope.getDimension = function(campo,nivel,c)
		{
			$scope.bread=[];
			if(c==1)
			{
				$scope.bread.push({label:$scope.tipo});
				$scope.bread.push({label:"Año: "+$scope.dimension[0]});
				$scope.parDimension[0]=" and anio = '"+$scope.dimension[0]+"'";
			}
			if(c==2)
			{
				$scope.bread.push({label:$scope.tipo});
				$scope.bread.push({label:"Año: "+$scope.dimension[0]});
				$scope.bread.push({label:"Mes: "+$scope.dimension[1]});
				$scope.parDimension[1]=$scope.parDimension[0]+" and mes between "+$scope.dimension[1]+"";
			}
			
			$scope.dimensiones(campo,$scope.parDimension[c-1],nivel,c);
		};
			
		$scope.completar = function()
		{    
			var year=""; var mes=""; var clues="";
			if(!angular.isUndefined($scope.dimension[0])&&$scope.dimension[0]!=null)
			{
				year=$scope.dimension[0];
			}
			if(!angular.isUndefined($scope.dimension[1])&&$scope.dimension[1]!=null)
			{
				mes=$scope.dimension[1];
			}
			if(!angular.isUndefined($scope.dimension[2])&&$scope.dimension[2]!=null)
			{
				$scope.bread=[];
				clues=$scope.dimension[2];
				$scope.bread.push({label:$scope.tipo});
				$scope.bread.push({label:"Año: "+$scope.dimension[0]});
				$scope.bread.push({label:"Mes: "+$scope.dimension[1]});
				$scope.bread.push({label:"Clues: "+clues});
			}
			$scope.dibujarGrafico('pieVisita?anio='+year+'&mes='+mes+'&clues='+clues+'&tipo='+$scope.tipo);
		};
		
		$scope.dibujarGrafico = function (url)
		{
	  $scope.pie = $http.get(URLS.BASE_API+url)     
	  .success(function(data, status, headers, config) 
	  {   
	$scope.data  = data.data; 
	
	$scope.dato = data.data;
	
	var total=data.total;
	if(total==0) total = "No hay datos"; 
	$scope.bread.push({label:"Total: "+total});
	  
	  })
	  .error(function(data, status, headers, config) 
	  {
	errorFlash.error(data);
	  });
		};
	
		$scope.isFullscreen = false;
	
		$scope.toggleFullScreen = function(e) {
	  $scope.isFullscreen = !$scope.isFullscreen;
	
	  if($scope.isFullscreen)
	  {
	$("#"+e).find('> md-icon').attr('md-svg-src','add').find("> svg >path").attr('d','M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z');}
	  else
	  {
	$("#"+e).find('> md-icon').attr('md-svg-src','add').find("> svg >path").attr('d','M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z');
	  }
		};
	
		$scope.recargar = function()
		{  
	  $scope.tipo="Abasto"; 
	  $scope.bread=[];
	  $scope.bread.push({label:$scope.tipo}); 
	  $scope.dibujarGrafico('pieVisita?tipo='+$scope.tipo);    
		};
		
		
		
		$scope.toggleModal = function()
		{ 
	  $scope.catVisible=true;
	  $scope.biVisible=true;
	  $scope.umVisible=false;
	  $scope.showModal = !$scope.showModal;
	
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
		$scope.delay = 0;
		$scope.minDuration = 0;
		$scope.message = 'Cargando...';
		$scope.backdrop = true;
		$scope.alerta = null;
	
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
	
		$scope.dibujarGrafico = function (url)
		{
	  
	  $scope.alerta = $http.get(URLS.BASE_API+url)     
	  .success(function(data, status, headers, config) 
	  {   
	$scope.dato  = data.data; 
	  
	  })
	  .error(function(data, status, headers, config) 
	  {
	errorFlash.error(data);
	  });
		};
	
		
		$scope.isFullscreen = false;
	
		$scope.toggleFullScreen = function(e) 
		{
	  $scope.isFullscreen = !$scope.isFullscreen;
	
	  if($scope.isFullscreen)
	  {
	$("#"+e).find('> md-icon').attr('md-svg-src','add').find("> svg >path").attr('d','M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z');}
	  else
	  {
	$("#"+e).find('> md-icon').attr('md-svg-src','add').find("> svg >path").attr('d','M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z');
	  }
		}
		
		$scope.recargar = function()
		{  
	  var hoy = new Date();
	  var anio = hoy.getFullYear();
	
	  $scope.contador=0;
	  $scope.parametro={};
	  $scope.bread=[];
	
	  $scope.tipo="Abasto";
	  $scope.bread.push({label:$scope.tipo});
	  $scope.bread.push({label:"Año :"+anio});
	  $scope.dibujarGrafico('alertaDash?anio='+anio+'&mes=&clues=&tipo=Abasto');  
		};
		$scope.dimensiones = function(campo,valor,nivel,c)
		{
	  var url="";
	  if($scope.tipo=="Abasto")
	url="abastoDimension";
	  if($scope.tipo=="Calidad")
	url="calidadDimension";
	  $scope.alertaOpcion = $http.get(URLS.BASE_API+url+'?campo='+campo+'&valor='+valor+'&nivel='+nivel)     
	  .success(function(data, status, headers, config) 
	  {   
	$scope.datos[c] = data.data;  
	if(c==2)
				{
					$scope.repos = data.data.map( function (repo) {
							repo.value = repo.nombre.toLowerCase();
							return repo;
						}); 
				}
	$scope.completar();  
	  });
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
		$scope.parDimension={};
		$scope.getDimension = function(campo,nivel,c)
		{
	  $scope.bread=[];
	  if(c==1)
	  {
	$scope.bread.push({label:$scope.tipo});
	$scope.bread.push({label:"Año: "+$scope.dimension[0]});
	$scope.parDimension[0]=" and anio = '"+$scope.dimension[0]+"'";
	  }
	  if(c==2)
	  {
	$scope.bread.push({label:$scope.tipo});
	$scope.bread.push({label:"Año: "+$scope.dimension[0]});
	$scope.bread.push({label:"Mes: "+$scope.dimension[1]});
	$scope.parDimension[1]=$scope.parDimension[0]+" and month='"+$scope.dimension[1]+"'";
	  }
	
	  $scope.dimensiones(campo,$scope.parDimension[c-1],nivel,c);
		}
	
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
				$scope.dimension[2]=item.clues;
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
		$scope.toggleModal = function(title)
		{ 
		$scope.catVisible=true;
		$scope.umVisible=true;
	  $scope.showModal = !$scope.showModal;
	
	  $scope.dimensiones('anio','','anio',0);
		};
	
		$scope.completar = function()
		{    
	  var year=""; var mes=""; var clues="";
	  if(!angular.isUndefined($scope.dimension[0])&&$scope.dimension[0]!=null)
	  {
	year=$scope.dimension[0];
	  }
	  if(!angular.isUndefined($scope.dimension[1])&&$scope.dimension[1]!=null)
	  {
	mes=$scope.dimension[1];
	  }
	  if(!angular.isUndefined($scope.dimension[2])&&$scope.dimension[2]!=null)
	  {
	$scope.bread=[];
	clues=$scope.dimension[2];
	$scope.bread.push({label:$scope.tipo});
	$scope.bread.push({label:"Año: "+$scope.dimension[0]});
	$scope.bread.push({label:"Mes: "+$scope.dimension[1]});
	$scope.bread.push({label:"Clues: "+clues});
	  }
	  $scope.dibujarGrafico('alertaDash?anio='+year+'&mes='+mes+'&clues='+clues+'&tipo='+$scope.tipo);
		};
	
		var hoy = new Date();
		var anio = hoy.getFullYear();
		$scope.tipo="Abasto";
		$scope.bread.push({label:$scope.tipo});
		$scope.bread.push({label:"Año :"+anio});
		$scope.dibujarGrafico('alertaDash?anio='+anio+'&mes=&clues=&tipo=Abasto');
	
		
	})
	
	
	
	.controller('globalController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog ) {
		
	
		$scope.delay = 0;
		$scope.minDuration = 0;
		$scope.message = 'Cargando...';
		$scope.backdrop = true;
		$scope.global = null;
	
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
		
		$scope.dimensiones = function(campo,valor,nivel,c)
		{
	  $scope.globalOpcion = $http.get(URLS.BASE_API+'calidadDimension?campo='+campo+'&valor='+valor+'&nivel='+nivel)     
	  .success(function(data, status, headers, config) 
	  {   
	$scope.datos[c] = data.data;  
	$scope.completar();  
	  });
		};
	
		$scope.parDimension={};
		$scope.getDimension = function(campo,nivel,c)
		{
	  $scope.bread=[];
	  if(c==1)
	  {
	$scope.datos[1] = {};
	$scope.dimension[1] = null; 
	$scope.bread.push({label:$scope.tipo});
	$scope.bread.push({label:"Año: "+$scope.dimension[0]});
	$scope.parDimension[0]=" and anio = '"+$scope.dimension[0]+"'";
	  }
	  if(c==2)
	  {
	$scope.bread.push({label:$scope.tipo});
	$scope.bread.push({label:"Año: "+$scope.dimension[0]});
	$scope.bread.push({label:"Mes: "+$scope.dimension[1]});
	$scope.parDimension[1]=$scope.parDimension[0]+" and month='"+$scope.dimension[1]+"'";
	  }
	
	  $scope.dimensiones(campo,$scope.parDimension[c-1],nivel,c);
		};
		$scope.completar = function()
		{    
	  var year=""; var mes=""; var clues="";
	  if(!angular.isUndefined($scope.dimension[0])&&$scope.dimension[0]!=null)
	  {
	year=$scope.dimension[0];
	  }
	  if(!angular.isUndefined($scope.dimension[1])&&$scope.dimension[1]!=null)
	  {
	mes=$scope.dimension[1];
	  }
	  $scope.dibujarGrafico('CalidadGlobal?anio='+year+'&mes='+mes);
		};
		$scope.dibujarGrafico = function (url)
		{
	  $scope.global = $http.get(URLS.BASE_API+url)     
	  .success(function(data, status, headers, config) 
	  {   
	
	$scope.dato = data.data;
	$scope.indicadores = data.indicadores;
	
	var total=data.total;
	if(total==0) total = "No hay datos"; 
	$scope.bread.push({label:"Total: "+total});
	  
	  })
	  .error(function(data, status, headers, config) 
	  {
	errorFlash.error(data);
	  });
		};
	
		$scope.isFullscreen = false;
	
		$scope.toggleFullScreen = function(e) {
	  $scope.isFullscreen = !$scope.isFullscreen;
	
	  if($scope.isFullscreen)
	  {
	$("#"+e).find('> md-icon').attr('md-svg-src','add').find("> svg >path").attr('d','M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z');}
	  else
	  {
	$("#"+e).find('> md-icon').attr('md-svg-src','add').find("> svg >path").attr('d','M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z');
	  }
		};
	
		$scope.recargar = function()
		{  
	  $scope.bread=[];
	  $scope.dibujarGrafico('CalidadGlobal');    
		};
	
		$scope.toggleModal = function(title)
		{ 
		$scope.catVisible=false;
		$scope.umVisible=false;
	  $scope.showModal = !$scope.showModal;
	
	  $scope.dimensiones('anio','','anio',0);
		};
		
		$scope.dibujarGrafico('CalidadGlobal');
	})
	
	.controller('gaugeController', function($scope, $http, $window, $location, $timeout, $route,  flash, errorFlash, URLS, $mdDialog ) {
		
	
		$scope.delay = 0;
		$scope.minDuration = 0;
		$scope.message = 'Cargando...';
		$scope.backdrop = true;
		$scope.gauge = null;
	
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
		$scope.dimensiones = function(campo,valor,nivel,c)
		{
			var url="";
			if($scope.tipo=="Abasto")
				url="abastoDimension";
			if($scope.tipo=="Calidad")
				url="calidadDimension";
			$scope.gauge = $http.get(URLS.BASE_API+url+'?campo='+campo+'&valor='+valor+'&nivel='+nivel+'&tipo='+$scope.tipo)     
			.success(function(data, status, headers, config) 
			{   
			$scope.datos[c] = data.data; 
			if(c==2)
				{
					$scope.repos = data.data.map( function (repo) {
							repo.value = repo.nombre.toLowerCase();
							return repo;
						}); 
				} 
			$scope.completar();  
			});
		};
	
		$scope.parDimension={};
		$scope.getDimension = function(campo,nivel,c)
		{
	  $scope.bread=[];
	  if(c==1)
	  {
		$scope.bread.push({label:$scope.tipo});
		$scope.bread.push({label:"Año: "+$scope.dimension[0]});
		$scope.parDimension[0]=" and anio = '"+$scope.dimension[0]+"'";
	  }
	  if(c==2)
	  {
		$scope.bread.push({label:$scope.tipo});
		$scope.bread.push({label:"Año: "+$scope.dimension[0]});
		$scope.bread.push({label:"Mes: "+$scope.dimension[1]});
		$scope.parDimension[1]=$scope.parDimension[0]+" and month='"+$scope.dimension[1]+"'";
	  }
	
	  $scope.dimensiones(campo,$scope.parDimension[c-1],nivel,c);
		};
		$scope.completar = function()
		{    
	  var year=""; var mes=""; var clues="";
	  if(!angular.isUndefined($scope.dimension[0])&&$scope.dimension[0]!=null)
	  {
	year=$scope.dimension[0];
	  }
	  if(!angular.isUndefined($scope.dimension[1])&&$scope.dimension[1]!=null)
	  {
	mes=$scope.dimension[1];
	  }
	  if(!angular.isUndefined($scope.dimension[2])&&$scope.dimension[2]!=null)
	  {
	$scope.bread=[];
	clues=$scope.dimension[2];
	$scope.bread.push({label:$scope.tipo});
	$scope.bread.push({label:"Año: "+$scope.dimension[0]});
	$scope.bread.push({label:"Mes: "+$scope.dimension[1]});
	$scope.bread.push({label:"Clues: "+clues});
	  }
	  $scope.dibujarGrafico('hallazgoGauge?anio='+year+'&mes='+mes+'&clues='+clues+'&tipo='+$scope.tipo);
		};
		$scope.dibujarGrafico = function (url)
		{
	  $scope.gauge = $http.get(URLS.BASE_API+url)     
	  .success(function(data, status, headers, config) 
	  {   
	$scope.value = data.valor;
	$scope.upperLimit = data.total;
	$scope.lowerLimit = 0;
	$scope.unit = "";
	$scope.precision = 1;
	$scope.ranges = data.rangos;
	
	$scope.dato = data.data;
	
	var total=data.total;
	if(total==0) total = "No hay datos"; 
	$scope.bread.push({label:"Total: "+total});
	  
	  })
	  .error(function(data, status, headers, config) 
	  {
	errorFlash.error(data);
	  });
		};
	
		$scope.isFullscreen = false;
	
		$scope.toggleFullScreen = function(e) {
	  $scope.isFullscreen = !$scope.isFullscreen;
	
	  if($scope.isFullscreen)
	  {
	$("#"+e).find('> md-icon').attr('md-svg-src','add').find("> svg >path").attr('d','M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z');}
	  else
	  {
	$("#"+e).find('> md-icon').attr('md-svg-src','add').find("> svg >path").attr('d','M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z');
	  }
		};
	
		$scope.recargar = function()
		{  
	  $scope.tipo="Abasto"; 
	  $scope.bread=[];
	  $scope.bread.push({label:$scope.tipo}); 
	  $scope.dibujarGrafico('hallazgoGauge?tipo='+$scope.tipo);    
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
				$scope.dimension[2]=item.clues;
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
		
		$scope.toggleModal = function()
		{ 
	  $scope.catVisible=true;
	  $scope.umVisible=true;
	  $scope.showModal = !$scope.showModal;
	
	  $scope.dimensiones('anio','','anio',0);
		};
		
		$scope.dibujarGrafico('hallazgoGauge?tipo='+$scope.tipo);
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
            flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
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
            flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
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
            flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
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
            flash('danger', "Ooops! Ocurrio un error (" + data.status + ") ->" +data.messages);
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