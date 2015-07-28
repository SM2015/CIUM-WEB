var app = angular.module('App');  


app.factory('MenuOption', function($http, $rootScope, errorFlash, URLS) 
{ 
	var menu = {};

    menu.preparar = function() 
	{ 
		var t = this;			
		$http.get(URLS.BASE_API+'menu')
		.success(function(data, status, headers, config) 
		{	
			t.menu = data;	
			$rootScope.$broadcast('menuInicio');			
		})
		.error(function(data, status, headers, config) 
		{
			errorFlash.error(data);
		});		  
	}
	return menu;
});


app.controller('menuController', function($scope, $http, $window, MenuOption, infoUsuario, ngProgress) 
{	
	MenuOption.preparar();
	$scope.$on('menuInicio', function() {
  		$scope.menuOptions = MenuOption.menu;
    });
});

app.directive('showtab', function ($location) 
{
    return {
		  link: function (scope, element, attrs) {
			element.click(function(e) {
				e.preventDefault();
				if(attrs.showtab=='1')
					$(element).tab('show');
				else 
					$location.path(attrs.href);
			});
  		}
    };
});

app.directive('urlModulo', function() 
{	
	return{
		link: function (scope, element, attrs){
			if(element[0].tagName === "A") 
			{
				var  url=scope.url;
				var urlM=attrs.urlModulo;
				url=url + "/" + urlM;
				if(urlM.search("-")>-1)
				{										
					var array = url.split('/');
					if(urlM.search("--")>-1)
					{
						url = "/"+array[1];
					}
					else
					{
						var parametro = url.split('=')
						parametro=parametro[1].split("/");
						url = array[1]+"/"+array[array.length-1]+parametro[0];						
					}
					//url=url.replace("-","")
				}
				attrs.$set('href',"#" + url);
			} 
		}
	};
});

app.factory('errorFlash', function($http, flash) 
{ 
	return {		 
		error: function(data) 
		{ 
			var datos=[];
			if(angular.isObject(data))
			{
				angular.forEach(data, function(id, key) 
				{
					datos.push({ level: 'danger', text:id[0], x:'right', y:'top', t:'5000'});
				});
			}
			else
			{
				console.debug(data);
				datos.push({ level: 'danger', text:':( "Ooops! Ocurrio un error (500) ', x:'right', y:'top', t:'4000'},
					{ level: 'warning', text:':( Consulte el log de la consola ', x:'right', y:'top', t:'5000'});
			}
			flash(datos);
		}
	};
});

app.directive('imprimirDiv', function () 
{
	return {
		restrict: 'A',
		link: function(scope, element, attrs) 
		{
			element.bind('click', function(evt)
			{    
		    	evt.preventDefault();    
		    	PrintElem(attrs.imprimirDiv);
			});

			function PrintElem(elem)
			{
			    PrintWithIframe($(elem).html());
			}

			function PrintWithIframe(data) 
			{
			    if ($('iframe#printf').size() == 0) 
			    {
			    	$('html').append('<iframe id="printf" name="printf"></iframe>');  

				var mywindow = window.frames["printf"];
				mywindow.document.write('<html><head><title></title><style>@page {margin: 25mm 0mm 25mm 5mm}</style>'
							+ '<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css"> ' 
							+ '<link rel="stylesheet" type="text/css" href="css/master-print.css"> ' 
			  + '</head><body><div>'
			  + data
			  + '</div></body></html>');

				    $(mywindow.document).ready(function()
				    {

					mywindow.print();
				  setTimeout(function()
				  {
				    $('iframe#printf').remove();
				  },
				  2000);  
				    });
			    }

			    return true;
			}
		}
	};
});