
var request = require('request');


var smoochAPI = {
	headers: {
		'app-token': '9oe7vz42bik4rymee8cd8zgzq'
	}
};



module.exports = function getCurrentWeather(messagePart, callback) {

			// smoochId = smoochId || "aaff1b14c18fb2e2d8ebb1d5";

			smoochAPI.url = 'https://api.smooch.io/v1/appusers/' + messagePart.sender.remote_id;
			
			// console.log(smoochAPI);
			
			request.get(smoochAPI, function (error, response, body) {

				if (error) {
					console.log("smooch.io error:");
					console.log(error);
				}
				// console.log(response);
				// console.log(util.inspect(JSON.parse(body), false, null));
				console.log("smooch.io:");
				body = JSON.parse(body);

				console.log(body);

				var clientData = {forename: body.appUser.givenName, surname: body.appUser.surname, client_id: body.appUser.properties.id};
				
				callback(clientData);

				

			});


};