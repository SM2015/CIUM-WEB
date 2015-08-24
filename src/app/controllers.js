
/**
 * Controller  App
 * 
 * @package    CIUM
 * @subpackage Controlador
 * @author     Hugo Gutierrez Corzo
 * @created    2015-07-20
 */
 (function(){
	'use strict';
    angular.module('App')
  .controller('SigninCtrl', ['$rootScope', '$scope', '$location', '$localStorage','$mdBottomSheet','$translate','$mdSidenav', 'Auth','MENU_PUBLICO','URLS', function ($rootScope, $scope, $location, $localStorage, $mdBottomSheet, $translate, $mdSidenav, Auth,  MENU_PUBLICO,URLS) {
     
$scope.cargando = false;

  /**
   * Si se pudo obtener el token redireccionar al dashboard.
   *
   * @param res
   * @return redirect
   */
function successAuth(res) {
    $scope.cargando = false;
    $rootScope.errorSignin = null;
    $location.path("dashboard");
}

  /**
   * obtener el token de acceso.
   *
   * @param post 
   * Response si la operacion es exitosa devolver un array con el listado de clues
   * @return 
   */
$scope.signin = function () {
  var email=$scope.email;
  $localStorage.cium.user_email=email;
    var formData = {
  email: $scope.email,
  password: $scope.password
    };
    $scope.cargando = true;
  
    Auth.signin(formData, successAuth, function(){
      $scope.cargando = false;          
    });
};

  /**
   * Cerra la sessión.
   *
   * @param session 
   * Response si la operacion es exitosa devolver un array con el listado de clues
   * @return array
   */
$scope.logout = function () {
    $scope.cargando = false;
    Auth.logout(function () {
  $location.path("signin");
    });
};

$scope.access_token = $localStorage.cium.access_token;
$scope.refresh_token = $localStorage.cium.refresh_token;
$scope.user_email = $localStorage.cium.user_email;

$scope.urlOlvidePassword= URLS.OAUTH_CLIENTE + "/#/recuperar-password";
$scope.urlOAuthInfo= URLS.OAUTH_CLIENTE + "/#/que-es";
$scope.urlObtenerOAuth= URLS.OAUTH_CLIENTE + "/#/signin";

$scope.menuSelected = '';

   /**
   * Redirect a la página.
   *
   * @param paht 
   * @return redirect
   */
$scope.ir = function(path){
	        $scope.menuSelected = path;
	       $location.path(path).search({id: null});
	    };

$scope.menuPublico = MENU_PUBLICO;
  /**
   * Muestra el templete para la selección de idioma.
   *
   * @param event 
   * @return views
   */
$scope.mostrarIdiomas = function($event){    
    $mdBottomSheet.show({
templateUrl: 'src/app/views/idiomas.html',
controller: 'ListaIdiomasCtrl',
targetEvent: $event
    });
};
  /**
   * Muestra el menu lateral si la apliación se abre en un dispositivo.
   *
   * @return event
   */
$scope.toggleMenu  = function  () {    
    $mdSidenav('left-publico').toggle();
};
  }])
  .controller('InicioCtrl', ['$rootScope', '$scope', '$location', '$localStorage','$mdBottomSheet','$translate','$mdSidenav','Auth','MENU_PUBLICO','URLS', function ($rootScope, $scope, $location, $localStorage, $mdBottomSheet, $translate, $mdSidenav, Auth,MENU_PUBLICO,URLS) {

$scope.menuSelected = '';

$scope.ir = function(path){
	        $scope.menuSelected = path;
	       $location.path(path).search({id: null});
	    };

$scope.menuPublico = MENU_PUBLICO;

$scope.mostrarIdiomas = function($event){    
    $mdBottomSheet.show({
templateUrl: 'src/app/views/idiomas.html',
controller: 'ListaIdiomasCtrl',
targetEvent: $event
    });
};
$scope.alto = (screen.availHeight-(screen.availHeight/2));
$scope.toggleMenu  = function  () {  
    $mdSidenav('left-publico').toggle();
};
  }])
  .controller('QueEsCtrl', ['$rootScope', '$scope', '$location', '$localStorage','$mdBottomSheet','$translate','$mdSidenav','Auth','MENU_PUBLICO','URLS', function ($rootScope, $scope, $location, $localStorage, $mdBottomSheet, $translate, $mdSidenav, Auth,MENU_PUBLICO,URLS) {

$scope.menuSelected = '';

$scope.ir = function(path){
	        $scope.menuSelected = path;
	       $location.path(path).search({id: null});
	    };

$scope.menuPublico = MENU_PUBLICO;

$scope.mostrarIdiomas = function($event){    
    $mdBottomSheet.show({
templateUrl: 'src/app/views/idiomas.html',
controller: 'ListaIdiomasCtrl',
targetEvent: $event
    });
};

$scope.toggleMenu  = function  () {  
    $mdSidenav('left-publico').toggle();
};
  }])
  .controller('ListaIdiomasCtrl',['$scope','$mdBottomSheet','$translate',function($scope, $mdBottomSheet, $translate){

$scope.items = [
    { codigo: 'es' },
    { codigo: 'en' },
  ];
  $scope.idiomaSeleccionado = $translate.use();
  
  $scope.cambiarIdioma = function($index) {
    var clickedItem = $scope.items[$index];
    $translate.use(clickedItem.codigo);
    $mdBottomSheet.hide(clickedItem);
  };
  }])
  .controller('DashboardCtrl', ['$rootScope', '$scope', 'Data', '$mdSidenav','$location','$mdBottomSheet','Auth','Menu', function($rootScope, $scope, Data,$mdSidenav,$location,$mdBottomSheet,Auth, Menu){

 $scope.menuSelected = "/"+$location.path().split('/')[1];
$scope.menu = Menu.getMenu();

Data.getApiData(function (res) {
    //$scope.api = res.data;
}, function () {
    //$scope.error = 'Failed to fetch restricted API content.';
});

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
    		
    				
    	}])
  .controller('UsuariosCtrl', ['$scope', function($scope){
    		console.log('usuarios');
    	}]);
})();