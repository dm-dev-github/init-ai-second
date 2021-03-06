var request = require('request');
var util = require('util');
var getSmoochData = require('./lib/getSmoochData');

var smoochAPI = {
	headers: {
		'app-token': '9oe7vz42bik4rymee8cd8zgzq'
	}
};




var people = {
	"auth0|585591e8f44af90e9a63fe46": {
		"advisor": "Mark Smith",
		"email": "m.smith@example.com"
	},
	"auth0|5815cb10344073a30129f746": {
		"advisor": "Jo Bloggs",
		"email": "j.bloggs@example.com"
	}
};
// 'use strict';
exports.handle = function (client) {

/*

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
*/



	// was collect city
	var collectRole = client.createStep({


		satisfied: function () {

			// client.updateConversationState({});
			console.log("collectRole.extractInfo");

			client.updateConversationState({
				advisorSent: false,
			});

			// if false runs prompt
			console.log("collectRole.satisfield", Boolean(client.getConversationState().requstedRole));
			return Boolean(client.getConversationState().requstedRole);

		},

		extractInfo: function (messagePart) {



			console.log("collectRole.extractInfo client.getConversationState()");
			console.log(client.getConversationState());


			// console.log(messagePart);
			// var messagePart = client.getMessagePart();
			var role = client.getFirstEntityWithRole(client.getMessagePart(), 'role');

			console.log("role", role);

			if (role) {
				client.updateConversationState({
					requstedRole: role,
				});

				var forename = messagePart.sender.first_name;

				// client.addTextResponse("Ok, " + forename + ", I'll check on your " + role.value);
				// client.done();
			}



		},


		prompt: function () {

			console.log("This means it can't identidy a role");

			var tutorData = {
				person: "wrong",
				role: "wrong again"
			};

			client.addTextResponse("I'm not sure what's going on ... ");
			client.addResponse('prompt_role');
			// client.done();
			// client.expect('provideAdvisor', ['clarify_role']);
		},

	});


	// was provideWeather
	var provideAdvisor = client.createStep({
		satisfied: function () {

			// if false run prompt
			console.log("provideAdvisor.satisfied", Boolean(client.getConversationState().advisorSent));
			return Boolean(client.getConversationState().advisorSent);
		},


		prompt: function () {
			// Need to provide weather
			console.log("Return data to provide_advisor");

			var messagePart = client.getMessagePart();

			console.log("-----------------------------------");
			console.log("messagePart");
			console.log(messagePart);
			console.log("-----------------------------------");


			messagePart.sender.remote_id = messagePart.sender.remote_id || "aaff1b14c18fb2e2d8ebb1d5";

			getSmoochData(messagePart, function (clientData) {

				// client.addTextResponse("I hope that you are " + clientData.forename + " (" + clientData.client_id + ")");
				var advisor = people[clientData.client_id].advisor;

				client.updateUser(messagePart.sender.id, 'metadata', {
					client_id: clientData.client_id

				});

				var data = {
					role: client.getFirstEntityWithRole(client.getMessagePart(), 'role').value,
					person: advisor
				};

				console.log("-----------------------------------");
				console.log(data);
				console.log("-----------------------------------");

				client.addResponse("provide_advisor", data);

				client.updateConversationState({
					advisorSent: true
				});


				// client.done();
			});




		}
	});

	// requestContactDetails = client.createStep({});
	provideContactDetails = client.createStep({

		satisfied: function () {

			// should check here to see if we have a person subject
			console.log("provideContactDetails.satisfield", Boolean(client.getConversationState().advisorSent));
			return Boolean(client.getConversationState().advisorSent);

		},

		extractInfo: function (messagePart) {


			console.log("provideContactDetails.extractInfo");
			console.log(messagePart);
			console.log("1. getConversationState():");
			console.log(client.getConversationState());

		},


		prompt: function () {

			console.log("provideContactDetails.prompt");
			var contacttype = client.getFirstEntityWithRole(client.getMessagePart(), 'contacttype').value;
			client.addTextResponse("don't know whose " + contacttype + " you want");
			client.addResponse("provide_contactdetails");
			client.done();

		}


	});


	provideContactDetails2 = client.createStep({

		satisfied: function () {

			// should check if happy with provided data
			return false;

		},
		prompt: function () {

			console.log("provideContactDetails2.prompt");
			console.log("-----------------------------------");
			console.log(client.getMessagePart());
			console.log("-----------------------------------");
			console.log(client.getConversationState());
			console.log("-----------------------------------");

			var contacttype = client.getFirstEntityWithRole(client.getMessagePart(), 'contacttype').value;

			// client.addTextResponse("getting " + contacttype + " details");
			var client_id = "auth0|585591e8f44af90e9a63fe46";

			if (client.getMessagePart().sender.metadata) {

				client_id = client.getMessagePart().sender.metadata.client_id || "auth0|585591e8f44af90e9a63fe46";

			}

			console.log("client_id", client_id);

			var contactvalue = people[client_id][contacttype];

			var data = {
				contacttype: contacttype,
				contactvalue: contactvalue
			};

			console.log("-----------------------------------");
			console.log(data);
			console.log("-----------------------------------");


			client.addResponse("provide_contactdetails", data);

			var contactSent = [];
			
			contactSent.push(data);

			client.updateConversationState({
				contactInfo: contactSent
			});



			console.log("provideContactDetails2.prompt getConversationState()");

			// console.log(client.getConversationState());
			// client.done();

		}
	});


	byeForNow = client.createStep({

		satisfied: function () {

			// should check if happy with provided data
			return false;

		},

		prompt: function() {
			
			client.addTextResponse("bye for now");
		}
		
		});

	// for income events not from chat
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
			'request_advisor': 'get_advisor',
			'request_contactdetails': 'provide_contactdetails'
		},
		streams: {
			main: 'getAdvisor',
			get_advisor: [collectRole, provideAdvisor],
			provide_contactdetails: [provideContactDetails, provideContactDetails2, byeForNow]
		}
	});

	client.done();
};