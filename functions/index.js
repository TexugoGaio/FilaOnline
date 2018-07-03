// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { google } = require('googleapis');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const appcpf = require("@fnando/cpf/dist/node");


var serviceAccount = require("./serviceAccountKey.json");

let agendaID = 0;
const calendarId = agendaID;
const serviceAccountAuth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: 'https://www.googleapis.com/auth/calendar'
});

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://filaonline-92ab4.firebaseio.com"
});

var db = admin.database();



/* const calendar = google.calendar('v3');
const timeZone = 'America/Buenos_Aires';
const timeZoneOffset = '-03:00'; */
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements



/////////////////////
//
//
//  COMEÇO DA FUNÇAO DialogflowFirebaseFulfillment
//
//
////////////////////
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {

    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    let unidade;
    let validCPF;
    let validaUSER;
    let userCPF;


    function welcome(agent) {
        agent.add(`Seja muito bem vindo!`);

        /*var usersRef = ref.child("users");
        usersRef.set({
            alanisawesome: {
                date_of_birth: "June 23, 1912",
                full_name: "Alan Turing"
            },
            gracehop: {
                date_of_birth: "December 9, 1906",
                full_name: "Grace Hopper"
            }
        });*/

    }

    function agendar(agent) {
        userCPF = agent.parameters.cpf;


        if (agent.parameters.cpf) {

            console.log("1 " + agent.parameters.cpf);

            if (appcpf.isValid(agent.parameters.cpf)) {

                validCPF = 1;

            } else {

                agent.setFollowupEvent('cpf_invalido');

            }


        }



        if (validCPF == 1) {

            agent.add("oi");


        }
    }

    function cpf_invalido(agent) {

        if (agent.parameters.cpf) {

            userCPF = agent.parameters.cpf;
            console.log("2 " + agent.parameters.cpf);

            if (appcpf.isValid(agent.parameters.cpf)) {

                validCPF = 1;
                return true;

            } else {

                agent.setFollowupEvent('cpf_invalido');

            }

        }


    }





    // // Uncomment and edit to make your own intent handler
    // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function yourFunctionHandler(agent) {
    //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
    //   agent.add(new Card({
    //       title: `Title: this is a card title`,
    //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
    //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
    //       buttonText: 'This is a button',
    //       buttonUrl: 'https://assistant.google.com/'
    //     })
    //   );
    //   agent.add(new Suggestion(`Quick Reply`));
    //   agent.add(new Suggestion(`Suggestion`));
    //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
    // }

    // // Uncomment and edit to make your own Google Assistant intent handler
    // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function googleAssistantHandler(agent) {
    //   let conv = agent.conv(); // Get Actions on Google library conv instance
    //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
    //   agent.add(conv); // Add Actions on Google library responses to your agent's response
    // }
    // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
    // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

    // Run the proper function handler based on the matched Dialogflow intent name

    let intentMap = new Map();
    intentMap.set('CARALHO', welcome);
    intentMap.set('agendamento_sim', agendar);
    intentMap.set('cpf_invalido', cpf_invalido);
    // intentMap.set('your intent name here', yourFunctionHandler);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
});
/////////////////////
//
//
//  FIM DA FUNÇAO DialogflowFirebaseFulfillment
//
//
////////////////////

function getUnidades() {
    var ref = db.ref("server/unidades");
    ref.orderByKey().on("value", function(snapshot) {
        snapshot.forEach(function(data) {
            console.log(" AS UNIDADES unidades:" + data.key + "valores" + data.val().email);
        })
        var posto = snapshot.val().nome;

        return posto;
    });
}