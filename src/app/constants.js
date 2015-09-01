/**
 * Module App
 * 
 * @package    CIUM
 * @subpackage Controlador
 * @author     Hugo Gutierrez Corzo
 * @created    2015-07-20
 */
(function(){
	'use strict';	 
  // constante con todos las opciones del menu  
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
titulo: 'RECURSO', 
key: 'EvaluacionRecursoController.index', 
path: '/evaluacion-recurso', 
icono: 'event-available' 
  },
  { 
titulo: 'CALIDAD', 
key: 'EvaluacionCalidadController.index', 
path: '/evaluacion-calidad', 
icono: 'event-note' 
  },
  {
    titulo: "HALLAZGO",
    key: "HallazgoController.index",
    path: "/hallazgo",
    icono: "view-list"
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
  titulo: "LUGAR-VERIFICACION",
  key: "LugarVerificacionController.index",
  path: "/lugar-verificacion",
  icono: "place"
},
{
  titulo: "PLAZO-ACCION",
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
  titulo: "USUARIO",
  key: "UsuarioController.index",
  path: "/usuario",
  icono: "perm-identity"
}
    ]
  },
]);
// opciones del menu publico
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