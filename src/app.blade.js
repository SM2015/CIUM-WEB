/**
 * Directivas globales
 * 
 * @package    CIUM 
 * @subpackage Directivas
 * @author     Eliecer Ramirez Esquinca
 * @created    2015-07-20
 */
var app = angular.module('App');  

	/**
	 * Genera la url (modificar, nuevo, ver, listar) de las vistas.
	 *
	 * @param attr url-modulo
	 * 
	 * @return href
	 */
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

	/**
	 * Despliega en pantalla un mensaje de error que se genere al extraer datos de la api.
	 *
	 * @param data = array del o los mensajes
	 * 
	 * @return templete view
	 */
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

	/**
	 * Genera un boton para imprimir determinada area en una página.
	 *
	 * @param attr class = area a imprimir
	 * 
	 * @return imprimir
	 */
app.directive('imprimirDiv', function () 
{
	return {
		restrict: 'A',
		link: function(scope, element, attrs) 
		{
			// evento que dispara el generador de impresión
			element.bind('click', function(evt)
			{    
		    	evt.preventDefault();  
		    	var elem = document.querySelector(attrs.imprimirDiv);  
		    	PrintElem(elem);
			});
			// obtener el área a imprimir y se extrae su contenido html
			function PrintElem(elem)
			{
			    PrintWithIframe(angular.element(elem).html());
			}
			// generar el ddocumento a imprimir
			function PrintWithIframe(data) 
			{
				// comprobar que el contenedor de impresión no exista
			    if (!angular.isUndefined(document.getElementById('printf'))) 
			    {
			    	// crear el contenedor para guardar el elemento a imprimir
			    	var iframe = document.createElement('iframe');
			    	iframe.setAttribute("id","printf"); 
			    	iframe.setAttribute("style","display:none"); 
			    	document.body.appendChild(iframe);  

					var mywindow =  document.getElementById('printf');
					mywindow.contentWindow.document.write('<html lang="en" ng-app="App">'
+' <head>'
+' <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'
+' <meta name="charset" content="UTF-8">'
+' <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">'
+' <meta name="apple-mobile-web-app-capable" content="yes">'
+' <link rel="shortcut icon" href="assets/img/favicon-cium.ico" />'
+' <title></title><link rel="stylesheet" href="print.css"/>'
+' <link rel="stylesheet" href="bower_components/angular-material/angular-material.min.css"/>'
+' <link href="bower_components/angular-material-data-table/dist/md-data-table.min.css" rel="stylesheet" type="text/css"/>'
+' <meta name="viewport" content="initial-scale=1" />'
+' </head>'
+' <body>'
+data
+' <script src="bower_components/angular/angular.min.js"></script>'
+' <script src="bower_components/angular-material/angular-material.min.js"></script>'
+' <script src="assets/js/angular-material-icons.min.js"></script>'
+' <script type="text/javascript" src="bower_components/angular-material-data-table/dist/md-data-table.min.js"></script>'
+' </body>'
+' </html>');

				    
				    	setTimeout(function()
					  	{
					  		// lanzar la sentencia imprimir
							mywindow.contentWindow.print();
						},500);
					  	setTimeout(function()
					  	{
					  		// remover el contenedor de impresión
					    	document.body.removeChild(iframe);
					  	},2000);  
				   
			    }

			    return true;
			}
		}
	};
});