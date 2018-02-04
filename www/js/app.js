// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('todoapp', ['ionic'])

.controller('todoctrl', function($scope, $http) {
  $scope.model={};
  $scope.todos = [];
  var dbSize = 5 * 1024 * 1024; // 5MB
  /// open database
  var db = openDatabase("Todo", "1", "Todo manager", dbSize);
  // create table for todos
  db.transaction(function (tx) {
      tx.executeSql("CREATE TABLE IF NOT EXISTS " +
          "todo(ID TEXT PRIMARY KEY, todo TEXT, added_on DATETIME, finished_on DATETIME)", [],
          function () {
              console.log("success");
              $scope.readTodos();
          },
          function () { console.log("failure") }
      );
  });

  $scope.addTodo= function(){
      //alert("In addTodo() with" + $scope.todoItem);
      
      //insert data into table
      db.transaction(function (tx) {
          var dToday = new Date();
          tx.executeSql("INSERT INTO todo(ID, todo, added_on) VALUES(?, ?, ?) ",
              [uuid.v4(), $scope.model.todoItem, dToday],
              function () {
                  $scope.model.todoItem = "";
                  console.log("successfully inserted");
              
                  $scope.readTodos();
              },
              function () {
                  console.log("failed");
              }
          );
      });

  }
  $scope.readTodos = function(){
      db.transaction(function (tx) {
          tx.executeSql("SELECT * FROM todo ORDER BY strftime('%Y-%m-%d:%h:%m:%s', added_on)", [], function(tx, rs){
              $scope.todos = [];
              for(var n = 0; n < rs.rows.length; n++){
                  $scope.todos.push({name: rs.rows.item(n).todo,
                  ID: rs.rows.item(n).ID, finished_on: rs.rows.item(n).finished_on});
              }
              $scope.$apply();

          },
          function(err){

          });

      });
  }
  $scope.deleteTodo = function(id){
      db.transaction(function(tx){
          tx.executeSql("DELETE FROM todo WHERE ID = ?",
          [id],
          function(tx){
              $scope.readTodos();
          },
          function(err){
              console.log(err);
          });
      });
  }
  $scope.finishTodo = function(id){
      db.transaction(function(tx){
          var dToday = new Date();
          tx.executeSql("UPDATE todo SET finished_on = ? WHERE ID = ?",
          [dToday, id],
          function(tx){
              $scope.readTodos();
          },
          function(err){
              console.log(err);
          });
      });
      
  }
  $scope.getClass = function(finished_on){
      if(finished_on){
          return("close");
      }else{
          return("open");
      }
  }

})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
