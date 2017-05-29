angular.module('humpieDumpie.app.controllers', [])

	.controller('AppCtrl', function($scope, $ionicModal, $state, $firebaseArray) {
		$scope.logo = "img/logo.png";
		var curemail;
		var user = firebase.auth().currentUser;
		if (user) {
			curemail = user.email;
		} else {
			$state.go('login');
		}

		var fb = firebase.database();
		var users = fb.ref('users');
		var role;
		$scope.menucontent = [];




		function writeChatData(chatId, messages, parentId) {
			fb.ref('chats/' + chatId).set({
				messages: messages,
				parentId: parentId
			});
		}
		var fireRef = users.orderByChild('email').equalTo(curemail);
		var curuser = $firebaseArray(fireRef);

		curuser.$loaded()
			.then(function () {
				angular.forEach(curuser, function(user) {
					role = user.role;
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
				})
			});

		$scope.doLogOut = function () {
			firebase.auth().signOut().then(function() {
				$state.go('login');
			}, function(error) {
				alert(error);
			});
		};

		$scope.goToUsers = function (userType) {
			$state.go('app.users', {userType: userType});
		};
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
							console.log(chatdata.length);
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

    .controller('AuthCtrl', function ($scope, $state, $ionicModal, $firebaseArray) {
	    $scope.title = "Login";
        $scope.logo = "img/logo.png";
	    $scope.data = {};
		var fb = firebase.database();
		var users = fb.ref('users');
		firebase.auth().onAuthStateChanged(function(user) {
		    if (user) {
		    	if($state.current.name == 'login') {

					var fireRef = users.orderByChild('email').equalTo(user.email);
					var curuser = $firebaseArray(fireRef);

					curuser.$loaded()
						.then(function () {
							angular.forEach(curuser, function(user) {
								role = user.role;
								switch (role) {
									case 'ouder':
										$state.go('app.group');
									break;
									case 'leidster':
										$state.go('app.group');
									break;
									default:
										$state.go('login');
									break;

								}
						})
					})
			    }
		    }
	    });


        $scope.doLogIn = function () {

			console.log('test2');
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
    
    .controller('ManagementCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
		var fb = firebase.database();

    })

	.controller('ChildGroupCtrl', function ($scope, $stateParams, $firebaseArray, $state, $filter) {
		var fb = firebase.database();

		var date = new Date();
		var newdate = $filter('date')(new Date(date), 'yyyy-MM-dd');
		var time = Math.round(new Date(newdate).getTime()/1000);
		var currtime = time - 7200;
		var realtime = currtime += '000';

		var groups = fb.ref('groups');

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

	.controller('childDetailCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
		var fb = firebase.database();

		var childID = $stateParams.childId;
		var child = fb.ref("childs/" + childID);
		child.once('value', function (data) {
			$scope.child = data.val();
		});


	})

	.controller('GroupCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
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
							$state.go('app.management');
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

					$state.go('app.management');
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

					$state.go('app.management');
				}

			});
		}

	})

	.controller('GroupChangeCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
		var fb = firebase.database();

		var Groups = fb.ref('groups');

		var fireRef = Groups.orderByChild('date');
		$scope.allGroups= $firebaseArray(fireRef);

	})

	.controller('GroupChangeChildCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
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
					peculiarities : group.peculiarities
				};
				$scope.childdata.push($scope.childdetaildata);
			});

			group.remove();
			group.set({
				childs:  $scope.childdata,
				date: $scope.date
			});
			$state.go('app.management');
		}


	})

	.controller('ChildCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
		var user = firebase.auth().currentUser;
		var fb = firebase.database();
        $scope.formData = {};

		var Childs = fb.ref('groups/' + groupid + '/childs');

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
					$state.go('app.management');
				} else {
                    writeChildData(allChilds.length, $scope.formData.name, date_of_birth, $scope.formData.email, $scope.formData.phonenumber, $scope.formData.second_phonenumber, $scope.formData.docter_phonenumber, $scope.formData.homedocter_phonenumber, $scope.formData.peculiarities, 0);
					$state.go('app.management');
				}
            });
        }

    })

	.controller('ChangeChildCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
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
			$state.go('app.management');
		}
	})

	.controller('DeleteChildCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
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

	.controller('ChatCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
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
								console.log(parentdata);
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

	.controller('SingleChatCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicScrollDelegate, $window, $timeout) {

		var fb = firebase.database();
		var chatid = $stateParams['chatID'];
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
										writeMessageData($stateParams['chatID'], 0, image, date.getTime(), 0, parseInt(userdata[0].$id), type);
									} else {
										writeMessageData($stateParams['chatID'], messagedata.length, image, date.getTime(), 0, parseInt(userdata[0].$id), type);
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

						angular.forEach(chat[0], function (chatdata) {

							var messageDate = new Date(chatdata.datetime);
							chatdata.messageDate = messageDate.getDate() + '-' + messageDate.getMonth() + '-' + messageDate.getFullYear() + ' ' + messageDate.getHours() + ':' + messageDate.getMinutes();
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

		function writeMessageData(chatId, messageId, content, datetime, read, userId, type) {
			fb.ref('chats/' + chatId + '/messages/' + messageId).set({
				content: content,
				datetime: datetime,
				read : read,
				userId : userId,
				type: type
			});
			// $state.go('app.rooster');
		}




		var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];
		$(".ion-android-attach").click(function () {
			$scope.imageUpload();
		});
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

	.controller('AdminCtrl', function($scope, $state, $firebaseArray) {
		$scope.title = 'Admin overzicht';

		$scope.menucontent = [
			{
				title: 'Leerlingen',
				type: 'click',
				action: 'goToUsers(\'leerling\')'
			},
			{
				title: 'Docenten',
				type: 'click',
				action: 'goToUsers(\'docent\')'
			},
			{
				title: 'Roostermakers',
				type: 'click',
				action: 'goToUsers(\'roostermaker\')'
			},
			{
				title: 'Admins',
				type: 'click',
				action: 'goToUsers(\'admin\')'
			},
			{
				title: 'Klassen',
				type: 'sref',
				action: 'app.classes'
			},
			{
				title: 'Lokalen',
				type: 'sref',
				action: ''
			}
		];

		var fb = firebase.database();
		var users = fb.ref('users');
		var user = firebase.auth().currentUser;

		if (user) {
			var curemail = user.email;
		} else {
			$state.go('login');
		}

		var role;


		var fireRef = users.orderByChild('email').equalTo(curemail);
		var curuser = $firebaseArray(fireRef);

		curuser.$loaded()
			.then(function () {
				angular.forEach(curuser, function (user) {
					role = user.role;

					switch (role) {
						case 'leerling':
							$scope.canAdd = false;
							break;
						case 'docent':
							$scope.canAdd = false;
							break;
						case 'roostermaker':
							$scope.canAdd = true;
							break;
						case 'admin':
							$scope.canAdd = true;
							break;
						default:
							$scope.canAdd = false;
							break;
					}
				})
			})
	})




	.controller('PresenceCtrl', function ($scope, $stateParams, $firebaseArray, $state) {

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


	.controller('UserTypeListCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
		console.log('UserTypeListCtrl');
	})

	.controller('SelectParentCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
		var fb = firebase.database();

		var users = fb.ref('users');

		var fireRef = users.orderByChild('role').equalTo('ouder');
		$scope.allParents = $firebaseArray(fireRef);

	})
	
	.controller('SelectParentChildCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
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

	.controller('UserCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
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


	.controller('ClassesCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
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

    .controller('LessonCtrl', function($scope, $state){
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

	.controller('AbsenceCtrl', function($scope, $state, $firebaseArray){
		var user = firebase.auth().currentUser;
		var fb = firebase.database();
		var users = fb.ref('users');


		if (user) {
			var curemail = user.email;
		} else {
			$state.go('login');
		}

		var role;


		var userref = users.orderByChild('email').equalTo(curemail);
		var curuser = $firebaseArray(userref);

		var absence = fb.ref('absence');
		var allAbsence;
		$scope.allAbsence = [];
		$scope.userAbsence = [];
		$scope.formData = {};

		curuser.$loaded()
			.then(function () {
				angular.forEach(curuser, function (user) {
					role = user.role;
					var fireRef;
					switch (role) {
						case 'leerling':
							$scope.canAdd = true;
							fireRef = absence.orderByChild('email').equalTo(curemail);
							allAbsence = $firebaseArray(fireRef);
							console.log($scope.allAbsence);
							break;
						case 'docent':
							$scope.canAdd = false;
							fireRef = absence.orderByChild('viewed').equalTo(0);
							allAbsence = $firebaseArray(fireRef);
							break;
						case 'roostermaker':
							$scope.canAdd = false;
							fireRef = absence.orderByChild('viewed').equalTo(0);
							allAbsence = $firebaseArray(fireRef);
							break;
						case 'admin':
							$scope.canAdd = false;
							fireRef = absence.orderByChild('viewed').equalTo(0);
							allAbsence = $firebaseArray(fireRef);
							break;
						default:
							$scope.canAdd = false;
							fireRef = absence.orderByChild('viewed').equalTo(0);
							allAbsence = $firebaseArray(fireRef);
							break;
					}

					allAbsence.$loaded()
						.then(function () {
							allAbsence.reverse();
						});

					$scope.allAbsence = allAbsence;
				})
			});




		// Voorbeeld voor snelle firebase communicatie
		//		var fireRef = absence.orderByChild('viewed').equalTo(0);
		//		$scope.allAbsence = $firebaseArray(fireRef);



		function writeAbsenceData(userId, reson, description, begin_date, end_date, approved, email,displayname,viewed) {
			fb.ref('absence/' + userId).set({
				reson: reson,
				description: description,
				begin_date : begin_date,
				end_date : end_date,
				approved : approved,
				email : email,
				displayname: displayname,
				viewed: viewed
			});
		}

		$scope.doAbsenceAdd = function (){
			var begin_date = $scope.formData.begin_datetime.getTime();
			var end_date = $scope.formData.end_datetime.getTime();


			absence.once('value', function(data){
				users.orderByChild("email").equalTo(user.email).on("child_added", function(usersid) {
					var userid = usersid.key;
					var userTable = fb.ref("users/" + userid);
					userTable.on('value', function (userdata) {

					var name = userdata.val();

				var allAbsence = data.val();

				if(allAbsence == null){
					writeAbsenceData(0, $scope.formData.reson, $scope.formData.description, begin_date, end_date, 0, user.email, name.name,0);
					$state.go('app.absence');
				}else{
					writeAbsenceData(allAbsence.length, $scope.formData.reson, $scope.formData.description, begin_date, end_date, 0, user.email, name.name,0);
					$state.go('app.absence');
				}


					})
				});

			});

		}


	})

	.controller('AbsenceDetailCtrl', function($scope, $stateParams, $state){
		var id = $stateParams.absenceId;
		var absence = firebase.database().ref("absence/" + id);
		absence.once('value', function (data) {
			$scope.absence = data.val();
		})

		function updatePost(approved,viewed) {

			firebase.database().ref().child('/absence/' + id).update({ approved:  approved, viewed: viewed});

		}

		$scope.approved = function(){
			updatePost(1, 1);
			$state.go('app.absence');
		}

		$scope.cancel = function(){
			updatePost(0, 1);
			$state.go('app.absence');
		}

	})

	.controller('ClassesDetailCtrl', function($scope, $stateParams, $ionicSideMenuDelegate, $state, $ionicTabsDelegate,$firebaseArray){
		var fb = firebase.database();
		var id = $stateParams.classesId;
		var clas = fb.ref("classes/" + id);
		var classes = fb.ref('classes');

		clas.once('value', function (data) {
			$scope.clas = data.val();
		 	var currentclass = data.val();
			$scope.title = currentclass.name;

		$scope.lessonsMonday = [];
		$scope.lessonsTuesday = [];
		$scope.lessonsWednesday = [];
		$scope.lessonsThursday = [];
		$scope.lessonsFriday = [];
		var curdate = new Date();
		var date = curdate.getDay() - 1;

		$scope.$watch('$viewContentLoaded', function () {
			$ionicTabsDelegate.select(date);
		});

		var times = [];
		var hours = 8;
		var minutes = '00';
		var user = firebase.auth().currentUser;

		$scope.goToDay = function (day) {
			$state.go('app.AbsenceDetailCtrl', {dayOfWeek: day})
		};

		function getWeekNumber(d) {
			// Copy date so don't modify original
			d = new Date(+d);
			d.setHours(0, 0, 0, 0);
			// Set to nearest Thursday: current date + 4 - current day number
			// Make Sunday's day number 7
			d.setDate(d.getDate() + 4 - (d.getDay() || 7));
			// Get first day of year
			var yearStart = new Date(d.getFullYear(), 0, 1);
			// Calculate full weeks to nearest Thursday
			return Math.ceil(( ( (d - yearStart) / 86400000) + 1) / 7);
		}

		do {
			times.push(hours + ':' + minutes);
			$scope.lessonsMonday.push({
				"ID": 0,
				"hour": hours,
				"minutes": minutes,
				"hasLesson": false,
				"title": '',
				"description": ''
			});
			$scope.lessonsTuesday.push({
				"ID": 0,
				"hour": hours,
				"minutes": minutes,
				"hasLesson": false,
				"title": '',
				"description": ''
			});
			$scope.lessonsWednesday.push({
				"ID": 0,
				"hour": hours,
				"minutes": minutes,
				"hasLesson": false,
				"title": '',
				"description": ''
			});
			$scope.lessonsThursday.push({
				"ID": 0,
				"hour": hours,
				"minutes": minutes,
				"hasLesson": false,
				"title": '',
				"description": ''
			});
			$scope.lessonsFriday.push({
				"ID": 0,
				"hour": hours,
				"minutes": minutes,
				"hasLesson": false,
				"title": '',
				"description": ''
			});
			if (minutes == '00') {
				minutes = 0;
			}

			if (minutes < 40) {
				minutes += 20;

			} else {
				hours++;
				minutes = '00';
			}
		}
		while (hours <= 22);

		$scope.times = times;


			var lessons = fb.ref('lessons');
			var fireRef = lessons.orderByChild("class").equalTo(currentclass.name);
			var allLessons = $firebaseArray(fireRef);

			allLessons.$loaded()
				.then(function () {
					angular.forEach(allLessons, function (lesson) {

						var startdate = new Date(lesson.begin_date);
						var enddate = new Date(lesson.end_date);
						if (curdate.getFullYear() === startdate.getFullYear()) {
							if (curdate.getMonth() === startdate.getMonth()) {
								if (getWeekNumber(curdate) === getWeekNumber(startdate)) {
									switch (startdate.getDay()) {
										case 1:
											for (var j = 0; j < $scope.lessonsMonday.length; j++) {
												if (startdate.getMinutes() == 0) {
													var minutes = '00';
												} else {
													var minutes = startdate.getMinutes();
												}
												if (!$scope.lessonsMonday[j].hasLesson) {
													if ($scope.lessonsMonday[j].hour == startdate.getHours() && $scope.lessonsMonday[j].minutes == minutes) {
														$scope.lessonsMonday[j].ID = lesson.$id;
														$scope.lessonsMonday[j].hasLesson = true;
														$scope.lessonsMonday[j].title = lesson.title;
														$scope.lessonsMonday[j].description = lesson.description;

														if (enddate.getHours() - startdate.getHours() > 0) {
															var looptime = 0;
															if (enddate.getMinutes() - startdate.getMinutes() > 0) {
																looptime += (enddate.getMinutes() - startdate.getMinutes()) / 20;
															}
															looptime += (enddate.getHours() - startdate.getHours()) * 3;

															for (var k = 1; k <= looptime; k++) {
																var number = j + k;
																$scope.lessonsMonday[number].hasLesson = true;
																$scope.lessonsMonday[number].ID = lesson.$id;

															}
														} else if (enddate.getMinutes() - startdate.getMinutes() > 0) {
															var looptime = (enddate.getMinutes() - startdate.getMinutes()) / 20;
															for (var k = 1; k <= looptime; k++) {
																var number = j + k;
																$scope.lessonsMonday[number].hasLesson = true;
																$scope.lessonsMonday[number].ID = lesson.$id;

															}
														}

													}
												}

											}
											break;
										case 2:
											for (var j = 0; j < $scope.lessonsTuesday.length; j++) {
												if (startdate.getMinutes() == 0) {
													var minutes = '00';
												} else {
													var minutes = startdate.getMinutes();
												}
												if (!$scope.lessonsTuesday[j].hasLesson) {
													if ($scope.lessonsTuesday[j].hour == startdate.getHours() && $scope.lessonsTuesday[j].minutes == minutes) {
														$scope.lessonsTuesday[j].ID = lesson.$id;
														$scope.lessonsTuesday[j].hasLesson = true;
														$scope.lessonsTuesday[j].title = lesson.title;
														$scope.lessonsTuesday[j].description = lesson.description;

														if (enddate.getHours() - startdate.getHours() > 0) {
															var looptime = 0;
															if (enddate.getMinutes() - startdate.getMinutes() > 0) {
																looptime += (enddate.getMinutes() - startdate.getMinutes()) / 20;
															}
															looptime += (enddate.getHours() - startdate.getHours()) * 3;

															for (var k = 1; k <= looptime; k++) {
																var number = j + k;
																$scope.lessonsTuesday[number].hasLesson = true;
																$scope.lessonsTuesday[number].ID = lesson.$id;

															}
														} else if (enddate.getMinutes() - startdate.getMinutes() > 0) {
															var looptime = (enddate.getMinutes() - startdate.getMinutes()) / 20;
															for (var k = 1; k <= looptime; k++) {
																var number = j + k;
																$scope.lessonsTuesday[number].hasLesson = true;
																$scope.lessonsTuesday[number].ID = lesson.$id;

															}
														}

													}
												}

											}
											break;
										case 3:
											for (var j = 0; j < $scope.lessonsWednesday.length; j++) {
												if (startdate.getMinutes() == 0) {
													var minutes = '00';
												} else {
													var minutes = startdate.getMinutes();
												}
												if (!$scope.lessonsWednesday[j].hasLesson) {
													if ($scope.lessonsWednesday[j].hour == startdate.getHours() && $scope.lessonsWednesday[j].minutes == minutes) {
														$scope.lessonsWednesday[j].ID = lesson.$id;
														$scope.lessonsWednesday[j].hasLesson = true;
														$scope.lessonsWednesday[j].title = lesson.title;
														$scope.lessonsWednesday[j].description = lesson.description;

														if (enddate.getHours() - startdate.getHours() > 0) {
															var looptime = 0;
															if (enddate.getMinutes() - startdate.getMinutes() > 0) {
																looptime += (enddate.getMinutes() - startdate.getMinutes()) / 20;
															}
															looptime += (enddate.getHours() - startdate.getHours()) * 3;

															for (var k = 1; k <= looptime; k++) {
																var number = j + k;
																$scope.lessonsWednesday[number].hasLesson = true;
																$scope.lessonsWednesday[number].ID = lesson.$id;

															}
														} else if (enddate.getMinutes() - startdate.getMinutes() > 0) {
															var looptime = (enddate.getMinutes() - startdate.getMinutes()) / 20;
															for (var k = 1; k <= looptime; k++) {
																var number = j + k;
																$scope.lessonsWednesday[number].hasLesson = true;
																$scope.lessonsWednesday[number].ID = lesson.$id;

															}
														}

													}
												}

											}
											break;
										case 4:
											for (var j = 0; j < $scope.lessonsThursday.length; j++) {
												if (startdate.getMinutes() == 0) {
													var minutes = '00';
												} else {
													var minutes = startdate.getMinutes();
												}
												if (!$scope.lessonsThursday[j].hasLesson) {
													if ($scope.lessonsThursday[j].hour == startdate.getHours() && $scope.lessonsThursday[j].minutes == minutes) {
														$scope.lessonsThursday[j].ID = lesson.$id;
														$scope.lessonsThursday[j].hasLesson = true;
														$scope.lessonsThursday[j].title = lesson.title;
														$scope.lessonsThursday[j].description = lesson.description;

														if (enddate.getHours() - startdate.getHours() > 0) {
															var looptime = 0;
															if (enddate.getMinutes() - startdate.getMinutes() > 0) {
																looptime += (enddate.getMinutes() - startdate.getMinutes()) / 20;
															}
															looptime += (enddate.getHours() - startdate.getHours()) * 3;

															for (var k = 1; k <= looptime; k++) {
																var number = j + k;
																$scope.lessonsThursday[number].hasLesson = true;
																$scope.lessonsThursday[number].ID = lesson.$id;

															}
														} else if (enddate.getMinutes() - startdate.getMinutes() > 0) {
															var looptime = (enddate.getMinutes() - startdate.getMinutes()) / 20;
															for (var k = 1; k <= looptime; k++) {
																var number = j + k;
																$scope.lessonsThursday[number].hasLesson = true;
																$scope.lessonsThursday[number].ID = lesson.$id;

															}
														}

													}
												}

											}
											break;
										case 5:
											for (var j = 0; j < $scope.lessonsFriday.length; j++) {
												if (startdate.getMinutes() == 0) {
													var minutes = '00';
												} else {
													var minutes = startdate.getMinutes();
												}
												if (!$scope.lessonsFriday[j].hasLesson) {
													if ($scope.lessonsFriday[j].hour == startdate.getHours() && $scope.lessonsFriday[j].minutes == minutes) {
														$scope.lessonsFriday[j].ID = lesson.$id;
														$scope.lessonsFriday[j].hasLesson = true;
														$scope.lessonsFriday[j].title = lesson.title;
														$scope.lessonsFriday[j].description = lesson.description;

														if (enddate.getHours() - startdate.getHours() > 0) {
															var looptime = 0;
															if (enddate.getMinutes() - startdate.getMinutes() > 0) {
																looptime += (enddate.getMinutes() - startdate.getMinutes()) / 20;
															}
															looptime += (enddate.getHours() - startdate.getHours()) * 3;

															for (var k = 1; k <= looptime; k++) {
																var number = j + k;
																$scope.lessonsFriday[number].hasLesson = true;
																$scope.lessonsFriday[number].ID = lesson.$id;

															}
														} else if (enddate.getMinutes() - startdate.getMinutes() > 0) {
															var looptime = (enddate.getMinutes() - startdate.getMinutes()) / 20;
															for (var k = 1; k <= looptime; k++) {
																var number = j + k;
																$scope.lessonsFriday[number].hasLesson = true;
																$scope.lessonsFriday[number].ID = lesson.$id;

															}
														}

													}
												}

											}
											break;
									}
								}
							}
						}
					})
				});
		});


		$scope.goToSingleLesson = function (lessonID) {

			$state.go('app.singleLesson', {"lessonID": lessonID});

		};

		clas.once('value', function (data) {
			$scope.clas = data.val();
			var currentclass = data.val();

			var users = fb.ref('users');
			var fireRef = users.orderByChild("class").equalTo(currentclass.name);
			$scope.allUsers = $firebaseArray(fireRef);

		});


	})


;


