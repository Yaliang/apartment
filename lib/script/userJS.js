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
			if (options.error) {
				options.error(window.errorCode.formNotFilled)
			}
			return false
		}
		Parse.User.logIn(options.name, options.psw, {
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
		if (!options.email || !options.psw || !options.name) {
			if (options.error) {
				options.error(window.errorCode.formNotFilled)
			}
			return false
		}
		var user = new Parse.User()
		user.set("username", options.email)
		user.set("name",options.name)
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

	userJS.prototype.createApt = function(o) {
		o = o || {}
		if (!window.userJS.checkLogin) {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
			return false
		}
		var crtUser = Parse.User.current()
		var apartment = Parse.Object.extend('apartment')
		var apt = new apartment()

		apt.set('member',[crtUser.id])
		apt.set('member_pending', [])
		apt.save(null,{
			success: function(apt) {
				if (o.success) {
					o.success(apt)
				}
			},
			error: function(error) {
				if (o.error) {
					o.error(error)
				}
			}
		})
	}

	userJS.prototype.joinApt = function(o) {
		o = o || {}
		if (!window.userJS.checkLogin) {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
			return false
		}
		if (!o.apt_token) {
			if (options.error) {
				options.error(window.errorCode.formNotFilled)
			}
			return false
		}
		var crtUser = Parse.User.current()
		var apartment = Parse.Object.extend('apartment')
		var query = new Parse.Query()
		query.get(o.apt_token, {
			success: function(apt) {
				if (!apt) {
					if (o.error) {
						o.error(window.errorCode.notFindRecord)
					}
				} else {
					if (apt.get('member').indexOf(crtUser.id) >= 0) {
						if (o.error) {
							o.error(window.errorCode.alreadyIn)
						}
						return false
					}
					apt.addUnique('member_pending', crtUser.id)
					apt.save(null, {
						success: function(apt) {
							if (o.success) {
								o.success(apt)
							}
						},
						error: function(error) {
							if (o.error) {
								o.error(error)
							}
						}
					})
				}
			},
			error: function(error) {
				if (o.error) {
					o.error(error)
				}
			}
		})
	}

	userJS.prototype.leaveApt = function(o) {
		o = o || {}
		if (!window.userJS.checkLogin) {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
			return false
		}
		if (!o.apt_token) {
			if (options.error) {
				options.error(window.errorCode.formNotFilled)
			}
			return false
		}
		var crtUser = Parse.User.current()
		var apartment = Parse.Object.extend('apartment')
		var query = new Parse.Query()
		query.get(o.apt_token, {
			success: function(apt) {
				if (!apt) {
					if (o.error) {
						o.error(window.errorCode.notFindRecord)
					}
				} else {
					apt.remove('member', crtUser.id)
					apt.remove('member_pending', crtUser.id)
					apt.save(null, {
						success: function(apt) {
							if (o.success) {
								o.success(apt)
							}
						},
						error: function(error) {
							if (o.error) {
								o.error(error)
							}
						}
					})
				}
			},
			error: function(error) {
				if (o.error) {
					o.error(error)
				}
			}
		})
	}

	userJS.prototype.acceptJoin = function(o) {
		o = o || {}
		if (!window.userJS.checkLogin) {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
			return false
		}
		if (!o.apt_token || !o.target) {
			if (options.error) {
				options.error(window.errorCode.formNotFilled)
			}
			return false
		}
		var crtUser = Parse.User.current()
		var apartment = Parse.Object.extend('apartment')
		var query = new Parse.Query()
		query.get(o.apt_token, {
			success: function(apt) {
				if (!apt) {
					if (o.error) {
						o.error(window.errorCode.notFindRecord)
					}
				} else {
					apt.addUnique('member', o.target)
					apt.remove('member_pending', o.target)
					apt.save(null, {
						success: function(apt) {
							if (o.success) {
								o.success(apt)
							}
						},
						error: function(error) {
							if (o.error) {
								o.error(error)
							}
						}
					})
				}
			},
			error: function(error) {
				if (o.error) {
					o.error(error)
				}
			}
		})
	}

	userJS.prototype.rejectORremove = function(o) {
		o = o || {}
		if (!window.userJS.checkLogin) {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
			return false
		}
		if (!o.apt_token || !o.target) {
			if (options.error) {
				options.error(window.errorCode.formNotFilled)
			}
			return false
		}
		var crtUser = Parse.User.current()
		var apartment = Parse.Object.extend('apartment')
		var query = new Parse.Query()
		query.get(o.apt_token, {
			success: function(apt) {
				if (!apt) {
					if (o.error) {
						o.error(window.errorCode.notFindRecord)
					}
				} else {
					apt.remove('member', o.target)
					apt.remove('member_pending', o.target)
					apt.save(null, {
						success: function(apt) {
							if (o.success) {
								o.success(apt)
							}
						},
						error: function(error) {
							if (o.error) {
								o.error(error)
							}
						}
					})
				}
			},
			error: function(error) {
				if (o.error) {
					o.error(error)
				}
			}
		})
	}

	userJS.prototype.members = function(o) {
		o = o || {}
		if (!window.userJS.checkLogin) {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
			return false
		}
		if (!o.apt_token) {
			if (options.error) {
				options.error(window.errorCode.formNotFilled)
			}
			return false
		}
		var crtUser = Parse.User.current()
		var apartment = Parse.Object.extend('apartment')
		var query = new Parse.Query()
		query.get(o.apt_token, {
			success: function(apt) {
				if (!apt) {
					if (o.error) {
						o.error(window.errorCode.notFindRecord)
					}
				} else {
					if (o.success) {
						o.success(apt)
					}
				}
			},
			error: function(error) {
				if (o.error) {
					o.error(error)
				}
			}
		})
	}



	window.userJS = new userJS()

}());