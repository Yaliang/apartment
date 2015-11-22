;(function () {
	/**
	 * The module is designed to prove all access relative to user
	 */
	
	function payJS() {
		return this
	}

	payJS.prototype.checkVenmo = function(o) {
		o = o || {}
		if (!window.userJS.checkLogin) {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
			return false
		}

		var crtUser = Parse.User.current()
		var VenmoToken = Parse.Object.extend('venmoToken')
		var query = new Parse.Query(VenmoToken)

		query.equalTo('user', crtUser)
		var timeLim = new Date(Date.now() - 30*60000)
		query.greaterThan('createdAt', timeLim)
		query.descending('createdAt')
		query.first({
			success: function(vToken) {
				if (!vToken) {
					if (o.error) {
						o.error(window.errorCode.notFindRecord)
					}
				} else if (o.success) {
					o.success(vToken)
				}
			},
			error: function(error) {
				console.log(error)
				if (o.error) {
					o.error(error)
				}
			}
		})

	}

	payJS.prototype.linkVenmo = function(o) {
		var request="session="+o.sessionToken+"&code="+o.code;
		$.post("http://apartment-api.azurewebsites.net/venmo",request).done(function(data) {
			if (data.code == 200) {
				if (o.success) {
					o.success()
				}
			} else {
				if (o.error) {
					o.error()
				}
			}
		});
	}
	
	payJS.prototype.redirectToVenmo = function(o) {
		window.location.href = "https://api.venmo.com/v1/oauth/authorize?client_id=3193&scope=make_payments%20access_profile&response_type=code";
	}

	window.payJS = new payJS()

}());