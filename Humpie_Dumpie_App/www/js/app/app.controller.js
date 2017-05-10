angular.module('rooster.app.controllers', [])

	.controller('AppCtrl', function($scope, $ionicModal, $state, $firebaseArray) {
		$scope.logo = "img/logo.png";

		var user = firebase.auth().currentUser;
		if (user) {
			var curemail = user.email;
		} else {
			$state.go('login');
		}


		var fb = firebase.database();
		var users = fb.ref('users');
		var role;
		$scope.menucontent = [];


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
									title: 'Rooster',
									type: 'sref',
									action: 'app.rooster'
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
						case 'docent':
							$scope.menucontent = [
								{
									title: 'Rooster',
									type: 'sref',
									action: 'app.rooster'
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
						case 'roostermaker':
							$scope.menucontent = [
								{
									title: 'Klassen',
									type: 'sref',
									action: 'app.classes'
								},
								{
									title: 'Lessen',
									type: 'sref',
									action: ''
								},
								{
									title: 'Lokalen',
									type: 'click',
									action: ''
								},
								{
									title: 'Uitloggen',
									type: 'click',
									action: 'doLogOut()'
								}
							];
							break;
						case 'admin':
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
									title: 'Rooster',
									type: 'sref',
									action: 'app.rooster'
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
										$state.go('app.rooster');
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

	.controller('GroupCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
		var fb = firebase.database();

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

	.controller('UserCtrl', function ($scope, $stateParams, $firebaseArray, $state) {
		console.log('test');
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
		console.log(userType);
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


		function writeUserData(userId, email, name, role, userClass) {

			if(role == 'leerling') {
				fb.ref('users/' + userId).set({
					email: email,
					name: name,
					role : role,
					class: userClass
				});
			} else {
				fb.ref('users/' + userId).set({
					email: email,
					name: name,
					role : role
				});
			}

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
								if(userType == 'leerling') {
									writeUserData(0, $scope.formData.email, $scope.formData.name , userType, $scope.formData.class);
								} else {
									writeUserData(0, $scope.formData.email, $scope.formData.name , userType, '');
								}

							} else {
								if(userType == 'leerling') {
									writeUserData(allUsers.length, $scope.formData.email, $scope.formData.name , userType, $scope.formData.class);
								} else {
									writeUserData(0, $scope.formData.email, $scope.formData.name , userType, '');

								}

							}

						});
						$state.go('app.users', {userType: userType});
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


