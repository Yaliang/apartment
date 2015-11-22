;(function () {
	/**
	 * The module is designed to prove all error code
	 */
	
	function errorCode() {
		this.noLogin = {
			code: '101',
			message: 'No user logged in.'
		}

		this.formNotFilled = {
			code: '102',
			message: 'There is empty input left.'
		}

		this.notFindRecord = {
			code: '103',
			message: 'There is no record match the request.'
		}

		return this
	}

	

	window.errorCode = new errorCode()

}());