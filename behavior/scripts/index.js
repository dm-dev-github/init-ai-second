var request = require('request');
var util = require('util');
var getSmoochData = require('./lib/getSmoochData');

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

			console.log("collectRole.satisfield", Boolean(client.getConversationState().requstedRole));
			return Boolean(client.getConversationState().requstedRole);

		},

		extractInfo: function (callback) {


			console.log("collectRole.extractInfo");

			var messagePart = client.getMessagePart();



			var role = client.getFirstEntityWithRole(client.getMessagePart(), 'role');

			console.log();

			if (role) {
				client.updateConversationState({
					requstedRole: role,
				});

				var forename = messagePart.sender.first_name;

				client.addTextResponse("Ok, " + forename + ", I'll check on your " + role.value);

				// client.done();

			}


			getSmoochData(messagePart.sender.remote_id, function(clientData) {
				
				clientAddTextResponse("I hope that you are " + clientData.forename + " (" + clientData.client_id + ")");
				callback();
				
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


		prompt: function () {
			// Need to provide weather
			console.log("Return data to provide_advisor");
			
			


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
			getAdvisor: [collectRole, provideAdvisor]
		}
	});


};





var people = [{
	"id": "auth0|5815cb10344073a30129f746",
	"advisor": "Mark Smith"
}];