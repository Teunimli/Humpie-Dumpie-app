// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('rooster', [
    'ionic',
    'firebase',
    'rooster.app.services',
    'rooster.app.controllers',
    'ion-datetime-picker',
])

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
    
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    	$ionicConfigProvider.tabs.position('top');
      $stateProvider

	      .state('app', {
		      url: '/app',
		      abstract: true,
		      templateUrl: 'views/app/menu.html',
		      controller: 'AppCtrl'
	      })

          .state('login', {
            url: "/login",
            templateUrl: "views/auth/login.html",
            controller: 'AuthCtrl'
          })

		  .state('app.admin', {
			  url: "/admin",
			  views: {
				  'menuContent': {
					  templateUrl   : "views/app/admin.html",
					  controller: 'AdminCtrl'
				  }
			  }
		  })

          .state('app.rooster', {
              url: "/rooster",
              views: {
                  'menuContent': {
	                  templateUrl   : "views/app/rooster.html",
	                  controller: 'RoosterCtrl'
                  }
              }
          })

          .state('app.lesson_add', {
              url: "/lessen_add",
	          views: {
		          'menuContent': {
			          templateUrl   : "views/app/forms/lesson_add.html",
			          controller: 'LessonCtrl'
		          }
	          }
          })

	      .state('app.singleLesson', {
		      url: "/singleLesson:lessonID",
		      views: {
			      'menuContent': {
				      templateUrl   : "views/lessons/singleLesson.html",
				      controller: 'SingleLessonCtrl'
			      }
		      }
	      })

	      .state('app.lesson_change', {
		      url: "/changeLesson:lessonID",
		      views: {
			      'menuContent': {
				      templateUrl   : "views/lessons/lesson_change.html",
				      controller: 'SingleLessonCtrl'
			      }
		      }
	      })

	      .state('app.presence', {
		      url: "/presence:lessonID",
		      views: {
			      'menuContent': {
				      templateUrl   : "views/lessons/presence/presence.html",
				      controller: 'PresenceCtrl'
			      }
		      }
	      })

	      .state('app.users', {
		      url: "/users:userType",
		      views: {
			      'menuContent': {
				      templateUrl   : "views/users/users.html",
				      controller: 'UserCtrl'
			      }
		      }
	      })

	      .state('app.user_add', {
		      url: "/user_add:userType",
		      views: {
			      'menuContent': {
				      templateUrl   : "views/users/user_add.html",
				      controller: 'UserCtrl'
			      }
		      }
	      })

	      .state('app.classes', {
		      url: "/classes",
		      views: {
			      'menuContent': {
				      templateUrl   : "views/classes/classes.html",
				      controller: 'ClassesCtrl'
			      }
		      }
	      })

	      .state('app.class_add', {
		      url: "/class_add",
		      views: {
			      'menuContent': {
				      templateUrl   : "views/classes/class_add.html",
				      controller: 'ClassesCtrl'
			      }
		      }
	      })

          .state('app.absense_add', {
              url: "/absense_add",
              views: {
                  'menuContent': {
                      templateUrl   : "views/absence/absense_add.html",
                      controller: 'AbsenceCtrl'
                  }
              }
          })

	      .state('app.absence', {
		      url: "/absence",
		      views: {
			      'menuContent': {
				      templateUrl   : "views/absence/overview.html",
				      controller: 'AbsenceCtrl'
			      }
		      }
	      })

          .state('app.absencedetails', {
              url: "/absencedetails/:absenceId",
              views: {
                  'menuContent': {
                      templateUrl   : "views/absence/details.html",
                      controller: 'AbsenceDetailCtrl'
                  }
              }
          })

		  .state('app.classesdetails', {
              url: "/classesdetails/:classesId",
              views: {
                  'menuContent': {
                      templateUrl   : "views/classes/details.html",
                      controller: 'ClassesDetailCtrl'
                  }
              }
          })
      ;
      
      
      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/login');
    });
