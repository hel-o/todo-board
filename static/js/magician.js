'use strict';

var print = function(msg){
    if('console' in window){
        console.log(msg);
    }
};

var service = angular.module('BoardService', []);

service.factory('Task', function($http){
    return {
        list: function(data){
            return $http({
                url: '/api/tasks',
                params: data
            });
        },
        save: function(data){
            return $http.post('/api/tasks', data);
        },
        remove: function(id){
            return $http.delete('/api/tasks/' + id);
        }
    };

});


var app = angular.module('BoardApp', ['BoardService', 'ngDraggable']);

//prevent Flask - Jinja2 template engine conflict:
app.config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{@');
    $interpolateProvider.endSymbol('@}');
});

app.controller('boardController', function($scope, Task){

    var dialog = document.getElementById('dialog-add-task');
    var overlay = document.getElementById('overlay');

    $scope.author = '';
    $scope.itemsA = [];
    $scope.itemsB = [];
    $scope.itemsC = [];
    $scope.itemsD = [];

    var checkAuthor = function(){
        if( !$.trim($scope.author).length ){
            $scope.author = prompt('Username:');
        }
        return $.trim($scope.author).length;
    };

    var list = function(){
        Task.list({column: 'A'}).success(function(response){
            $scope.itemsA = response;
        });

        Task.list({column: 'B'}).success(function(response){
            $scope.itemsB = response;
        });

        Task.list({column: 'C'}).success(function(response){
            $scope.itemsC = response;
        });

        Task.list({column: 'D'}).success(function(response){
            $scope.itemsD = response;
        });
    };

    $scope.newTask = function(){
        if(!checkAuthor())return;
        $scope.task = {};
        dialog.style.display = 'table';
        overlay.style.display = 'initial';
        //document.getElementsByTagName('body')[0].innerHTML += '<div id="overlay"></div>';
    };

    $scope.addTask = function(task){
        overlay.style.display = 'none';
        dialog.style.display = 'none';
        if(task.name.length && task.description.length){
            //$scope.itemsA.push(task);
            addTask(task, 'A');
        }
    };

    $scope.closeDialog = function(){
        overlay.style.display = 'none';
        dialog.style.display = 'none';
    };

    var removeTask = function(data, source){
        if(!checkAuthor())return;
        var index = -1, items_ = null;
        if(source == 'A'){
            items_ = $scope.itemsA;
        }else if(source == 'B'){
            items_ = $scope.itemsB;
        }else if(source == 'C'){
            items_ = $scope.itemsC;
        }else if(source == 'D'){
            items_ = $scope.itemsD;
        }
        index = items_.indexOf(data);
        if(index > -1){
            items_.splice(index, 1);
            Task.remove(data.id_).success(function(response){

            }).error(function(response, status){
                print('error when remove');
                print(response);
                print(status);
            });
        }
    };

    var addTask = function(data, destiny){
        if(!checkAuthor())return;
        var index = -1, items_ = null;

        if(destiny == 'A'){
            items_ = $scope.itemsA;
        }else if(destiny == 'B'){
            items_ = $scope.itemsB;
        }else if(destiny == 'C'){
            items_ = $scope.itemsC;
        }else if(destiny == 'D'){
            items_ = $scope.itemsD;
        }

        index = items_.indexOf(data);
        if(index == -1){
            data.column = destiny;
            if(data.author == undefined)data.author = $scope.author;
            Task.save(data).success(function(response){
                items_.push(response.data);
            }).error(function(response, status){
                print('error when add');
                print(response);
                print(status);
            });
        }
    };

    $scope.onDragComplete = function(data, source){
        removeTask(data, source);
    };

    $scope.onDropComplete = function(data, destiny){
        addTask(data, destiny);
    };

    $scope.removeTask = function(data, source){
        removeTask(data, source);
    };

    $scope.refresh = function(){
        list();
    };

    list();
    checkAuthor();

});
