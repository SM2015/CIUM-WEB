(function(){
	'use strict';
	angular.module('CriterioModule')
	.factory('listaOpcion', ['$http', 'URLS','errorFlash', function ($http, URLS,errorFlash) {	
		return{
			options: function(url){			

				return $http.get(URLS.BASE_API+url)
				.success(function(data, status, headers, config) 
				{
					
				})
				.error(function(data, status, headers, config) 
				{
					errorFlash.error(data);
				});
			}
		};
	}])
	.service('Criterios', function () 
	{
	    var criterios = []; 
	    return { 
	    	getCriterios: function () 
	    	{ 
	    		return criterios; 
	    	}, 
	    	setCriterios: function(value) 
	    	{ 
	    		criterios = value; 
	    	} 
	    };
	})
	.directive('modal', function ($mdDialog) {
		return {

            template: '<md-button class="md-icon-button" aria-label="Opciones" ng-click="addLayerDialog();">'+
                                            '<md-icon md-svg-src="insert-chart"></md-icon>'+
                                        '</md-button>',
            scope: {},
            link: function(scope) {
                scope.alert = '';
                scope.addLayerDialog = function() {
                    $mdDialog.show({
                        templateUrl: 'src/dashboard/views/dialog.html',
                        controller: function($scope, $mdDialog) {

                            $scope.hide = function() {
                                $mdDialog.hide();
                            };
                            $scope.cancel = function() {
                                $mdDialog.cancel();
                            };

                            $scope.answer = function(answer) {
                                console.log($mdDialog.hide('answer'));
                                $mdDialog.hide(answer);
                            };
                        }

                    }).then(function(answer) {
                        scope.alert = 'You said the information was "' + answer + '".';
                    }, function() {
                        scope.alert = 'You cancelled the dialog.';
                    });

                };

            }

        };
	})
})();