'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', ['ui.router']);

app.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider) {

    $locationProvider.html5Mode(true).hashPrefix('!');

    // For any unmatched url, redirect to root (/)
    $urlRouterProvider.otherwise('/');
    //
    // Set up the states
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'home.html'
        })
        .state('room', {
            url: '/:roomId',
            templateUrl: 'room.html'
        });
}
]);

app.controller('AppCtrl', ['$scope', '$http', '$timeout', '$stateParams', '$window', 'Racer', function($scope, $http, $timeout, $stateParams, $window, Racer) {
    var racer = require('racer');
    var model;

    console.log('Controller init. Racer is:');
    console.log(racer);

    $scope.initData = function() {
        console.log('initData: ' + $stateParams.roomId);
        $scope.roomId = $stateParams.roomId;

        $http.get('/racer/' + $stateParams.roomId).success(function (data) {
            $scope.racerInfo = data;
            $scope.padList = data.list;
            console.log('get /racer/data returned data');
            console.log(data);
            console.log('data bundle');
            console.log(data.bundle);
            console.log('****');
            var bundle = data.bundle; //JSON.parse(data.bundle);
            var MODEL = racer.createModel(bundle);
            //$window.MODEL = MODEL;

            // model.at() scopes all model operations underneath a particular path
            model = MODEL.at('_page.room.' + $stateParams.roomId);
            console.log('model');
            console.log(model);
            console.log('****');

            model.on('change', '*.text', function(captures, value, previous, passed) {

                console.log('model.on change...');
                console.log('captures:');
                console.log(captures);
                console.log('value');
                console.log(value);
                console.log('previous');
                console.log(previous);
                console.log('passed');
                console.log(passed);
                console.log('#############');

                // Check if the action happened from myself.  If it did, I don't need to do anything.
                if (passed.local) {
                    return;
                }
                if (!passed.$type) {
                    // This is an action from someone else.  Just set the value
                    $timeout(function() {
                        $scope.padList[captures].text = value;
                    });

                    return;
                }
            });

        });

    };

    $scope.textChanged = function(index) {
        // IE and Opera replace \n with \r\n
        var value = $scope.padList[index].text.replace(/\r\n/g, '\n');
        var previous = model.get(index + '.text') || '';

        if (value != previous) {
            //model.set(index + '.text', value);
            applyChange(index, previous, value);
        }
    };


    // Create an op which converts previous -> value.
    //
    // This function should be called every time the text element is changed.
    // Because changes are always localized, the diffing is quite easy.
    //
    // This algorithm is O(N), but I suspect you could speed it up somehow using
    // regular expressions.
    var applyChange = function (index, previous, value) {
        if (previous === value) {
            return;
        }
        var start = 0;
        while (previous.charAt(start) == value.charAt(start)) {
            start++;
        }
        var end = 0;
        while (
        previous.charAt(previous.length - 1 - end) === value.charAt(value.length - 1 - end) &&
        end + start < previous.length &&
        end + start < value.length
            ) {
            end++;
        }

        if (previous.length !== start + end) {
            var howMany = previous.length - start - end;
            model.pass({local: true}).stringRemove(index + '.text', start, howMany);
        }
        if (value.length !== start + end) {
            var inserted = value.slice(start, value.length - end);
            model.pass({local: true}).stringInsert(index + '.text', start, inserted);
        }
    };

    $scope.$on('$destroy', function() {
        if (model) {
            model.destroy();
            model = null;
            //model.removeRef('_page.room.' + $stateParams.roomId);
        }
        if ($window.MODEL) {
            $window.MODEL.destroy();
            $window.MODEL = null;
        }

    });
}]);
