;(function () {
	/**
	 * The module is designed to prove all access relative to user
	 */
	
	function userJS() {
		return this
	}

	userJS.prototype.login = function(options) {
		options = options || {}
		if (!options.name || !options.psw) {
			return false
		}
		Parse.User.logIn(options.name, options.psd, {
			success: function(user) {
				if (options.success) {
					options.success(user)
				}
			},
			error: function(user, error) {
				if (options.error) {
					options.error(error)
				}
			}
		})
	}

	userJS.prototype.signup = function(options) {
		options = options || {}
		if (!options.email || !options.psw) {
			return false
		}
		var user = new Parse.User()
		user.set("username", options.email)
		user.set("email", options.email)
		user.set("password", options.psw)
		user.signUp(null, {
			success: function(user) {
				if (options.success) {
					options.success(user)
				}
			},
			error: function(user, error) {
				if (options.error) {
					options.error(error)
				}
			}
		})
	}

	userJS.prototype.checkLogin = function(o) {
		o = o || {}
		var crtUser = Parse.User.current()
		if (crtUser) {
			if (o.success) {
				o.success(crtUser)
				return true
			}
		} else {
			if (o.error) {
				o.error(window.errorCode.noLogin)
				return false
			}
		}
	}

	userJS.prototype.checkVenmo = function(o) {
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
				if (o.success) {
					o.success(vToken)
				}
			},
			error: function(error) {
				if (o.error) {
					o.error(error)
				}
			}
		})

	}

	userJS.prototype.linkVenmo = function(o) {
		o = o || {}
		var crtUser = Parse.User.current()
		if (crtUser) {
			var VenmoToken = Parse.Object.extend('venmoToken')
			var vToken = new VenmoToken()

			vToken.set('user', crtUser)
			vToken.set('venmo', o.token)
			vToken.save(null, {
				success: function(vToken) {
					if (o.success) {
						o.success(vToken)
					}
				},
				error: function(error) {
					if (o.error) {
						o.error(error)
					}
				}
			})
		} else {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
		}
	}
	
	userJS.prototype.redirectToVenmo = function(o) {
		window.location.href = "https://api.venmo.com/v1/oauth/authorize?client_id=3193&scope=make_payments%20access_profile&response_type=token";
	}

	window.userJS = new userJS()

}());