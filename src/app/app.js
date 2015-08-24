/**
 * Module App
 * 
 * @package    CIUM
 * @subpackage Module
 * @author     Hugo Gutierrez Corzo
 * @created    2015-07-20
 */
(function(){
	'use strict'
	
	var app = angular.module('App', 
								[
									'ngMaterial',
									'md.data.table',
									'ngRoute',
									'ngStorage',
									'ngCookies',
									'ngResource',
									'ngMessages',
									'pascalprecht.translate',
									'http-auth-interceptor',																		
									'ngAnimate', 
									'ngSanitize', 
									'flash', 
									'checklist-model',
									'angular.filter',
									'FBAngular',
									'tc.chartjs',
									'ngRadialGauge',
									'color.picker',
									'CrudModule',
									'CriterioModule',
									'IndicadorModule',
									'GrupoModule',
									'ModuloModule',
									'UsuarioModule',
									'AbastoModule',
									'CalidadModule',
									'DashboardModule',
									'NotificacionModule',
									'PendienteModule',
									'DatoModule',
									'SeguimientoModule']);
	   
	app.config(['$mdThemingProvider','$mdIconProvider','$routeProvider','$httpProvider','$translateProvider',function($mdThemingProvider,$mdIconProvider,$routeProvider,$httpProvider,$translateProvider){
		// Configuramos iconos
		$mdIconProvider
	.defaultIconSet("assets/svg/avatars.svg", 128)		  
		  
		  .icon("logo", "assets/svg/cium.svg", 48)
		  .icon("logo-white", "assets/svg/cium_white.svg", 48)
		  .icon("salud-id", "assets/svg/salud_id_white.svg", 48)
		  .icon("salud-id-alt", "assets/svg/salud_id_alt.svg", 48)
		  .icon("ssa", "assets/svg/secretaria_salud.svg", 128)
		  .icon("marca", "assets/svg/chiapas_nos_une.svg", 128)
		  .icon("escudo-chiapas-h", "assets/svg/escudo_chiapas_h.svg", 128)
		  
		  .icon("syringe-filled", "assets/svg/syringe_filled.svg", 128)
		  .icon("hearts-filled", "assets/svg/hearts_filled.svg", 128)
		  .icon("diabetes-filled", "assets/svg/diabetes_filled.svg", 128)
		  .icon("coronavirus-filled", "assets/svg/coronavirus_filled.svg", 128)
		  
		  // Action
		  .icon("label", "bower_components/material-design-icons/action/svg/production/ic_label_48px.svg", 48)
		  .icon("language", "bower_components/material-design-icons/action/svg/production/ic_language_48px.svg", 48)
		  .icon("exit-to-app", "bower_components/material-design-icons/action/svg/production/ic_exit_to_app_48px.svg", 48)
		  .icon("dashboard", "bower_components/material-design-icons/action/svg/production/ic_dashboard_48px.svg", 48)
		  .icon("info", "bower_components/material-design-icons/action/svg/production/ic_info_48px.svg", 48)
		  .icon("done", "bower_components/material-design-icons/action/svg/production/ic_done_48px.svg", 48)
		  .icon("launch", "bower_components/material-design-icons/action/svg/production/ic_launch_48px.svg", 48)
		  .icon("highlight-remove", "bower_components/material-design-icons/action/svg/production/ic_highlight_remove_48px.svg", 48)
		  .icon("favorite", "bower_components/material-design-icons/action/svg/production/ic_favorite_48px.svg", 48)
		  .icon("favorite-outline", "bower_components/material-design-icons/action/svg/production/ic_favorite_outline_48px.svg", 48)
		  .icon("visibility", "bower_components/material-design-icons/action/svg/production/ic_visibility_48px.svg", 48)
		  .icon("visibility-off", "bower_components/material-design-icons/action/svg/production/ic_visibility_off_48px.svg", 48)
		  .icon("delete", "bower_components/material-design-icons/action/svg/production/ic_delete_48px.svg", 48)
		  .icon("spellcheck", "bower_components/material-design-icons/action/svg/production/ic_spellcheck_48px.svg", 48)
		  .icon("perm-scan-wifi", "bower_components/material-design-icons/action/svg/production/ic_perm_scan_wifi_48px.svg", 48)
		  .icon("perm-contact-calendar", "bower_components/material-design-icons/action/svg/production/ic_perm_contact_cal_48px.svg", 48)
		  .icon("group-work", "bower_components/material-design-icons/action/svg/production/ic_group_work_48px.svg", 48)
		  .icon("view-module", "bower_components/material-design-icons/action/svg/production/ic_view_module_48px.svg", 48)
		  .icon("verified-user", "bower_components/material-design-icons/action/svg/production/ic_verified_user_48px.svg", 48)
		  .icon("perm-identity", "bower_components/material-design-icons/action/svg/production/ic_perm_identity_48px.svg", 48)
		  .icon("search", "bower_components/material-design-icons/action/svg/production/ic_search_48px.svg", 48)
		  .icon("thumb-down", "bower_components/material-design-icons/action/svg/production/ic_thumb_down_48px.svg", 48)
		  .icon("thumb-up", "bower_components/material-design-icons/action/svg/production/ic_thumb_up_48px.svg", 48)
		  .icon("print", "bower_components/material-design-icons/action/svg/production/ic_print_48px.svg", 48)
		  .icon("today", "bower_components/material-design-icons/action/svg/production/ic_today_48px.svg", 48)
		  .icon("zoom-in", "bower_components/material-design-icons/action/svg/production/ic_zoom_in_24px.svg", 48)
		  .icon("zoom-out", "bower_components/material-design-icons/action/svg/production/ic_zoom_out_24px.svg", 48)
		  .icon("supervisor-accoun", "bower_components/material-design-icons/action/svg/production/ic_supervisor_account_24px.svg", 48)
		  .icon("autorenew", "bower_components/material-design-icons/action/svg/production/ic_autorenew_24px.svg", 48)
		  
		  // Content
		  .icon("save", "bower_components/material-design-icons/content/svg/production/ic_save_48px.svg", 48)
		  .icon("add", "bower_components/material-design-icons/content/svg/production/ic_add_48px.svg", 48)
		  .icon("remove", "bower_components/material-design-icons/content/svg/production/ic_remove_48px.svg", 48)
		  .icon("report", "bower_components/material-design-icons/content/svg/production/ic_report_48px.svg", 48)
		  .icon("content-paste", "bower_components/material-design-icons/content/svg/production/ic_content_paste_48px.svg", 48)
		  
		  
		  // Editor
		  .icon("format-list-numbered", "bower_components/material-design-icons/editor/svg/production/ic_format_list_numbered_48px.svg", 48)
		  .icon("insert-comment", "bower_components/material-design-icons/editor/svg/production/ic_insert_comment_48px.svg", 48)
		  .icon("mode-edit", "bower_components/material-design-icons/editor/svg/production/ic_mode_edit_48px.svg", 48)
		  .icon("insert-chart", "bower_components/material-design-icons/editor/svg/production/ic_insert_chart_48px.svg", 48)
		  
		  // Av
		  .icon("playlist-add", "bower_components/material-design-icons/av/svg/production/ic_playlist_add_48px.svg", 48)
		  .icon("explicit", "bower_components/material-design-icons/av/svg/production/ic_explicit_48px.svg", 48)
		  .icon("replay", "bower_components/material-design-icons/av/svg/production/ic_replay_48px.svg", 48)		  
		  
		  
		  // File
		  .icon("attachment", "bower_components/material-design-icons/file/svg/production/ic_attachment_48px.svg", 48)
		  
		  // Navigation
		  .icon("menu", "bower_components/material-design-icons/navigation/svg/production/ic_menu_48px.svg", 48)
		  .icon("check", "bower_components/material-design-icons/navigation/svg/production/ic_check_48px.svg", 48)
		  .icon("arrow-forward", "bower_components/material-design-icons/navigation/svg/production/ic_arrow_forward_48px.svg", 48)
		  .icon("arrow-back", "bower_components/material-design-icons/navigation/svg/production/ic_arrow_back_48px.svg", 48)
		  .icon("chevron-right", "bower_components/material-design-icons/navigation/svg/production/ic_chevron_right_48px.svg", 48)
		  .icon("chevron-left", "bower_components/material-design-icons/navigation/svg/production/ic_chevron_left_48px.svg", 48)
		  .icon("expand-more", "bower_components/material-design-icons/navigation/svg/production/ic_expand_more_48px.svg", 48)
		  .icon("expand-less", "bower_components/material-design-icons/navigation/svg/production/ic_expand_less_48px.svg", 48)
		  .icon("close", "bower_components/material-design-icons/navigation/svg/production/ic_close_48px.svg", 48)
		  
		  // Image
		  .icon("image", "bower_components/material-design-icons/image/svg/production/ic_image_48px.svg", 48)
		  .icon("panorama", "bower_components/material-design-icons/image/svg/production/ic_panorama_48px.svg", 48)
		  .icon("picture-as-pdf", "bower_components/material-design-icons/image/svg/production/ic_picture_as_pdf_48px.svg", 48)
		  .icon("remove-red-eye", "bower_components/material-design-icons/image/svg/production/ic_remove_red_eye_48px.svg", 48)
		  .icon("style", "bower_components/material-design-icons/image/svg/production/ic_style_48px.svg", 48)
		  .icon("brightness-3", "bower_components/material-design-icons/image/svg/production/ic_brightness_3_48px.svg", 48)
		  .icon("brightness-4", "bower_components/material-design-icons/image/svg/production/ic_brightness_4_48px.svg", 48)
		  .icon("brightness-5", "bower_components/material-design-icons/image/svg/production/ic_brightness_5_48px.svg", 48)		  
		  
		  // Social
		  .icon("person", "bower_components/material-design-icons/social/svg/production/ic_person_48px.svg", 48)
		  .icon("people", "bower_components/material-design-icons/social/svg/production/ic_people_48px.svg", 48)
		  .icon("notifications", "bower_components/material-design-icons/social/svg/production/ic_notifications_48px.svg", 48)
		  .icon("notifications-off", "bower_components/material-design-icons/social/svg/production/ic_notifications_off_48px.svg", 48)
		  .icon("notifications-on", "bower_components/material-design-icons/social/svg/production/ic_notifications_on_48px.svg", 48)		  		  
		  
		  // Alert
		  .icon("error", "bower_components/material-design-icons/alert/svg/production/ic_error_48px.svg", 48)
		  .icon("warning", "bower_components/material-design-icons/alert/svg/production/ic_warning_48px.svg", 48)
		  .icon("add-alert", "bower_components/material-design-icons/alert/svg/production/ic_add_alert_48px.svg", 48)
		  
		  // Communication
		  .icon("location-on", "bower_components/material-design-icons/communication/svg/production/ic_location_on_48px.svg", 48)
		  .icon("business", "bower_components/material-design-icons/communication/svg/production/ic_business_48px.svg", 48)

		  // Maps
		  .icon("local-library", "bower_components/material-design-icons/maps/svg/production/ic_local_library_48px.svg", 48)
		  .icon("place", "bower_components/material-design-icons/maps/svg/production/ic_place_48px.svg", 48)
		  
		  // Notification
		  .icon("event-available", "bower_components/material-design-icons/notification/svg/production/ic_event_available_48px.svg", 48)
		  .icon("event-note", "bower_components/material-design-icons/notification/svg/production/ic_event_note_48px.svg", 48)
		  .icon("event-busy", "bower_components/material-design-icons/notification/svg/production/ic_event_busy_48px.svg", 48)
		  .icon("airline-seat-flat", "bower_components/material-design-icons/notification/svg/production/ic_airline_seat_flat_48px.svg", 48)
		  
		  // Toggle
		  .icon("check-box", "bower_components/material-design-icons/toggle/svg/production/ic_check_box_48px.svg", 48)
		  .icon("check-box-outline-blank", "bower_components/material-design-icons/toggle/svg/production/ic_check_box_outline_blank_48px.svg", 48)
		  .icon("star", "bower_components/material-design-icons/toggle/svg/production/ic_star_24px.svg", 24)
		  .icon("star-outline", "bower_components/material-design-icons/toggle/svg/production/ic_star_outline_24px.svg", 24)

		  //device
		  .icon("storage", "bower_components/material-design-icons/device/svg/production/ic_storage_24px.svg", 24)

		  //hardware
		  .icon("tablet-mac", "bower_components/material-design-icons/hardware/svg/production/ic_tablet_mac_24px.svg", 24)
		  ;
		
		// Configuramos tema de material design
		$mdThemingProvider.theme('default')
	    .primaryPalette('green')
	    .warnPalette('red')
	    .accentPalette('light-green');
	  
		  $mdThemingProvider.theme('altTheme')
		    .primaryPalette('grey',{'default':'50'});

			  
		// Configuramos las rutas
		
		$routeProvider.when('/',{
			templateUrl: 'src/app/views/inicio.html',
			controller: 'InicioCtrl',
		})
		.when('/que-es',{
			templateUrl: 'src/app/views/que-es.html',
			controller: 'QueEsCtrl',
		})
		.when('/signin',{
			templateUrl: 'src/app/views/signin.html',
			controller: 'SigninCtrl',
		})
				
		.when('/usuarios',{
			templateUrl: 'src/admin/views/usuarios.html',
			controller: 'UsuariosCtrl',
		})
		.when('/acerca-de',{
			templateUrl: 'src/app/views/acerca-de.html',
			controller: 'DashboardCtrl',
		})
		.otherwise({ redirectTo: '/dashboard' });
		
		$httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
			if(angular.isUndefined($localStorage.cium))
			$localStorage.cium = {};
		   return {
		 'request': function (config) {
		     config.headers = config.headers || {};
		     if ($localStorage.cium.access_token) {					   
		   		config.headers = {
		   				Authorization: 'Bearer ' + $localStorage.cium.access_token,
		   				"X-Usuario": $localStorage.cium.user_email
		   			};
		     }
		     return config;
		 },
		 'responseError': function (response) {				 
		     if (response.status === 401 || response.status === 403) {
		   $location.path('signin');
		     }
		     return $q.reject(response);
		 }
		   };
		}]);
		
		$translateProvider.useStaticFilesLoader({
			prefix:'src/app/i18n/',
			suffix: '.json'
		});
		
		$translateProvider.useLocalStorage();
		$translateProvider.preferredLanguage('es');
		$translateProvider.useSanitizeValueStrategy('escaped');		
	}]);
	
	app.run(['$rootScope','$location','$localStorage','$injector','authService','Menu',function($rootScope,$location, $localStorage,$injector, authService,Menu){

			
			$rootScope.$on('event:auth-loginRequired', function() {
				
				if($localStorage.cium.access_token){
					var Auth = $injector.get('Auth');
				
						Auth.refreshToken({ refresh_token: $localStorage.cium.refresh_token, user_email: $localStorage.cium.refresh_token },
						   function(res){
								$localStorage.cium.access_token = res.access_token;
						  		$localStorage.cium.refresh_token = res.refresh_token;
								authService.loginConfirmed();
						   }, function (e) {
						 
						   		$rootScope.error = "CONNECTION_REFUSED";
								Auth.logout(function () {
						 	$location.path("/");
						   });
						 
						});
				}else{
					
					// Dejamos que pase la peticion porque ni siquiera hay un access_token
					authService.loginConfirmed();
				}
				
		    });
		
		$rootScope.$on('$routeChangeStart',function(event, next, current){
			if($localStorage.cium.access_token){
				if(typeof next.$$route !== 'undefined'){					
					var path =  next.$$route.originalPath.split('/');
					// Aquí deberiamos comprobar permisos para acciones de "subrutas"
					
					if(!Menu.existePath("/"+path[1]) && "/"+path[1] != '/acerca-de' && Menu.existePath("/"+path[1]) && "/"+path[1] != '/datos'  ){						
						$location.path('/dashboard');
					}					
				}				
			}else{
				if(typeof next.$$route !== 'undefined'){
					if(next.$$route.originalPath != '/signin' && next.$$route.originalPath != '/que-es' && next.$$route.originalPath != '/'){
						$location.path('/');	
					}	
				}else{
					$location.path('/')
				}			
			}
		});
	}]);

})();