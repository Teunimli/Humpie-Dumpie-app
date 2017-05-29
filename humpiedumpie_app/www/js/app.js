// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('humpieDumpie', [
    'ionic',
    'firebase',
    'humpieDumpie.app.services',
    'humpieDumpie.app.controllers',
    'ion-datetime-picker',
	'ngCordova'
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
          
	      .state('app.group', {
		      url: "/group",
		      views: {
			      'menuContent': {
				      templateUrl   : "views/group/group.html",
				      controller: 'ChildGroupCtrl'
			      }
		      }
	      })

          .state('app.add_child', {
              url: "/add_child",
              views: {
                  'menuContent': {
                      templateUrl   : "views/child/add_child.html",
                      controller: 'ChildCtrl'
                  }
              }
          })

		  .state('app.change_child_list', {
			  url: "/change_child_list",
			  views: {
				  'menuContent': {
					  templateUrl   : "views/child/change_child_list.html",
					  controller: 'ChildCtrl'
				  }
			  }
		  })

		  .state('app.delete_child_list', {
			  url: "/delete_child_list",
			  views: {
				  'menuContent': {
					  templateUrl   : "views/child/delete_child_list.html",
					  controller: 'DeleteChildCtrl'
				  }
			  }
		  })

		  .state('app.change_child', {
			  url: "/change_child/:childId",
			  views: {
				  'menuContent': {
					  templateUrl   : "views/child/change_child.html",
					  controller: 'ChangeChildCtrl'
				  }
			  }
		  })

          .state('app.management', {
              url: "/management",
              views: {
                  'menuContent': {
                      templateUrl   : "views/management/list.html",
                      controller: 'ManagementCtrl'
                  }
              }
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

	      .state('app.chat', {
		      url: "/chat",
		      views: {
			      'menuContent': {
				      templateUrl   : "views/chat/chat_overview.html",
				      controller: 'ChatCtrl'
			      }
		      }
	      })
	      .state('app.singleChat', {
		      url: "/singleChat:chatID",
		      views: {
			      'menuContent': {
				      templateUrl   : "views/chat/chat_single.html",
				      controller: 'SingleChatCtrl'
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

		  .state('app.usertype', {
			  url: "/usertype",
			  views: {
				  'menuContent': {
					  templateUrl   : "views/users/usertype.html",
					  controller: 'UserTypeListCtrl'
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

	      .state('app.groupdivide', {
		      url: "/groupdivide",
		      views: {
			      'menuContent': {
				      templateUrl   : "views/group/divide.html",
				      controller: 'GroupCtrl'
			      }
		      }
	      })

		  .state('app.addgroupchild', {
			  url: "/addgroupchild:date",
			  views: {
				  'menuContent': {
					  templateUrl   : "views/group/add.html",
					  controller: 'GroupCtrl'
				  }
			  }
		  })

		  .state('app.changegroup', {
			  url: "/changegroup",
			  views: {
				  'menuContent': {
					  templateUrl   : "views/group/change.html",
					  controller: 'GroupChangeCtrl'
				  }
			  }
		  })

		  .state('app.changegroupdate', {
			  url: "/changegroup:id",
			  views: {
				  'menuContent': {
					  templateUrl   : "views/group/change_list.html",
					  controller: 'GroupChangeChildCtrl'
				  }
			  }
		  })

		  .state('app.selectchild', {
			  url: "/selectchild",
			  views: {
				  'menuContent': {
					  templateUrl   : "views/child/selectparent_list.html",
					  controller: 'SelectParentCtrl'
				  }
			  }
		  })
		  
		  .state('app.link_child', {
			  url: "/selectchild:parentid",
			  views: {
				  'menuContent': {
					  templateUrl   : "views/child/selectparentchild_list.html",
					  controller: 'SelectParentChildCtrl'
				  }
			  }
		  })

		  .state('app.child_detail', {
			  url: "/child_detail/:childId",
			  views: {
				  'menuContent': {
					  templateUrl   : "views/child/child_detail.html",
					  controller: 'childDetailCtrl'
				  }
			  }
		  })
      ;
      
      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/login');
    });
