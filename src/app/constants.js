(function(){
	'use strict';	   
	angular.module('App').constant('MENU',[
{ 
    grupo: false,
    lista: [
  { 
titulo: 'Dashboard', 
key: 'DashboardController.index', 
path: '/dashboard', 
icono: 'dashboard' 
  }
    ]
},
{ 
    grupo:'Evaluación' ,
    lista: [
  { 
titulo: 'Abasto', 
key: 'EvaluacionController.index', 
path: '/evaluacion-abasto', 
icono: 'event-available' 
  },
  { 
titulo: 'Calidad', 
key: 'EvaluacionCalidadController.index', 
path: '/evaluacion-calidad', 
icono: 'event-note' 
  }
    ]
}, 
{
    grupo: "Catálogos",
    lista: [
{
  titulo: "Acciones",
  key: "AccionController.index",
  path: "/accion",
  icono: "spellcheck"
},
{
  titulo: "Alerta",
  key: "AlertaController.index",
  path: "/alerta",
  icono: "warning"
},
{
  titulo: "Clues",
  key: "CluesController.index",
  path: "/clues",
  icono: "business"
},
{
  titulo: "CONE´s",
  key: "ConeController.index",
  path: "/cone",
  icono: "airline-seat-flat"
},
{
  titulo: "Zona",
  key: "ZonaController.index",
  path: "/zona",
  icono: "supervisor-accoun"
},
{
  titulo: "Criterios",
  key: "CriterioController.index",
  path: "/criterio",
  icono: "content-paste"
},
{
  titulo: "Indicadores",
  key: "IndicadorController.index",
  path: "/indicador",
  icono: "perm-scan-wifi"
},
{
  titulo: "Lugares de verificación",
  key: "LugarVerificacionController.index",
  path: "/lugar-verificacion",
  icono: "place"
},
{
  titulo: "Plazo Acciones",
  key: "PlazoAccionController.index",
  path: "/plazo-accion",
  icono: "perm-contact-calendar"
}
    ]
  },
  {
    grupo: "Sistema",
    lista: [
{
  titulo: "Grupos",
  key: "GrupoController.index",
  path: "/grupo",
  icono: "group-work"
},
{
  titulo: "Modulos",
  key: "SysModuloController.index",
  path: "/modulo",
  icono: "view-module"
},
{
  titulo: "Permisos",
  key: "SysModuloAccionController.index",
  path: "/permiso",
  icono: "verified-user"
},
{
  titulo: "Usuarios",
  key: "UsuarioController.index",
  path: "/usuario",
  icono: "perm-identity"
}
    ]
  },
  {
    grupo: "Transacción",
    lista: [
{
  titulo: "Seguimiento",
  key: "SeguimientoController.index",
  path: "/seguimiento",
  icono: "check-box"
}
    ]
  },

			
						 
						 ]);
	angular.module('App').constant('MENU_PUBLICO',[
{ 
    icono:'exit-to-app' , 
    titulo:'INICIAR_SESION', 
    path:'signin' 
},
   			{ 
    icono:'info' , 
    titulo:'QUE_ES_APP', 
    path:'que-es' 
}  
						 
	]);
	
})();