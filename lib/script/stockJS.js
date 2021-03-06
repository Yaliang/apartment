;(function () {
	/**
	 * The module is designed to prove all access relative to user
	 */
	
	function stockJS() {
		return this
	}

	stockJS.prototype.createItem(o) {
		o = o || {}
		if (!window.userJS.checkLogin) {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
			return false
		}
		if (!o.item_name || !o.apt_token) {
			if (o.error) {
				o.error(window.errorCode.formNotFilled)
			}
			return false
		}
		var stock = Parse.Object.extend("stock")
		var apartment = Parse.Object.extend("apartment")
		var st = new stock()
		var apt = new apartment()
		apt.id = o.apt_token
		st.set('name', o.item_name)
		st.set('apartment',apt)
		st.save(null,{
			success: function(item) {
				if (o.success) {
					o.success(item)
				}
			},
			error: function(error) {
				if (o.error) {
					o.error(error)
				}
			}
		})
	}

	stockJS.prototype.updateItem(o) {
		o = o || {}
		if (!window.userJS.checkLogin) {
			if (o.error) {
				o.error(window.errorCode.noLogin)
			}
			return false
		}
		if (!o.item_token) {
			if (o.error) {
				o.error(window.errorCode.formNotFilled)
			}
			return false
		}
		var stock = Parse.Object.extend("stock")
		var query = new Parse.Query(stock)

		query.get(o.item_token, {
			success: function(item) {
				item.save(null, {
					success: function(item) {
						if (o.success) {
							o.success(item)
						}
					},
					error: function(error) {
						if (o.error) {
							o.error(error)
						}
					}
				})
			},
			error: function(error) {
				if (o.error) {
					o.error(error)
				}
			}
		})
	}

	stockJS.prototype.listItem(o) {
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
		o.order = o.order || "descending"
		var stock = Parse.Object.extend("stock")
		var apartment = Parse.Object.extend("apartment")
		var query = new Parse.Query(stock)
		var apt = new apartment()
		apt.id = o.apt_token
		query.equalTo('apartment', apt)
		if (o.before) {
			query.lessThen('updatedAt', o.before)
		}
		if (o.order == "descending") {
			query.descending('updatedAt')
		} else {
			query.ascending('updatedAt')
		}
		query.limit(10)
		query.find({
			success: function(items) {
				if (!items) {
					if (o.error) {
						o.error(window.errorCode.notFindRecord)
					}
				} else {
					if (o.success) {
						o.success(items)
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


	window.stockJS = new stockJS()

}());