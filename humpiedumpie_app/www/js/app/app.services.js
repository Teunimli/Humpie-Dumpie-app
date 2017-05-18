angular.module('humpieDumpie.app.services', [])

	.service('AbsenceService', function ($http, $rootScope, $q) {

		this.getAbsencePost = function (absenceId) {
			var dfd = $q.defer();

			var fb = firebase.database();
			var absence = fb.ref('absence');

			absence.orderByKey().once("child_added", function(approvedData){
                var absences = fb.ref("absence/" + absenceId);
                dfd.resolve(absences);
			});

			return dfd.promise;
 	
		};
	})
;