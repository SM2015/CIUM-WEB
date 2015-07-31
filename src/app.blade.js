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
				datos.push({ level: 'danger', text:':( "Ooops! Ocurrio un error (500) ', x:'right', y:'bottom', t:'3000'},
					{ level: 'warning', text:':( Consulte el log de la consola ', x:'right', y:'bottom', t:'5000'});
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
					mywindow.document.write('<html lang="en" ng-app="App">'
+' <head>'
+' <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'
+' <meta name="charset" content="UTF-8">'
+' <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">'
+' <meta name="apple-mobile-web-app-capable" content="yes">'
+' <link rel="shortcut icon" href="assets/img/favicon-cium.ico" />'
+' <title></title><link rel="stylesheet" href="print.css"/>'
+' <link rel="stylesheet" href="bower_components/angular-material/angular-material.min.css"/>'
+' <link rel="stylesheet" href="bower_components/md-data-table/dist/md-data-table-style.css"/>'
+' <meta name="viewport" content="initial-scale=1" />'
+' </head>'
+' <body>'
+data
+' <script src="bower_components/angular/angular.min.js"></script>'
+' <script src="bower_components/angular-material/angular-material.min.js"></script>'
+' <script src="assets/js/angular-material-icons.min.js"></script>'
+' <script src="bower_components/md-data-table/dist/md-data-table-templates.js"></script>'
+' <script src="bower_components/md-data-table/dist/md-data-table.js"></script>'
+' </body>'
+' </html>');

				    $(mywindow.document).ready(function()
				    {
				    	setTimeout(function()
					  	{
							mywindow.print();
						},500);
					  	setTimeout(function()
					  	{
					    	$('iframe#printf').remove();
					  	},2000);  
				    });
			    }

			    return true;
			}
		}
	};
});