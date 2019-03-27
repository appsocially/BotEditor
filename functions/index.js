const functions = require('firebase-functions');
const firestore = require('firebase/firestore');


const admin = require('firebase-admin');

admin.initializeApp({
  apiKey: "AIzaSyB8jmIBe5Cx-XpOjG30y-bro4sUYJyvmf4",
  authDomain: "scenario-tree.firebaseapp.com",
  databaseURL: "https://scenario-tree.firebaseio.com",
  projectId: "scenario-tree",
  storageBucket: "scenario-tree.appspot.com",
  messagingSenderId: "762202280051",
});

const db = admin.firestore();

db.settings({
  timestampsInSnapshots: true
});



const cors = require('cors')({origin: true});


exports.getScenario = functions.https.onRequest((req, res) => {

  cors(req, res, function() {

    console.log('getScenario');

    var getScenarioViaFirestore = async function(scenarioId){

      var scenario = await db.collection('projects')
        .doc(scenarioId)
        .collection('scenario')
        .get()
        .then(function(doc) {
          return doc.docs.map(function(doc){
            return doc.data();
          });
        });

      res.status(200).send({scenario: scenario}).end();

    }

    let data = req.body;
    var scenarioId = data.scenarioId;

    var scenario = getScenarioViaFirestore(scenarioId);
  }); // cors


});
