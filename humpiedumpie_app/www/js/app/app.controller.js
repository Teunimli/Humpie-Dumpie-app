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
			// refereren naar de users tabel
			var users = fb.ref('users');
			// refereren naar de user die gelijk is aan de huidige user email
			var fireRef = users.orderByChild('email').equalTo(firebase.auth().currentUser.email);
			// de user ophalen
			var userda = $firebaseArray(fireRef);
			userda.$loaded()
				.then(function () {
					// userid ophalen
					var userid = parseInt(userda[0].$id);
					// de chat ophalen die bij de userid hoort
					var chats = fb.ref('chats');
					var chatRef = chats.orderByChild('parentId').equalTo(userid);
					var chatdata = $firebaseArray(chatRef);
					chatdata.$loaded()
						.then(function () {
							// naar de chat van de huidige gebruiker gaan
							$state.go('app.singleChat', {"chatID": chatdata[0].$id});
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
					// de user ophalen die gelijk is aan de huidige email
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
										// cache clearen om het menu goed te laten zien voordat de user naar het volgende scherm gaat
										$ionicHistory.clearCache().then(function(){ $state.go('app.parentHome') });

									break;
									case 'leidster':
										// cache clearen om het menu goed te laten zien voordat de user naar het volgende scherm gaat
										$ionicHistory.clearCache().then(function(){$state.go('app.group')});
									break;
									default:
										// cache clearen om het menu goed te laten zien voordat de user naar het volgende scherm gaat
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



    })

	.controller('ChildGroupCtrl', function ($scope, $stateParams, $firebaseArray, $state, $filter, $ionicHistory) {
		// refresh functie om de groepen opnieuw te laden
		$scope.doRefresh = function () {
			init();
			$scope.$broadcast('scroll.refreshComplete');
		};
		init();
		function init() {
			// firebase object aanmaken
			var fb = firebase.database();

			// timestamp aanmaken voor de datum zonder tijd
			var date = new Date();
			var newdate = $filter('date')(new Date(date), 'yyyy-MM-dd');
			var time = Math.round(new Date(newdate).getTime() / 1000);
			if(window.cordova){
				//voor in de app
				var realtime = time + '000';
			}else{
				//voor op computer werkend te krijgen
			 	var currtime = time - 7200;
				var realtime = currtime + '000';
			}


			var groups = fb.ref('groups');
			// de groep ophalen die gelijk staat aan de huidige datum
			var fireRef = groups.orderByChild('date').equalTo(realtime);
			var allgroups = $firebaseArray(fireRef);


			allgroups.$loaded()
				.then(function () {
					angular.forEach(allgroups, function (groups) {
						// kinderen van de huidige groep ophalen
						var childref = fb.ref('groups/' + groups.$id + '/childs');
						$scope.childs = $firebaseArray(childref);
						$scope.groups = groups.$id;
					})
				});
		}
		// functie om een kind af te melden
		$scope.notPresence = function(groupid, id){
			var fb = firebase.database();
			// functie om de aanwezigheid te updaten van een kind
			function writeChildData(id, ispresence) {
				fb.ref('groups/' + groupid + '/childs/' + id).update({
					isprecence: ispresence
				});
			}
			// functie aanroepen
			writeChildData(id, 0);
			// pagina reloaden
			$state.go('app.group', {}, {reload:true});

		}

	})

	.controller('childDetailCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		// firebase database object
		var fb = firebase.database();
		// het kind id ophalen uit de state parameters
		var childID = $stateParams.childId;
		// refereren naar het kind in firebase
		var child = fb.ref("childs/" + childID);
		// het kind ophalen
		child.once('value', function (data) {
			$scope.child = data.val();
			$scope.child.id = childID;
		});



	})

	.controller('GroupCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		// het firebase database object
		var fb = firebase.database();
		// lege objecten aanmaken om te vullen
		$scope.formData = {};
		$scope.object = {};
		$scope.isChecked = false;
		$scope.selected = [];
		$scope.childdata = [];
		$scope.childdetaildata = {};

		// referentie maken naar de childs tabel
		var Childs = fb.ref('childs');

		// refereren naar de kinderen die niet verwijderd zijn
		var fireRef = Childs.orderByChild('isDeleted').equalTo(0);

		// de kinderen ophalen
		$scope.allChilds = $firebaseArray(fireRef);

		// datum van de groep selecteren en naar het scherm gaan om de kinderen te selecteren
		$scope.addGroupDate = function(){
			// de datum uit het form halen
			var date = $scope.formData.date.getTime();
			// referentie naar de groepen tabel
			var groups = fb.ref('groups');
			// de groepen ophalen
			groups.once('value', function (data) {
				// object met alle groepen
				var allGroups = data.val();
				// kijken of er nog geen groepen zijn
				if(allGroups == null){
					$state.go('app.addgroupchild',{ date: date });
				}else{
					angular.forEach(allGroups, function(group) {
						// kijken of de groep al bestaat
						if(group.date == date){
							$ionicHistory.goBack();
						}else{
							$state.go('app.addgroupchild',{ date: date });
						}
					})
				}

			});

		};
		// een kind aan de array toevoegen of er uit halen wie er in de groep zit
		$scope.checkedOrNot = function (asset, isChecked, index) {
			if (isChecked) {
				$scope.selected.push(asset);
			} else {
				var _index = $scope.selected.indexOf(asset);
				$scope.selected.splice(_index, 1);
			}
		};
		// groep aanmaken
		function writeDataData(groupId, date) {
			fb.ref('groups/' + groupId).set({
				date: date
			});
		}
		// functie om de kinderen aan de groep toe te voegen
		$scope.addGroupChild = function () {
			// de datum van de groep op halen die in de state parameters staat
			var groupDate = $stateParams.date;

			var groups = fb.ref('groups');
			// de groepen ophalen
			groups.once('value', function (data) {
				// alle groepen in een object
				var allGroups = data.val();

				// als er geen groepen bestaan
				if (allGroups == null) {
					// groep aanmaken
					writeDataData(0, groupDate);
					// kinderen toevoegen aan groep
					angular.forEach($scope.selected, function(group) {
						$scope.childdetaildata = {
							id: group.$id,
							name: group.name,
							peculiarities : group.peculiarities
						};
						$scope.childdata.push($scope.childdetaildata);
					});
					fb.ref('/groups/' + 0 ).update({ childs:  $scope.childdata});
					// ga 2 states terug
					$ionicHistory.goBack(-2);
				} else {
					var groepslength = allGroups.length;
					// groep aanmaken
					writeDataData(groepslength, groupDate);
					// kinderen toevoegen aan groep
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
					// ga 2 states terug
					$ionicHistory.goBack(-2);
				}

			});
		}

	})

	.controller('GroupChangeCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		// het firebase database object
		var fb = firebase.database();
		// refrentie naar de groepen tabel
		var Groups = fb.ref('groups');
		// groepen orderen bij datum
		var fireRef = Groups.orderByChild('date');
		// groepen ophalen
		$scope.allGroups= $firebaseArray(fireRef);

	})

	.controller('GroupChangeChildCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		// het firebase database object
		var fb = firebase.database();
		// lege objecten aanmaken om te vullen
		$scope.isChecked = false;
		$scope.selected = [];
		$scope.childdata = [];
		$scope.childdetaildata = {};
		// het groep id ophalen uit de state parameters
		var id = $stateParams.id;
		// refereren naar de groep in firebase
		var group = fb.ref("groups/" + id);
		// de groep ophalen
		group.once('value', function (data) {
			// de datum in een variabele zetten
			$scope.date = data.val().date;

		});
		// refereren naar de childs tabel
		var Childs = fb.ref('childs');
		// kinderen selecteren die niet verwijderd zijn
		var fireRef = Childs.orderByChild('isDeleted').equalTo(0);
		// de kinderen ophalen
		$scope.allChilds = $firebaseArray(fireRef);

		// functie om een kind aan te vinken of weg te halen en in de array of uit de array te halen
		$scope.checkedOrNot = function (asset, isChecked, index) {
			if (isChecked) {
				// zet het kind in de array
				$scope.selected.push(asset);
			} else {
				// haal het kind uit de array
				var _index = $scope.selected.indexOf(asset);
				$scope.selected.splice(_index, 1);
			}
		};
		// de functie om de groep te updaten
		$scope.changeGroupChild = function(){
			//elk kind met zijn gegevens in een array zetten
			angular.forEach($scope.selected, function(group) {
				$scope.childdetaildata = {
					id: group.$id,
					name: group.name,
					peculiarities : group.peculiarities,
					isprecence : 1
				};
				$scope.childdata.push($scope.childdetaildata);
			});
			// de oude groep verwijderen
			group.remove();
			// de nieuwe groep er in zetten
			group.set({
				childs:  $scope.childdata,
				date: $scope.date
			});
			// 2 states terug gaan
			$ionicHistory.goBack(-2);
		}


	})

	.controller('ChildCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		// de huidige user ophalen
		var user = firebase.auth().currentUser;
		// het firebase database object
		var fb = firebase.database();
		// leeg object om te vullen
        $scope.formData = {};
		// referentie naar de childs tabel
		var Childs = fb.ref('childs');
		// de kinderen selecteren die niet verwijderd zijn
		var fireRef = Childs.orderByChild('isDeleted').equalTo(0);
		// de kinderen ophalen
		$scope.allChilds = $firebaseArray(fireRef);

		// functie om een kind aan te maken
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
		// functie om de kind aanmaak functie aan te roepen
        $scope.doChildAdd = function(){
			// de geboortedatum als timestamp
            var date_of_birth = $scope.formData.date_of_birth.getTime();
			// referentie naar de childs tabel
            var childs = fb.ref('childs');
			// de kinderen ophalen
            childs.once('value', function (data) {
				// object met alle kinderen
                var allChilds = data.val();
				// kijken of er een 2e telefoonnummer is
                if($scope.formData.second_phonenumber == null){
                    $scope.formData.second_phonenumber = 0;
                }
				// kijken of er al kinderen bestaan daarna kinderen aanmaken
                if (allChilds == null) {
                    writeChildData(0, $scope.formData.name, date_of_birth, $scope.formData.email, $scope.formData.phonenumber, $scope.formData.second_phonenumber, $scope.formData.docter_phonenumber, $scope.formData.homedocter_phonenumber, $scope.formData.peculiarities, 0);
	                // een state terug gaan
                    $ionicHistory.goBack();
				} else {
                    writeChildData(allChilds.length, $scope.formData.name, date_of_birth, $scope.formData.email, $scope.formData.phonenumber, $scope.formData.second_phonenumber, $scope.formData.docter_phonenumber, $scope.formData.homedocter_phonenumber, $scope.formData.peculiarities, 0);
	                // een state terug gaan
                    $ionicHistory.goBack();
				}
            });
        }

    })

	.controller('ChildsCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		// het firebase database object
		var fb = firebase.database();
		// alle kinderen ophalen die niet verwijderd zijn
		$scope.childs  = $firebaseArray(fb.ref("childs").orderByChild('isDeleted').equalTo(0));


	})

	.controller('ChangeChildCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		// firebase database object
		var fb = firebase.database();
		// leeg object om te vullen
		$scope.formData = {};
		// het childid uit de state parameters halen
		var childID = $stateParams.childId;
		// refereren naar het kind in firebase
		var child = fb.ref("childs/" + childID);
		// het kind ophalen
		child.once('value', function (data) {
			// alle gegevens van het kind in een variabele zetten
			$scope.formData = data.val();
		});
		// de functie om een kind aan te maken
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
		// het kind updaten
		$scope.doChildUpdate = function(){
			writeChildData(childID, $scope.formData.name, $scope.formData.date_of_birth, $scope.formData.email, $scope.formData.phonenumber, $scope.formData.second_phonenumber, $scope.formData.docter_phonenumber, $scope.formData.homedocter_phonenumber, $scope.formData.peculiarities, 0);
			// 2 states terug gaan
			$ionicHistory.goBack(-2);
		}
	})

	.controller('DeleteChildCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		// het firebase database object
		var fb = firebase.database();
		// referentie naar de childs tabel
		var Childs = fb.ref('childs');
		// kinderen selecteren die niet verwijderd zijn
		var fireRef = Childs.orderByChild('isDeleted').equalTo(0);
		// de kinderen ophalen
		$scope.allChilds = $firebaseArray(fireRef);
		// het kind op verwijderd zetten ( dus archiveren)
		function writeChildData(userId, isDeleted) {
			fb.ref('childs/' + userId).update({
				isDeleted : isDeleted
			});
		}
		// de functie om te verwijderen aanroepen
		$scope.doChildDelete = function($id){

			writeChildData($id, 1);
			// een state terug gaan
			$ionicHistory.goBack();
		}
	})

	.controller('ChatCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		// het firebase database object
		var fb = firebase.database();
		// referentie naar de chat tabel
		var chats = fb.ref('chats');
		// alle chats opphalen
		chats.on('value', function (data) {
			// de chats in een variabele zetten
			var allChats = data.val();
			angular.forEach(allChats, function(chat, key) {
				// het chat id
				chat.$id = key;
				// kijken of er een ongelezen bericht is
				if(chat.lastsend != firebase.auth().currentUser.email && chat.read == 0) {
					chat.dobold = true;
				} else {
					chat.dobold = false;
				}
				// de user ophalen met het parentid
				var parent = fb.ref("users/" + chat.parentId);
				var parents = $firebaseArray(parent);

				parents.$loaded()
					.then(function(){
						angular.forEach(parents, function (parentdata) {
							// de chat name ophalen
							if(parentdata.$id == 'name') {
								chat.name = parentdata.$value;
							}
						});
						// alle chats in een variabele zetten
						$scope.allChats = allChats;
					})

			})
		});






		// functie om naar een chat te gaan
		$scope.goToSingleChat = function(chatID) {
			$state.go('app.singleChat', {"chatID": chatID});
		}
	})

	.controller('SingleChatCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicScrollDelegate, $window, $timeout, $ionicHistory) {
		// init functie aanroepen om de chat op te halen
		init();
		function init() {
			// het firebase database object
			var fb = firebase.database();
			// het chat id uit de state parameters halen
			var chatid = $stateParams['chatID'];
			$scope.chatid = chatid;
			var messagesent = false;
			// functie om een bericht te versturen
			$scope.sendMessage = function (type, image) {
				// kijken of het bericht al verstuurd is
				if (!messagesent) {
					// het messagesent variabele op true zetten zodat het bericht niet nog een keer verstuurd wordt
					messagesent = true;
					// de content van het bericht
					var message = $scope.formData.messageContent;
					// referentie naar de users tabel
					var users = fb.ref('users');
					// de user selecteren die gelijk is aan de huidige email
					var fireRef = users.orderByChild('email').equalTo(firebase.auth().currentUser.email);
					// de user ophalen
					var userdata = $firebaseArray(fireRef);
					userdata.$loaded()
						.then(function () {
							// referentie naar de berichten van de huidige chat
							var messages = fb.ref('chats/' + $stateParams['chatID'] + '/messages');
							// de berichten ophalen
							var messagedata = $firebaseArray(messages);
							messagedata.$loaded()
								.then(function () {
									var date = new Date();
									// kijken of het een bericht is of een afbeelding
									if (type == 'text') {
										// bericht aanmaken
										if (messagedata.length <= 0) {
											writeMessageData($stateParams['chatID'], 0, message, date.getTime(), 0, parseInt(userdata[0].$id), type);
										} else {
											writeMessageData($stateParams['chatID'], messagedata.length, message, date.getTime(), 0, parseInt(userdata[0].$id), type);
										}
									} else {
										// bericht aanmaken en een afbeelding in de imagedata tabel zetten
										if (messagedata.length <= 0) {
											writeMessageData($stateParams['chatID'], 0, 'image', date.getTime(), 0, parseInt(userdata[0].$id), type);
											writeImageData($stateParams['chatID'], 0, image)
										} else {
											writeMessageData($stateParams['chatID'], messagedata.length, 'image', date.getTime(), 0, parseInt(userdata[0].$id), type);
											writeImageData($stateParams['chatID'], messagedata.length, image)
										}
									}
									// de page reloaden
									$state.go($state.current, {}, {reload: true});
								});

						});
				} else {
				//
				}

			};
				// referentie naar de huidige chat
				var chats = fb.ref('chats/' + chatid);
				// een leeg object om te vullen
				$scope.formData = {};

				// de chat ophalen
				chats.on('value', function (data) {
					// het chat object in een variable gezet
					var chat = data.val();
					// alle berichten van de chat
					$scope.messages = chat.messages;
					// bericht op gelezen zetten
					if(chat.lastsend != firebase.auth().currentUser.email) {
						fb.ref('chats/' + chatid).update({
							read: 1
						});
					}
					// loop door alle berichten
					angular.forEach(chat.messages, function (chatdata, key) {
						// de datum van een bericht ophalen
						var messageDate = new Date(chatdata.datetime);
						// de weergave van de datum in een variabale zetten
						chatdata.messageDate = messageDate.getDate() + '-' + messageDate.getMonth() + '-' + messageDate.getFullYear() + ' ' + messageDate.getHours() + ':' + messageDate.getMinutes();
						// afbeelding loaded op false zetten
						chatdata.imageloaded = false;
						// het chat id
						chatdata.id = key;
						// referentie naar de user
						var users = fb.ref("users/" + chatdata.userId);
						// de user ophalen
						var user = $firebaseArray(users);
						user.$loaded()
							.then(function () {
								angular.forEach(user, function (userdat) {
									if (userdat.$id == 'name') {
										// de naam van de zender
										chatdata.name = userdat.$value;
									}
									if (userdat.$id == 'email') {
										// huidige gebruiker ophalen
										var curuser = firebase.auth().currentUser;
										var curemail;
										if (curuser) {
											curemail = curuser.email;
										} else {
											$state.go('login');
										}
										// kijken of het bericht van de user is of van iemand anders
										if (curemail == userdat.$value) {
											chatdata.self = true;
										} else {
											chatdata.self = false;
										}


									}
								});
								// naar de onderkant van de pagina scrollen
								$ionicScrollDelegate.scrollBottom();
							});
					});
					// loader verbergen
					$('.loader').hide();
					// naar de onderkant van de pagina scrollen
					$ionicScrollDelegate.scrollBottom();
				});

		}
		// functie om een bericht in de database te zetten
		function writeMessageData(chatId, messageId, content, datetime, read, userId, type) {
			var fb = firebase.database();
			fb.ref('chats/' + chatId + '/messages/' + messageId).set({
				content: content,
				datetime: datetime,
				read : read,
				userId : userId,
				type: type
			});
			fb.ref('chats/' + chatId).update({
				lastsend: firebase.auth().currentUser.email,
				read: 0
			});
			// berichten opnieuw ophalen met de init functie
			init();
		}
		// functie om een afbeelding in de database te zetten
		function writeImageData(chatId, messageId, content) {
			var fb = firebase.database();
			fb.ref('imagedata/' + chatId + '/images/' + messageId).set({
				image: content
			});
			// berichten opnieuw ophalen met de init functie
			init();
		}



		// welke extenties er in mogen
		var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];
		// de upload openen
		$(".ion-android-attach").click(function () {
			$scope.imageUpload();
		});
		// de afbeelding inladen
		$scope.loadImg = function (messageId) {
			// het firebase database object
			var fb = firebase.database();
			// de referentie naar de afbeelding
			var imageref = fb.ref("imagedata/" + $scope.chatid + '/images/' + messageId);
			// de afbeelding ophalen
			var image = $firebaseArray(imageref);

			image.$loaded()
				.then(function () {
					if(!$scope.messages[messageId].imageloaded) {
						// imageloaded op true zetten en de src invullen op de ingeladen afbeelding
						$scope.messages[messageId].imageloaded = true;
						$(".img-" + messageId).attr("src", image[0].$value);
					}

				});


		};
		$scope.imageUpload = function(ele) {
			// de geselecteerde afbeelding selecteren en dan overzetten naar base64 met filereader

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
								// het bericht verzenden functie aanroepen met de afbeelding als base64
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
			// het upload venster openen
			$("#imageUpload").click();
		};
	})



	.controller('UserTypeListCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {

	})

	.controller('SelectParentCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		// het firebase database object
		var fb = firebase.database();
		// referentie naar de users tabel
		var users = fb.ref('users');
		// de users selecteren die de role ouder hebben
		var fireRef = users.orderByChild('role').equalTo('ouder');
		// de ouders ophalen
		$scope.allParents = $firebaseArray(fireRef);

	})
	
	.controller('SelectParentChildCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {
		// het firebase database object
		var fb = firebase.database();
		// lege objecten om te vullen
		$scope.formData = {};
		$scope.isChecked = false;
		$scope.selected = [];
		$scope.childdata = [];
		$scope.childdetaildata = {};
		// de parent id uit de state parameters halen
		var parentid = $stateParams.parentid;
		// referentie naar naar de childs tabel
		var childs = fb.ref("childs");
		// kinderen selecteren die niet verwijderd zijn
		var fireRef = childs.orderByChild('isDeleted').equalTo(0);
		// kinderen ophalen
		$scope.allChilds = $firebaseArray(fireRef);
		// kinderen toe voegen of uit de array verwijderen
		$scope.checkedOrNot = function (asset, isChecked, index) {
			if (isChecked) {
				$scope.selected.push(asset);
			} else {
				var _index = $scope.selected.indexOf(asset);
				$scope.selected.splice(_index, 1);
			}
		};
		// kinderen aan de ouder koppelen functie
		$scope.linkChildChild = function() {

			angular.forEach($scope.selected, function (child) {
				$scope.childdetaildata = {
					id: child.$id,
					name: child.name
				};
				$scope.childdata.push($scope.childdetaildata);
			})
			// kind aan ouder koppelen
			fb.ref('/users/' + parentid ).update({ childs:  $scope.childdata});

			// 2 states terug gaan
			$ionicHistory.goBack(-2);

		}

	})

	.controller('UserCtrl', function ($scope, $stateParams, $firebaseArray, $state, $ionicHistory) {

		$scope.formData = {};
		// de huidge user ophalen
		var userType = $stateParams.userType;
		$scope.userType = userType;
		var user = firebase.auth().currentUser;
		if (user) {
			var curemail = user.email;
		} else {
			$state.go('login');
		}


		// naar user toevoegen pagina gaan
		$scope.addUser = function (userType) {
			$state.go('app.user_add', {userType: userType});
		};
		// het firebase database object
		var fb = firebase.database();
		// referentie naar de classes tabel
		var classes = fb.ref("classes");
		// classes ophalen
		classes.on('value', function (classdata) {
			$scope.classes = classdata.val();
		});
		// referentie naar de users tabel
		var users = fb.ref('users');
		// lege array met geselecteerde gebruikers
		var selectedUsers = [];
		// users ophalen met de geselecteerde rol
		users.orderByChild("role").equalTo(userType).on("child_added", function(snapshot) {
			var userid = snapshot.key;
			// referentie naar de user in de users tabel
			var curuser = fb.ref("users/" + userid);
			// de user ophalen
			curuser.on('value', function (userdata) {
				selectedUsers.push(userdata.val());
			})

		});
		// geselecteerde users in de scope zetten
		$scope.selectedUsers = selectedUsers;

		// de functie om een user aan te maken
		function writeUserData(userId, email, name, role) {


				fb.ref('users/' + userId).set({
					email: email,
					name: name,
					role : role
				});


		}
		// de functie om een chat aan te maken
		function writeChatData(chatId, messages, parentId) {
			fb.ref('chats/' + chatId).set({
				messages: messages,
				parentId: parentId
			});
		}

		$scope.doUserAdd = function () {
			// kijken of het wachtwoord van de huidige gebruiker klopt
			firebase.auth().currentUser.reauthenticate(firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, $scope.formData.currentUserPassword)).then(function (user) {
				// referentie naar de users tabel
				var users = fb.ref('users');
				var hasAdded = false;
				// kijken of er al een user bestaat met die email
				var inputuser = $firebaseArray(users.orderByChild('email').equalTo($scope.formData.email));

				inputuser.$loaded()
					.then(function(){
						if(inputuser.length < 1) {
							// als de user is aangemaakt wordt deze listener uitgevoerd
							firebase.auth().onAuthStateChanged(function (user) {
								if (user) {
									if (user.email != curemail) {
										// aangemaakte uitloggen en inloggen met je account
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
									} else if (!hasAdded) {
										hasAdded = true;
										// user toevoegen aan database met de rol
										users.once('value', function (data) {
											var allUsers = data.val();
											var userid;
											if (allUsers == null) {
												userid = 0;
												writeUserData(userid, $scope.formData.email, $scope.formData.name, userType);
											} else {
												userid = allUsers.length;
												writeUserData(userid, $scope.formData.email, $scope.formData.name, userType);
											}

											if (userType == 'ouder') {
												// als de aangemaakte user een ouder is moet er een chat worden aangemaakt

												var chats = fb.ref('chats');
												var chatRef = chats.orderByChild('parentId').equalTo(userid);
												var chatdata = $firebaseArray(chatRef);
												chatdata.$loaded()
													.then(function () {

														if (chatdata.length > 0) {

														} else {
															var chats = fb.ref('chats');

															chats.once('value', function (data) {

																var allChats = data.val();
																if (allChats == null) {
																	writeChatData(0, [], userid);
																} else {
																	writeChatData(allChats.length, [], userid);
																}
															});
														}
													});
											}


											$ionicHistory.goBack(-2);

										});
									}

								} else {
									// No user is signed in.
								}
							});
							// user aanmaken
							firebase.auth().createUserWithEmailAndPassword($scope.formData.email, $scope.formData.password).catch(function (error) {
								// Handle Errors here.
								var errorCode = error.code;
								var errorMessage = error.message;
								alert(errorMessage);
								// ...
							});
						} else {
							alert("gebruiker bestaat al");
						}
					});


			}).catch(function (error) {
				alert("Fout wachtwoord");

			});





			}


	})



	.controller('AbsenceCtrl', function($scope, $state, $firebaseArray, $filter, $ionicHistory){
		// de huidige gebruiker
		var user = firebase.auth().currentUser;
		// firebase database object
		var fb = firebase.database();
		// referentie naar de users tabel
		var users = fb.ref('users');

		// de email van de huidige gebruiker ophalen
		if (user) {
			var curemail = user.email;
		} else {
			$state.go('login');
		}
		// referentie naar de users die gelijk zijn aan de huidige email
		var userref = users.orderByChild('email').equalTo(curemail);
		// de huidige gebruiker uit de database halen
		var curuser = $firebaseArray(userref);
		// referentie naar de absence tabel
		var absence = fb.ref('absence');
		// lege objecten/arrays om te vullen
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
							// alle absenties van de huidige gebruiker ophalen
							allAbsence.reverse();
							$scope.allAbsence = allAbsence;
						});


				})
			});

		// nieuwe absentie in de database zetten
		function writeAbsenceData(absenceId, reason, kind, date, childid, email) {
			fb.ref('absence/' + absenceId).set({
				kind: kind,
				reason: reason,
				date : date,
				childId : childid,
				email: email
			});
		}
		// een absentie verwijderen
		$scope.doAbsenceRemove = function (absenceId){
			// de huidige absentie ophalen
			var curabsence = fb.ref('absence/' + absenceId);
			curabsence.once('value', function(data){
				// de absentie data
				var absencedata = data.val();
				// de absentie datum
				var date = absencedata.date;
				var childid = absencedata.childId;
				// de groep ophalen die gelijk is aan de datum
				var groupsref = fb.ref('groups').orderByChild('date').equalTo(date);
				var groups = $firebaseArray(groupsref);
				groups.$loaded()
					.then(function () {
						var groupid = groups[0].$id;
						var groupchildref = fb.ref('groups/' + groupid + '/childs').orderByChild('id').equalTo(childid);
						var groupchild = $firebaseArray(groupchildref);
						// het kind op aanwezig zetten als de absentie verwijderd wordt
						groupchild.$loaded()
							.then(function () {
								fb.ref('groups/' + groupid + '/childs/' + groupchild[0].$id ).update({
									isprecence: 1
								});
							});


					});



			});
			// de absentie verwijderen
			curabsence.remove();
		};
		$scope.doAbsenceAdd = function (){
			// de datum als timestamp zetten zonder de tijd
			var date = $scope.formData.date;
			var newdate = $filter('date')(new Date(date), 'yyyy-MM-dd');
			var time = Math.round(new Date(newdate).getTime()/1000);
			var currtime = time - 7200;
			var realtime = currtime + '000';
			var childid = curuser[0].childs[0].id;


			// referentie naar de absentie tabel
			var absence = fb.ref('absence');
			// absenties ophalen
			absence.once('value', function(data){
				// alle absentie in een variabele zetten
				var allAbsence = data.val();
				// referentie naar de groep die gelijk is aan de datum
				var groupsref = fb.ref('groups').orderByChild('date').equalTo(realtime);
				var groups = $firebaseArray(groupsref);
				groups.$loaded()
					.then(function () {
						var groupid = groups[0].$id;
						var groupchildref = fb.ref('groups/' + groupid + '/childs').orderByChild('id').equalTo(childid);
						var groupchild = $firebaseArray(groupchildref);
						groupchild.$loaded()
							// kind op afwezig zetten
							.then(function () {
								fb.ref('groups/' + groupid + '/childs/' + groupchild[0].$id ).update({
									isprecence: 0
								});
							});


					});

				// absentie toevoegen
				if(allAbsence == null){
					writeAbsenceData(0, $scope.formData.reason, $scope.formData.kind, realtime, childid, user.email);
					$ionicHistory.goBack();
				}else{
					writeAbsenceData(allAbsence.length, $scope.formData.reason, $scope.formData.kind, realtime, childid, user.email);
					$ionicHistory.goBack();
				}



				});

		}


	})


	.controller('ChildAbsence', function($scope, $state, $firebaseArray, $filter, $stateParams, $ionicHistory){
		var childID = $stateParams.childId;
		// firebase databse object
		var fb = firebase.database();
		// kind selecteren met het childid in de abscence tabel
		var fireRef = fb.ref('absence').orderByChild('childId').equalTo(childID);
		var allAbsence = $firebaseArray(fireRef);
		// alle absenties van een kind ophalen
		allAbsence.$loaded()
			.then(function () {
				// de array omdraaien om de laatste datum eerst te zetten.
				allAbsence.reverse();
				$scope.allAbsence = allAbsence;
			});
	})



;


