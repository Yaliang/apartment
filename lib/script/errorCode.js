;(function () {
	/**
	 * The module is designed to prove all error code
	 */
	
	function userJS() {
		this.noLogin = {
			code: '101',
			message: 'No user logged in.'
		}

		return this
	}

	

	window.userJS = new userJS()

}());