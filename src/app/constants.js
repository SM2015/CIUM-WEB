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
    grupo:'EVALUACION' ,
    lista: [
  { 
titulo: 'ABASTO', 
key: 'EvaluacionController.index', 
path: '/evaluacion-abasto', 
icono: 'event-available' 
  },
  { 
titulo: 'CALIDAD', 
key: 'EvaluacionCalidadController.index', 
path: '/evaluacion-calidad', 
icono: 'event-note' 
  }
    ]
}, 
{
    grupo: "CATALOGO",
    lista: [
{
  titulo: "ACCION",
  key: "AccionController.index",
  path: "/accion",
  icono: "spellcheck"
},
{
  titulo: "ALERTA",
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
  titulo: "CONE",
  key: "ConeController.index",
  path: "/cone",
  icono: "airline-seat-flat"
},
{
  titulo: "ZONA",
  key: "ZonaController.index",
  path: "/zona",
  icono: "supervisor-accoun"
},
{
  titulo: "CRITERIO",
  key: "CriterioController.index",
  path: "/criterio",
  icono: "content-paste"
},
{
  titulo: "INDICADOR",
  key: "IndicadorController.index",
  path: "/indicador",
  icono: "perm-scan-wifi"
},
{
  titulo: "LUGAR_VERIFICACION",
  key: "LugarVerificacionController.index",
  path: "/lugar-verificacion",
  icono: "place"
},
{
  titulo: "PLAZO_ACCION",
  key: "PlazoAccionController.index",
  path: "/plazo-accion",
  icono: "perm-contact-calendar"
}
    ]
  },
  {
    grupo: "SISTEMA",
    lista: [
{
  titulo: "GRUPO",
  key: "GrupoController.index",
  path: "/grupo",
  icono: "group-work"
},
{
  titulo: "MODULO",
  key: "SysModuloController.index",
  path: "/modulo",
  icono: "view-module"
},
{
  titulo: "PERMISO",
  key: "SysModuloAccionController.index",
  path: "/permiso",
  icono: "verified-user"
},
{
  titulo: "USUARIO",
  key: "UsuarioController.index",
  path: "/usuario",
  icono: "perm-identity"
}
    ]
  },
  {
    grupo: "TRANSACCION",
    lista: [
{
  titulo: "SEGUIMIENTO",
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