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
		o = o || {}
		if (!o.session || !o.code) {
			if (o.error) {
				o.error(window.errorCode.formNotFilled)
			}
			return false
		}
		var request="session="+o.session+"&code="+o.code;
		$.post("http://apartment-api.azurewebsites.net/venmo",request).done(function(data) {
			data = JSON.parse(data)
			if (data.code == 200) {
				if (o.success) {
					o.success()
				}
			} else {
				if (o.error) {
					o.error(data)
				}
			}
		});
	}

	payJS.prototype.payVenmo = function(o) {
		o = o || {}
		if (!o.session || !o.dest_venmo_id || !o.amount || !o.note || !o.target_userid) {
			if (o.error) {
				o.error(window.errorCode.formNotFilled)
			}
			return false
		}
		var request="session="+o.session+"&dest="+o.dest_venmo_id+"&amount="+o.amount+"&note="+o.note+"&userid="+o.target_userid;
		$.post("http://apartment-api.azurewebsites.net/venmo_pay",request).done(function(data) {
			data = JSON.parse(data)
			if (data.code == 200) {
				if (o.success) {
					o.success()
				}
			} else {
				if (o.error) {
					o.error(data)
				}
			}
		});
	}
	
	payJS.prototype.redirectToVenmo = function(o) {
		window.location.href = "https://api.venmo.com/v1/oauth/authorize?client_id=3193&scope=make_payments%20access_profile&response_type=code";
	}

	payJS.prototype.addShareBill = function(o) {
		o = o || {}
		if (!window.userJS.checkLogin) {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
			return false
		}
		if (!o.note || !o.target) {
			if (o.error) {
				o.error(window.errorCode.formNotFilled)
			}
			return false
		}
		var crtUser = Parse.User.current()
		var targetUser = new Parse.User()
		var payment = Parse.Object.extend('payment')
		for (var i=0; i<o.target.length; i++) {
			var np = new payment()
			targetUser.id = o.target[i].id
			np.set('payer', crtUser)
			np.set('target', targetUser)
			np.set('note', o.note)
			np.set('amount', o.target.amount)
			np.set('type', 'announce')
			np.save()
		}
	}

	payJS.prototype.listAll = function(o) {
		o = o || {}
		if (!window.userJS.checkLogin) {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
			return false
		}
		var crtUser = Parse.User.current()
		var payment = Parse.Object.extend('payment')
		var query_payer = new Parse.Query(payment)
		query_payer.equalTo('payer', crtUser)
		var query_target = new Parse.Query(payment)
		query_target.equalTo('target', crtUser)
		var query = Parse.Query.or(query_payer, query_target)
		query.descending('createdAt')
		if (!o.nolimit) {
			query.limit(10)
		}
		if (o.before) {
			query.lessThen('createdAt', o.before)
		}

		query.find({
			success: function(payments) {
				if (!payments) {
					if (o.error) {
						o.error(window.errorCode.notFindRecord)
					}
				} else {
					if (o.success) {
						o.success(payments)
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

	payJS.prototype.listWithTarget = function(o) {
		o = o || {}
		if (!window.userJS.checkLogin) {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
			return false
		}
		if (!o.target) {
			if (o.error) {
				o.error(window.errorCode.formNotFilled)
			}
			return false
		}
		var crtUser = Parse.User.current()
		var targetUser = new Parse.User()
		targetUser.id = o.target
		var payment = Parse.Object.extend('payment')
		var query_payer = new Parse.Query(payment)
		query_payer.equalTo('payer', crtUser)
		query_payer.equalTo('target', targetUser)
		var query_target = new Parse.Query(payment)
		query_target.equalTo('target', crtUser)
		query_target.equalTo('payer', targetUser)
		var query = Parse.Query.or(query_payer, query_target)
		query.descending('createdAt')
		if (!o.nolimit) {
			query.limit(10)
		}
		if (o.before) {
			query.lessThen('createdAt', o.before)
		}

		query.find({
			success: function(payments) {
				if (!payments) {
					if (o.error) {
						o.error(window.errorCode.notFindRecord)
					}
				} else {
					if (o.success) {
						o.success(payments)
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

	payJS.prototype.summary = function(o) {
		o = o || {}
		if (!window.userJS.checkLogin) {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
			return false
		}
		if (!o.apt_token) {
			if (o.error) {
				o.error(window.errorCode.formNotFilled)
			}
			return false
		}
		var crtUser = Parse.User.current()
		window.userJS.members({
			apt_token: o.apt_token,
			success: function(apt) {
				// get all member in the apartment
				for (var i=0; i< apt.get('member').length; i++) {
					var target_id = apt.get('member')[i].id
					if (target_id != crtUser.id) {
						window.payJS.listWithTarget({
							target: target_id,
							nolimit: true,
							success: function(payments) {
								var balance = 0
								var target_id
								for (var j=0; j< payments.length; j++) {
									if (payments[j].get('payer').id == crtUser.id) {
										balance += parseFloat(payments[j].get('amount')) 
										target_id = payments[j].get('target').id
									} else {
										balance -= parseFloat(payments[j].get('amount'))
										target_id = payments[j].get('payer').id
									}
								}
								o.success({
									target: target_id,
									balance: balance
								})
							},
							error: o.error
						})
					}
				}
			},
			error: o.error
		})
	}

	window.payJS = new payJS()

}());