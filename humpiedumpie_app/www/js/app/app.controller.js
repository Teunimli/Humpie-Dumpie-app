angular.module('humpieDumpie.app.controllers', [])

	.controller('AppCtrl', function($scope, $ionicModal, $state, $firebaseArray, $location) {
		// zet het logo voor in het menu
		$scope.logo = "img/logo.png";

		// Kijken of de gebruiker is ingelogd

		var user = firebase.auth().currentUser;
		if (!user) {
			$state.go('login');
		}
		// selecteer de firbase database met users
		var fb = firebase.database();




		// Functie om een chat aan te maken
		function writeChatData(chatId, messages, parentId) {
			fb.ref('chats/' + chatId).set({
				messages: messages,
				parentId: parentId
			});
		}

				var role = window.localStorage.getItem('role');
				switch (role) {
					case 'leidster':
						$scope.menucontent = [
							{
								title: 'Huidige groep',
								type: 'sref',
								action: 'app.group'
							},
							{
								title: 'Beheer',
								type: 'sref',
								action: 'app.management'
							},
							{
								title: 'Chat',
								type: 'sref',
								action: 'app.chat'
							},
							{
								title: 'Uitloggen',
								type: 'click',
								action: 'doLogOut()'
							}
						];
						break;
					case 'ouder':

						$scope.menucontent = [
							{
								title: 'Chat',
								type: 'click',
								action: 'goToSingleChat()'
							},
							{
								title: 'Absentie',
								type: 'sref',
								action: 'app.absence'
							},
							{
								title: 'Uitloggen',
								type: 'click',
								action: 'doLogOut()'
							}
						];

						break;
					default:
						$scope.menucontent = [
							{
								title: 'Uitloggen',
								type: 'click',
								action: 'doLogOut()'
							}
						];
						break;
				}


		// uitloggen
		$scope.doLogOut = function () {
			firebase.auth().signOut().then(function() {
				$state.go('login');
			}, function(error) {
				alert(error);
			});
		};


		// functie om naar de chat te gaan en als de chat nog niet bestaat om er 1 aan te maken
		$scope.goToSingleChat = function() {
			var users = fb.ref('users');
			var fireRef = users.orderByChild('email').equalTo(firebase.auth().currentUser.email);
			var userda = $firebaseArray(fireRef);
			userda.$loaded()
				.then(function () {
					var userid = parseInt(userda[0].$id);
					var chats = fb.ref('chats');
					var chatRef = chats.orderByChild('parentId').equalTo(userid);
					var chatdata = $firebaseArray(chatRef);
					chatdata.$loaded()
						.then(function () {
							if (chatdata.length > 0) {
								var chatid = chatdata[0].$id;
								$state.go('app.singleChat', {"chatID": chatid});

							} else {
								var chats = fb.ref('chats');

								chats.once('value', function (data) {

									var allChats = data.val();
									if (allChats == null) {
										writeChatData(0, [], userid);
										$state.go('app.singleChat', {"chatID": 0});
									} else {
										writeChatData(allChats.length, [], userid);
										$state.go('app.singleChat', {"chatID": allChats.length});
									}
								});
							}
						});
				});

		}
	})

	.controller('parentHomeCtrl', function($scope, $ionicModal, $state, $firebaseArray) {
		// het home scherm van de ouder vullen met items
		$scope.menucontent = [
			{
				title: 'Chat',
				type: 'click',
				action: 'goToSingleChat()'
			},
			{
				title: 'Absentie',
				type: 'sref',
				action: 'app.absence'
			},
			{
				title: 'Uitloggen',
				type: 'click',
				action: 'doLogOut()'
			}
		];

	})
    .controller('AuthCtrl', function ($scope, $state, $ionicModal, $firebaseArray, $ionicHistory) {
    	// de login pagina
	    $scope.title = "Login";
        $scope.logo = "img/logo.png";
	    $scope.data = {};
		var fb = firebase.database();
		var users = fb.ref('users');
		// een listener voor het wijzigen van de gebruiker status
		firebase.auth().onAuthStateChanged(function(user) {
		    if (user) {
		    	if($state.current.name == 'login') {

					var fireRef = users.orderByChild('email').equalTo(user.email);
					var curuser = $firebaseArray(fireRef);

					curuser.$loaded()
						.then(function () {
							angular.forEach(curuser, function(user) {
								// naar de juiste pagina gaan voor de huidige gebruikers rol
								window.localStorage.setItem('role', user.role);
								role = user.role;
								switch (role) {
									case 'ouder':
										$ionicHistory.clearCache().then(function(){ $state.go('app.parentHome') });

									break;
									case 'leidster':
										$ionicHistory.clearCache().then(function(){$state.go('app.group')});
									break;
									default:
										$ionicHistory.clearCache().then(function(){$state.go('login')});
									break;

								}
						})
					})
			    }
		    }
	    });


        $scope.doLogIn = function () {
			// inloggen met email en wachtwoord
        	var auth = firebase.auth();
	        var email = $scope.data.username;
	        var password = $scope.data.password;

        	auth.signInWithEmailAndPassword(email, password).catch(function (error) {
		        var errorCode = error.code;
		        var errorMessage = error.message;
		        if (errorCode === 'auth/wrong-password') {
			        alert('Wrong password.');
		        } else {
			        alert(errorMessage);
		        }
	        });
        }

    })
    
    .controller('ManagementCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
    	// firebase object aanmaken
		var fb = firebase.database();

    })

	.controller('ChildGroupCtrl', function ($scope, $stateParams, $firebaseArray, $state, $filter, $ionicHistory) {
		// firebase object aanmaken
		var fb = firebase.database();

		// timestamp aanmaken voor de datum zonder tijd
		var date = new Date();
		var newdate = $filter('date')(new Date(date), 'yyyy-MM-dd');
		var time = Math.round(new Date(newdate).getTime()/1000);
		var currtime = time - 7200;
		var realtime = currtime += '000';

		var groups = fb.ref('groups');
		// de groep ophalen die gelijk staat aan de huidige datum
		var fireRef = groups.orderByChild('date').equalTo(realtime);
		var allgroups = $firebaseArray(fireRef);


		allgroups.$loaded()
			.then(function(){
				angular.forEach(allgroups, function(groups) {
					var childref = fb.ref('groups/' + groups.$id + '/childs');
					$scope.childs = $firebaseArray(childref);
					$scope.groups = groups.$id;
				})
			});


		$scope.notPresence = function(groupid, id){

			function writeChildData(id, ispresence) {
				fb.ref('groups/' + groupid + '/childs/' + id).update({
					isprecence: ispresence
				});
			}

			writeChildData(id, 0);

			$state.go('app.group', {}, {reload:true});

		}

	})

	.controller('childDetailCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		var fb = firebase.database();

		var childID = $stateParams.childId;
		var child = fb.ref("childs/" + childID);
		child.once('value', function (data) {
			$scope.child = data.val();
			$scope.child.id = childID;
		});



	})

	.controller('GroupCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		var fb = firebase.database();
		$scope.formData = {};
		$scope.object = {};
		$scope.isChecked = false;
		$scope.selected = [];
		$scope.childdata = [];
		$scope.childdetaildata = {};

		var Childs = fb.ref('childs');

		var fireRef = Childs.orderByChild('isDeleted').equalTo(0);
		$scope.allChilds = $firebaseArray(fireRef);

		$scope.addGroupDate = function(){
			var date = $scope.formData.date.getTime();

			var groups = fb.ref('groups');

			groups.once('value', function (data) {

				var allGroups = data.val();

				if(allGroups == null){
					$state.go('app.addgroupchild',{ date: date });
				}else{
					angular.forEach(allGroups, function(group) {

						if(group.date == date){
							$ionicHistory.goBack();
						}else{
							$state.go('app.addgroupchild',{ date: date });
						}
					})
				}

			});

		};

		$scope.checkedOrNot = function (asset, isChecked, index) {
			if (isChecked) {
				$scope.selected.push(asset);
			} else {
				var _index = $scope.selected.indexOf(asset);
				$scope.selected.splice(_index, 1);
			}
		};

		function writeDataData(userId, date) {
			fb.ref('groups/' + userId).set({
				date: date
			});
		}

		$scope.addGroupChild = function () {
			var groupDate = $stateParams.date;

			var groups = fb.ref('groups');

			groups.once('value', function (data) {

				var allGroups = data.val();


				if (allGroups == null) {
					writeDataData(0, groupDate);

					angular.forEach($scope.selected, function(group) {
						$scope.childdetaildata = {
							id: group.$id,
							name: group.name,
							peculiarities : group.peculiarities
						};
						$scope.childdata.push($scope.childdetaildata);
					});
					fb.ref('/groups/' + 0 ).update({ childs:  $scope.childdata});

					var backView = $ionicHistory.viewHistory().views[$ionicHistory.viewHistory().backView.backViewId];
					$ionicHistory.viewHistory().forcedNav = {
						viewId:     backView.viewId,
						navAction: 'moveBack',
						navDirection: 'back'
					};
					backView && backView.go();
				} else {
					var groepslength = allGroups.length;
					writeDataData(groepslength, groupDate);

					angular.forEach($scope.selected, function(group) {
						$scope.childdetaildata = {
							id: group.$id,
							name: group.name,
							peculiarities : group.peculiarities,
							isprecence : 1
						};
						$scope.childdata.push($scope.childdetaildata);
					});
					fb.ref('/groups/' + groepslength ).update({ childs:  $scope.childdata});

					var backView = $ionicHistory.viewHistory().views[$ionicHistory.viewHistory().backView.backViewId];
					$ionicHistory.viewHistory().forcedNav = {
						viewId:     backView.viewId,
						navAction: 'moveBack',
						navDirection: 'back'
					};
					backView && backView.go();
				}

			});
		}

	})

	.controller('GroupChangeCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		var fb = firebase.database();

		var Groups = fb.ref('groups');

		var fireRef = Groups.orderByChild('date');
		$scope.allGroups= $firebaseArray(fireRef);

	})

	.controller('GroupChangeChildCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		var fb = firebase.database();
		$scope.isChecked = false;
		$scope.selected = [];
		$scope.childdata = [];
		$scope.childdetaildata = {};

		var id = $stateParams.id;
		var group = fb.ref("groups/" + id);

		group.once('value', function (data) {
			$scope.date = data.val().date;

		});

		var Childs = fb.ref('childs');

		var fireRef = Childs.orderByChild('isDeleted').equalTo(0);
		$scope.allChilds = $firebaseArray(fireRef);

		$scope.checkedOrNot = function (asset, isChecked, index) {
			if (isChecked) {
				$scope.selected.push(asset);
			} else {
				var _index = $scope.selected.indexOf(asset);
				$scope.selected.splice(_index, 1);
			}
		};

		$scope.changeGroupChild = function(){
			angular.forEach($scope.selected, function(group) {
				$scope.childdetaildata = {
					id: group.$id,
					name: group.name,
					peculiarities : group.peculiarities,
					isprecence : 1
				};
				$scope.childdata.push($scope.childdetaildata);
			});

			group.remove();
			group.set({
				childs:  $scope.childdata,
				date: $scope.date
			});
			var backView = $ionicHistory.viewHistory().views[$ionicHistory.viewHistory().backView.backViewId];
			$ionicHistory.viewHistory().forcedNav = {
				viewId:     backView.viewId,
				navAction: 'moveBack',
				navDirection: 'back'
			};
			backView && backView.go();
		}


	})

	.controller('ChildCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		var user = firebase.auth().currentUser;
		var fb = firebase.database();
        $scope.formData = {};

		var Childs = fb.ref('childs');

		var fireRef = Childs.orderByChild('isDeleted').equalTo(0);
		$scope.allChilds = $firebaseArray(fireRef);

		function writeChildData(userId, name, date_of_birth, email, phonenumber, second_phonenumber, docter_phonenumber, homedocter_phonenumber, peculiarities, isDeleted) {
            fb.ref('childs/' + userId).set({
                name: name,
                date_of_birth: date_of_birth,
                email : email,
                phonenumber : phonenumber,
                second_phonenumber: second_phonenumber,
                docter_phonenumber: docter_phonenumber,
                homedocter_phonenumber: homedocter_phonenumber,
                peculiarities : peculiarities,
				isDeleted : isDeleted
            });
        }

        $scope.doChildAdd = function(){
            var date_of_birth = $scope.formData.date_of_birth.getTime();

            var childs = fb.ref('childs');

            childs.once('value', function (data) {

                var allChilds = data.val();

                if($scope.formData.second_phonenumber == null){
                    $scope.formData.second_phonenumber = 0;
                }

                if (allChilds == null) {
                    writeChildData(0, $scope.formData.name, date_of_birth, $scope.formData.email, $scope.formData.phonenumber, $scope.formData.second_phonenumber, $scope.formData.docter_phonenumber, $scope.formData.homedocter_phonenumber, $scope.formData.peculiarities, 0);
	                $ionicHistory.goBack();
				} else {
                    writeChildData(allChilds.length, $scope.formData.name, date_of_birth, $scope.formData.email, $scope.formData.phonenumber, $scope.formData.second_phonenumber, $scope.formData.docter_phonenumber, $scope.formData.homedocter_phonenumber, $scope.formData.peculiarities, 0);
	                $ionicHistory.goBack();
				}
            });
        }

    })

	.controller('ChangeChildCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		var fb = firebase.database();
		$scope.formData = {};

		var childID = $stateParams.childId;
		var child = fb.ref("childs/" + childID);
		child.once('value', function (data) {
			$scope.formData = data.val();
		});

		function writeChildData(userId, name, date_of_birth, email, phonenumber, second_phonenumber, docter_phonenumber, homedocter_phonenumber, peculiarities, isDeleted) {
			fb.ref('childs/' + userId).set({
				name: name,
				date_of_birth: date_of_birth,
				email : email,
				phonenumber : phonenumber,
				second_phonenumber: second_phonenumber,
				docter_phonenumber: docter_phonenumber,
				homedocter_phonenumber: homedocter_phonenumber,
				peculiarities : peculiarities,
				isDeleted : isDeleted
			});
		}

		$scope.doChildUpdate = function(){
			var date_of_birth = $scope.formData.date_of_birth.getTime();

			writeChildData(childID, $scope.formData.name, date_of_birth, $scope.formData.email, $scope.formData.phonenumber, $scope.formData.second_phonenumber, $scope.formData.docter_phonenumber, $scope.formData.homedocter_phonenumber, $scope.formData.peculiarities, 0);
			var backView = $ionicHistory.viewHistory().views[$ionicHistory.viewHistory().backView.backViewId];
			$ionicHistory.viewHistory().forcedNav = {
				viewId:     backView.viewId,
				navAction: 'moveBack',
				navDirection: 'back'
			};
			backView && backView.go();
		}
	})

	.controller('DeleteChildCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		var fb = firebase.database();
		var Childs = fb.ref('childs');

		var fireRef = Childs.orderByChild('isDeleted').equalTo(0);
		$scope.allChilds = $firebaseArray(fireRef);

		function writeChildData(userId, isDeleted) {
			fb.ref('childs/' + userId).update({
				isDeleted : isDeleted
			});
		}

		$scope.doChildDelete = function($id){

			writeChildData($id, 1);
			$state.go('app.management');
		}
	})

	.controller('ChatCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		var fb = firebase.database();
		var chats = fb.ref('chats');
		var allChats = $firebaseArray(chats);

		allChats.$loaded()
			.then(function(){
				angular.forEach(allChats, function(chat) {
					var parent = fb.ref("users/" + chat.parentId);
					var parents = $firebaseArray(parent);

					parents.$loaded()
						.then(function(){
							angular.forEach(parents, function (parentdata) {
								if(parentdata.$id == 'name') {
									chat.name = parentdata.$value;
								}
							});
							$scope.allChats = allChats;
						})

				})
			});






		$scope.goToSingleChat = function(chatID) {
			$state.go('app.singleChat', {"chatID": chatID});
		}
	})

	.controller('SingleChatCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicScrollDelegate, $window, $timeout, $ionicHistory) {
		init();
		function init() {
		var fb = firebase.database();
		var chatid = $stateParams['chatID'];
		$scope.chatid = chatid;
		var messagesent = false;
		$scope.sendMessage = function (type, image) {
			if (!messagesent) {
				messagesent = true;
				var message = $scope.formData.messageContent;
				var users = fb.ref('users');
				var fireRef = users.orderByChild('email').equalTo(firebase.auth().currentUser.email);
				var userdata = $firebaseArray(fireRef);
				userdata.$loaded()
					.then(function () {
						var messages = fb.ref('chats/' + $stateParams['chatID'] + '/messages');
						var messagedata = $firebaseArray(messages);
						messagedata.$loaded()
							.then(function () {
								var date = new Date();

								if (type == 'text') {
									if (messagedata.length <= 0) {
										writeMessageData($stateParams['chatID'], 0, message, date.getTime(), 0, parseInt(userdata[0].$id), type);
									} else {
										writeMessageData($stateParams['chatID'], messagedata.length, message, date.getTime(), 0, parseInt(userdata[0].$id), type);
									}
								} else {
									if (messagedata.length <= 0) {
										writeMessageData($stateParams['chatID'], 0, 'image', date.getTime(), 0, parseInt(userdata[0].$id), type);
										writeImageData($stateParams['chatID'], 0, image)
									} else {
										writeMessageData($stateParams['chatID'], messagedata.length, 'image', date.getTime(), 0, parseInt(userdata[0].$id), type);
										writeImageData($stateParams['chatID'], messagedata.length, image)
									}
								}
								$state.go($state.current, {}, {reload: true});
							});

					});
			} else {
			//
			}

		};

			var chats = fb.ref('chats/' + chatid);
			var chat = $firebaseArray(chats);
			$scope.formData = {};



			chat.$loaded()
				.then(function(){

					$timeout(function() {
						$scope.messages = chat[0];

						angular.forEach(chat[0], function (chatdata, key) {

							var messageDate = new Date(chatdata.datetime);
							chatdata.messageDate = messageDate.getDate() + '-' + messageDate.getMonth() + '-' + messageDate.getFullYear() + ' ' + messageDate.getHours() + ':' + messageDate.getMinutes();

							chatdata.imageloaded = false;
							chatdata.id = key;
							var users = fb.ref("users/" + chatdata.userId);
							var user = $firebaseArray(users);
							user.$loaded()
								.then(function () {
									angular.forEach(user, function (userdat) {
										if (userdat.$id == 'name') {

											chatdata.name = userdat.$value;
										}
										if (userdat.$id == 'email') {
											var curuser = firebase.auth().currentUser;
											var curemail;
											if (curuser) {
												curemail = curuser.email;
											} else {
												$state.go('login');
											}

											if (curemail == userdat.$value) {
												chatdata.self = true;
											} else {
												chatdata.self = false;
											}


										}
									});

								});
						});
						$('.loader').hide();
						$ionicScrollDelegate.scrollBottom();
					})
				});
		}
		function writeMessageData(chatId, messageId, content, datetime, read, userId, type) {
			var fb = firebase.database();
			fb.ref('chats/' + chatId + '/messages/' + messageId).set({
				content: content,
				datetime: datetime,
				read : read,
				userId : userId,
				type: type
			});
			init();
		}
		function writeImageData(chatId, messageId, content) {
			var fb = firebase.database();
			fb.ref('imagedata/' + chatId + '/images/' + messageId).set({
				image: content
			});
			init();
		}




		var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];
		$(".ion-android-attach").click(function () {
			$scope.imageUpload();
		});
		
		$scope.loadImg = function (messageId) {
			var fb = firebase.database();
			var imageref = fb.ref("imagedata/" + $scope.chatid + '/images/' + messageId);
			var image = $firebaseArray(imageref);

			image.$loaded()
				.then(function () {
					if(!$scope.messages[messageId].imageloaded) {
						$scope.messages[messageId].imageloaded = true;
						$(".img-" + messageId).attr("src", image[0].$value);
					}

				});


		};
		$scope.imageUpload = function(ele) {


			var sFileName = $("#imageUpload").val();
			if (sFileName.length > 0) {
				var blnValid = false;
				for (var j = 0; j < _validFileExtensions.length; j++) {
					var sCurExtension = _validFileExtensions[j];
					if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
						blnValid = true;
						var filesSelected = document.getElementById("imageUpload").files;
						if (filesSelected.length > 0) {
							var fileToLoad = filesSelected[0];

							var fileReader = new FileReader();

							fileReader.onload = function(fileLoadedEvent) {

								$scope.sendMessage('image', fileLoadedEvent.target.result)
							};

							fileReader.readAsDataURL(fileToLoad);
						}
						break;
					}
				}

				if (!blnValid) {
					alert('File is not valid');
					return false;
				}
			}

			return true;



		};
		$scope.openUpload = function() {
			$("#imageUpload").click();
		};
	})


	.controller('PresenceCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {

		var fb = firebase.database();
		var users = fb.ref('users');
		$scope.users = [];

		var lessonID = $stateParams.lessonID;
		var lesson = fb.ref("lessons/" + lessonID);
		lesson.once('value', function (data) {
			var currentclass = data.val().class;
			var fireRef = users.orderByChild("class").equalTo(currentclass);
			var allUsers = $firebaseArray(fireRef);
			$scope.presentcheck = [];

			allUsers.$loaded()
				.then(function() {
					angular.forEach(allUsers, function (user) {
						$scope.users.push(user);
						var isFilled = false;

						var fbPresence = fb.ref("lessons/" + lessonID + '/presence');
						fbPresence.on('value', function (presence) {
							var userPresence = presence.val();

							for (var i = 0; i < userPresence.length; i++) {
								if(userPresence[i].email == user.email) {
									$scope.presentcheck.push({
										email: user.email,
										present: userPresence[i].present
									});
									isFilled = true
								}

							}
							if(!isFilled) {
								$scope.presentcheck.push({
									email: user.email,
									present: 0
								});
							}
						});

					});
				});

		});
		
		$scope.isPresent = function (email, index) {
			if($scope.presentcheck[index].present == 1) {
				$scope.presentcheck[index].present = 0;
			} else {
				$scope.presentcheck[index].present = 1;
			}

		};

		$scope.submitPresence = function () {
				fb.ref().child('/lessons/' + lessonID).update({ presence:  $scope.presentcheck});
				$state.go('app.singleLesson', {"lessonID": lessonID});
		}


	})


	.controller('UserTypeListCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {

	})

	.controller('SelectParentCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		var fb = firebase.database();

		var users = fb.ref('users');

		var fireRef = users.orderByChild('role').equalTo('ouder');
		$scope.allParents = $firebaseArray(fireRef);

	})
	
	.controller('SelectParentChildCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		var fb = firebase.database();
		$scope.formData = {};
		$scope.isChecked = false;
		$scope.selected = [];
		$scope.childdata = [];
		$scope.childdetaildata = {};

		var parentid = $stateParams.parentid;

		var childs = fb.ref("childs");

		var fireRef = childs.orderByChild('isDeleted').equalTo(0);
		$scope.allChilds = $firebaseArray(fireRef);

		$scope.checkedOrNot = function (asset, isChecked, index) {
			if (isChecked) {
				$scope.selected.push(asset);
			} else {
				var _index = $scope.selected.indexOf(asset);
				$scope.selected.splice(_index, 1);
			}
		};

		$scope.linkChildChild = function() {

			angular.forEach($scope.selected, function (child) {
				$scope.childdetaildata = {
					id: child.$id,
					name: child.name
				};
				$scope.childdata.push($scope.childdetaildata);
			})

			fb.ref('/users/' + parentid ).update({ childs:  $scope.childdata});
			$state.go('app.management');

		}

	})

	.controller('UserCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		$scope.formData = {};
		var userType = $stateParams.userType;
		$scope.userType = userType;
		var user = firebase.auth().currentUser;
		if (user) {
			var curemail = user.email;
		} else {
			$state.go('login');
		}



		$scope.addUser = function (userType) {
			$state.go('app.user_add', {userType: userType});
		};
		var fb = firebase.database();

		var classes = fb.ref("classes");

		classes.on('value', function (classdata) {
			$scope.classes = classdata.val();
		});

		var users = fb.ref('users');

		var selectedUsers = [];
		users.orderByChild("role").equalTo(userType).on("child_added", function(snapshot) {
			var userid = snapshot.key;

			var curuser = fb.ref("users/" + userid);

			curuser.on('value', function (userdata) {
				selectedUsers.push(userdata.val());
			})

		});
		$scope.selectedUsers = selectedUsers;


		function writeUserData(userId, email, name, role) {


				fb.ref('users/' + userId).set({
					email: email,
					name: name,
					role : role
				});
		}

		$scope.doUserAdd = function () {


			var users = fb.ref('users');
			var hasAdded = false;

			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					if(user.email != curemail) {
						firebase.auth().signOut().then(function () {
							firebase.auth().signInWithEmailAndPassword(curemail, $scope.formData.currentUserPassword).catch(function (error) {
								// Handle Errors here.
								var errorCode = error.code;
								var errorMessage = error.message;

								alert(errorMessage);
							});
						}).catch(function (error) {
							alert(error);
						});
					} else if(!hasAdded) {
						hasAdded = true;
						users.once('value', function (data) {
							var allUsers = data.val();

							if (allUsers == null) {
									writeUserData(0, $scope.formData.email, $scope.formData.name , userType, $scope.formData.class);
								} else {
									writeUserData(allUsers.length, $scope.formData.email, $scope.formData.name , userType, '');
								}


						});

						$state.go('app.management');

					}

				} else {
					// No user is signed in.
				}
			});

			firebase.auth().createUserWithEmailAndPassword($scope.formData.email, $scope.formData.password).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				alert(errorMessage);
				// ...
			});


		}
	})


	.controller('ClassesCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		var fb = firebase.database();
		$scope.formData = {};

		var classes = fb.ref('classes');

		var fireRef = classes.orderByChild('name');
		$scope.classes = $firebaseArray(fireRef);

		var users = fb.ref('users');

		function writeClassData(userId, name) {
			fb.ref('classes/' + userId).set({
				name: name
			});
		}

		users.on('value', function (data) {
			$scope.users = data.val();
		});

		$scope.doClassAdd = function () {
			var students = $scope.formData.students;
			var classes = fb.ref('classes');
			var users = fb.ref('users');
			for (var i = 0; i < students.length; i++) {
				users.orderByChild("email").equalTo(students[i]).on("child_added", function (snapshot) {
					var userid = snapshot.key;
					fb.ref().child('/users/' + userid).update({ class:  $scope.formData.name});
				})

			}

			classes.once('value', function (data) {

				var allClasses = data.val();

				if (allClasses == null) {
					writeClassData(0, $scope.formData.name);
				} else {
					writeClassData(allClasses.length, $scope.formData.name);
				}
			})
		}
	})

    .controller('LessonCtrl', function($scope, $state, $ionicHistory){
	    $scope.title = "Les toevoegen";
        var fb = firebase.database();
        $scope.formData = {};

        var classes = fb.ref('classes');

        classes.on('value', function (data) {
	       $scope.classes = data.val();
        });

        function writeLessonData(userId, title, description, begin_date, end_date, the_class) {
            fb.ref('lessons/' + userId).set({
                title: title,
                description: description,
                begin_date : begin_date,
                end_date : end_date,
	            class: the_class
            });
            $state.go('app.rooster');
        }


        $scope.doLessonAdd = function () {
			var begin_date = $scope.formData.begin_datetime.getTime();
			var end_date = $scope.formData.end_datetime.getTime();

			var lessons = fb.ref('lessons');

			lessons.once('value', function (data) {

				var allLessons = data.val();

				if (allLessons == null) {
					writeLessonData(0, $scope.formData.title, $scope.formData.description, begin_date, end_date, $scope.formData.class);
				} else {
					writeLessonData(allLessons.length, $scope.formData.title, $scope.formData.description, begin_date, end_date, $scope.formData.class);
				}
			});
		}
    })

	.controller('AbsenceCtrl', function($scope, $state, $firebaseArray, $filter, $ionicHistory){
		var user = firebase.auth().currentUser;
		var fb = firebase.database();
		var users = fb.ref('users');


		if (user) {
			var curemail = user.email;
		} else {
			$state.go('login');
		}

		var userref = users.orderByChild('email').equalTo(curemail);
		var curuser = $firebaseArray(userref);

		var absence = fb.ref('absence');
		$scope.allAbsence = [];
		$scope.userAbsence = [];
		$scope.formData = {};

		curuser.$loaded()
			.then(function () {
				angular.forEach(curuser, function (user) {

					var fireRef = absence.orderByChild('email').equalTo(curemail);
					var allAbsence = $firebaseArray(fireRef);


					allAbsence.$loaded()
						.then(function () {
							allAbsence.reverse();
							$scope.allAbsence = allAbsence;
						});


				})
			});


		function writeAbsenceData(absenceId, reason, kind, date, childid, email) {
			fb.ref('absence/' + absenceId).set({
				kind: kind,
				reason: reason,
				date : date,
				childId : childid,
				email: email
			});
		}
		$scope.doAbsenceRemove = function (absenceId){
			var curabsence = fb.ref('absence/' + absenceId);
			curabsence.once('value', function(data){
				var absencedata = data.val();
				var date = absencedata.date;
				var childid = absencedata.childId;

				var groupsref = fb.ref('groups').orderByChild('date').equalTo(date);
				var groups = $firebaseArray(groupsref);
				groups.$loaded()
					.then(function () {
						var groupid = groups[0].$id;
						var groupchildref = fb.ref('groups/' + groupid + '/childs').orderByChild('id').equalTo(childid);
						var groupchild = $firebaseArray(groupchildref);
						groupchild.$loaded()
							.then(function () {
								fb.ref('groups/' + groupid + '/childs/' + groupchild[0].$id ).update({
									isprecence: 1
								});
							});


					});



			});
			curabsence.remove();
		};
		$scope.doAbsenceAdd = function (){

			var date = $scope.formData.date;
			var newdate = $filter('date')(new Date(date), 'yyyy-MM-dd');
			var time = Math.round(new Date(newdate).getTime()/1000);
			var currtime = time - 7200;
			var realtime = currtime + '000';
			var childid = curuser[0].childs[0].id;



			var absence = fb.ref('absence');

			absence.once('value', function(data){

				var allAbsence = data.val();

				var groupsref = fb.ref('groups').orderByChild('date').equalTo(realtime);
				var groups = $firebaseArray(groupsref);
				groups.$loaded()
					.then(function () {
						var groupid = groups[0].$id;
						var groupchildref = fb.ref('groups/' + groupid + '/childs').orderByChild('id').equalTo(childid);
						var groupchild = $firebaseArray(groupchildref);
						groupchild.$loaded()
							.then(function () {
								fb.ref('groups/' + groupid + '/childs/' + groupchild[0].$id ).update({
									isprecence: 0
								});
							});


					});


				if(allAbsence == null){
					writeAbsenceData(0, $scope.formData.reason, $scope.formData.kind, realtime, childid, user.email);
					$state.go('app.absence');
				}else{
					writeAbsenceData(allAbsence.length, $scope.formData.reason, $scope.formData.kind, realtime, childid, user.email);
					$state.go('app.absence');
				}



				});

		}


	})


	.controller('ChildAbsence', function($scope, $state, $firebaseArray, $filter, $stateParams, $ionicHistory){
		var childID = $stateParams.childId;
		var fb = firebase.database();
		var fireRef = fb.ref('absence').orderByChild('childId').equalTo(childID);
		var allAbsence = $firebaseArray(fireRef);

		allAbsence.$loaded()
			.then(function () {
				allAbsence.reverse();
				$scope.allAbsence = allAbsence;
			});
	})



;


