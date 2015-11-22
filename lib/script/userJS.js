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

	userJS.prototype.logout = function(o) {
		Parse.User.logOut();
		if (o.success) {
			o.success()
		}
	}

	window.userJS = new userJS()

}());