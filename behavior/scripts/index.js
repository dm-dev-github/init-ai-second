var request = require('request');
var util = require('util');


var smoochAPI = {
	headers: {
		'app-token': '9oe7vz42bik4rymee8cd8zgzq'
	}
};

// 'use strict';
exports.handle = function (client) {






	// Create steps
	var sayHello = client.createStep({
		satisfied: function () {
			return Boolean(client.getConversationState().helloSent);
		},

		prompt: function () {
			client.addResponse('welcome');
			client.addResponse('provide/documentation', {
				documentation_link: 'http://docs.init.ai',
			});
			client.addResponse('provide/instructions');

			client.updateConversationState({
				helloSent: true
			});

			client.done();
		}
	});

	var untrained = client.createStep({
		satisfied: function () {
			return false;
		},

		prompt: function () {
			client.addResponse('apology/untrained');
			client.done();
		}
	});



	// was collect city
	var collectRole = client.createStep({


		satisfied: function () {

			console.log("collectRole.satisfield");
			return Boolean(client.getConversationState().requstedRole);

		},

		extractInfo: function () {


			var messagePart = client.getMessagePart();

			console.log("1. init.ai");
			console.log(JSON.stringify(messagePart));


			var initId = messagePart.sender.id;
			var smoochId = messagePart.sender.remote_id;

			console.log(initId + " | " + smoochId);


			smoochAPI.url = 'https://api.smooch.io/v1/appusers/' + smoochId;
			
			console.log(smoochAPI);

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

				var forename = body.appUser.givenName;
				var surname = body.appUser.surname;
				var client_id = body.appUser.userId;

				client.updateUser(initId, 'first_name', forename);

				client.updateUser(initId, 'last_name', surname);

				client.updateUser(initId, {
					'metadata': {
						'client_id': client_id
					}
				});
				
				// client.resetUser(initId);

				var role = client.getFirstEntityWithRole(client.getMessagePart(), 'role');

				if (role) {
					client.updateConversationState({
						requstedRole: role,
					});

					client.addTextResponse("Ok, " + forename + ", I'll check on your " + role.value);

					// client.done();

				}



			});





		},


		prompt: function () {

			console.log("This means it can't identidy a role");

			var tutorData = {
				person: "wrong",
				role: "wrong again"
			};

			client.addTextResponse("I'm not sure what's going on ... ");
			client.addResponse('prompt_role');
			// client.expect('provideAdvisor', ['clarify_role']);
			client.done();
		},

	});


	// was provideWeather
	var provideAdvisor = client.createStep({
		satisfied: function () {

			console.log("provideAdvisor / satisfied");
			return false;
		},


		prompt: function (eventType, payload, data) {
			// Need to provide weather
			console.log("Return data to provide_advisor");


			var tutorData = {
				person: "Joe Bloggs",
				role: client.getFirstEntityWithRole(client.getMessagePart(), 'role').value
			};

			var advisor = people.filter(function (person) {

				var messagePart = client.getMessagePart();
				
				console.log("init.ai n2:");
				console.log(JSON.stringify(messagePart));
				
				var client_id = messagePart.sender.metadata.client_id;
				
				if (person.id === client.getMessagePart().sender.metadata.client_id) {

					return person.advisor;

				}

			});


			client.addTextResponse("looded up advisor: " + advisor);

			var users = client.getUsers();

			console.log(JSON.stringify(users));

			client.addResponse('provide_advisor', tutorData);
			client.done();




		}
	});


	var handleEvent = function (eventType, payload) {
			client.addTextResponse('Received event of type: ' + eventType);

			var payloadText = JSON.stringify(payload);

			client.addTextResponse('payload ' + payloadText);

			client.done();
		};


	client.runFlow({
		eventHandlers: {
			'*': handleEvent
		},
		classifications: {
			'request_advisor': 'getAdvisor'
		},
		streams: {
			main: 'getAdvisor',
			getAdvisor: [collectRole, provideAdvisor],
			provideAdvisor: provideAdvisor
		}
	});


};





var people = [{
	"id": "auth0|5815cb10344073a30129f746",
	"advisor": "Mark Smith"
}];