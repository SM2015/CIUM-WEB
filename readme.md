## CIUM (Captura de indicadores en unidades médicas)

[![Build Status](https://travis-ci.org/laravel/framework.svg)]
[![License](https://poser.pugx.org/laravel/framework/license.svg)]

<p style="text-align: justify;">
El proyecto CIUM comprende el desarrollo de un conjunto de 3 sistemas (CIUM-API-> API RSTfull,CIUM-WEB-> online, CIUM-MOVIL-> off line)que van a interactuar entre sí para dar soporte a la parte de 
captura del control de calidad y recursos en las unidades médicas, y los datos que se generen alimentarán al tablero de control eTAB para la medición de los indicadores del proyecto Salud Mesoamérica. 
Los gráficos que se presentan en eTAB son de manera generalizada, por lo tanto el CIUM contendrá un tablero mas personalizado para profundizar en el detalle de los hallazgos encontrados en las evaluaciones 
de los indicadores de calidad y recursos.
</p>
## Official Documentation

 > - [Manual de usuario](assets/manual-usuario.pdf)

## Tecnología

* [Angularjs]('https://angularjs.org/')
* [Material Design]('https://www.google.com/design/spec/material-design/introduction.html')
* [OAuth 2.0]('http://oauth.net/2/') [Salud ID]('http://sistemas.salud.chiapas.gob.mx/salud-id')


## Instalación

> - Instalar previamente [Bower]('http://bower.io/') y ejecutar en la consola el siguiente comando: `bower update` desde el directorio de instalación
> - Editar el archivo urls.js ubicado en src\app\urls.js

	angular.module('App').constant('URLS', {
    	BASE: 'path api',
    	BASE_API: 'path api /api/v1/',
		OAUTH_CLIENTE: 'cliente oauth',
		OAUTH_SERVER: 'servidor oauth'

   	});	
	
> ** URLS **

> - 1.- BASE: es la url o ip del servidor donde se encuentra la API
> - 2.- BASE_API: es la url completa del la API donde se encuentra la primera versión
> - 3.- OAUTH_CLIENTE: Aplicacion web para la recuepracion de contraseña y página informativa OAUTH
> - 4.- OAUTH_SERVER: Servidor que provee los sservicios para la administración de los clientes y las credenciales


## Contributing

> - Secretaria de salud del estado de chiapas ISECH
> - Salud Mesoamerica 2015 SM2015
> - akira.redwolf@gmail.com 
> - ramirez.esquinca@gmail.com

### License

The API CIUM es open-sourced software bajo licencia de [MIT license](http://opensource.org/licenses/MIT)
