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

var userNOME;
let validaUSER = null;
let userCPF;



/////////////////////
//
//
//  COMEÇO DA FUNÇAO DialogflowFirebaseFulfillment
//
//
////////////////////
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {

    const agent = new WebhookClient({ request, response });

    let validCPF;

    function agendar(agent) {

        if (agent.parameters.cpf) {

            if (agent.parameters.cpf != userCPF) {
                validaUSER = null;
            }

            userCPF = agent.parameters.cpf;

            //PRIMEIRO - VALIDA O CPF
            if (appcpf.isValid(agent.parameters.cpf)) {

                validCPF = 1;

            } else {

                agent.setFollowupEvent('cpf_invalido');

            }

        }
        // SE CPF FOR VALIDO, VERIFICA SE ESTE CPF JÁ É CADASTRADO
        if (validCPF == 1) {

            getUser(userCPF);
            console.log("valida " + validaUSER);

            if (validaUSER == 0) {
                agent.setFollowupEvent('cadastrar_paciente');
                return;
            } else if (validaUSER == 1) {
                agent.add("oi " + userNOME);
                return;
            } else {
                agent.add("digite novamente o cpf.");
                return;
            }

        }
    }

    function cpf_invalido(agent) {

        if (agent.parameters.cpf) {

            userCPF = agent.parameters.cpf;

            if (appcpf.isValid(agent.parameters.cpf)) {

                validCPF = 1;
                return true;

            } else {

                agent.setFollowupEvent('cpf_invalido');

            }

        }


    }

    function cadastrarPaciente(agent) {
        let nomeUSER = agent.parameters.nome;
        let sobrenomeUSER = agent.parameters.sobrenome;
        let telefoneUSER = agent.parameters.telefone;

        if (nomeUSER && sobrenomeUSER && telefoneUSER && userCPF) {

            postUser(userCPF, nomeUSER, sobrenomeUSER, telefoneUSER);

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
    intentMap.set('agendamento_sim', agendar);
    intentMap.set('cpf_invalido', cpf_invalido);
    intentMap.set('cadastrar_paciente_sim', cadastrarPaciente);
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

function getUser(cpf) {
    let data;
    var ref = db.ref("server/usuarios");
    ref.child(cpf.toString()).on("value", function(snapshot) {

        if (snapshot.hasChildren()) {
            data = snapshot.val();

            userNOME = data.nome.toString();

            console.log("nome" + userNOME);

            validaUSER = 1;
        } else {

            validaUSER = 0;
        }

    });

}

function postUser(cpf, nome, sobrenome, telefone) {

}