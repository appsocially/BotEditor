const functions = require('firebase-functions')
const firestore = require('firebase/firestore')
const admin = require('firebase-admin')

// Dev
// admin.initializeApp({
//   apiKey: "AIzaSyC0VOO9oTOxKTH2uoVVMeJOzFNz5Paiw5s",
//   authDomain: "bot-editor-dev.firebaseapp.com",
//   databaseURL: "https://bot-editor-dev.firebaseio.com",
//   projectId: "bot-editor-dev",
//   storageBucket: "bot-editor-dev.appspot.com",
//   messagingSenderId: "962503874281"
// })

// Prod
admin.initializeApp({
  apiKey: "AIzaSyCmHqMdiSIy8t9SSGDwQ7N44V-CMsxv8Is",
  authDomain: "bot-editor-prod.firebaseapp.com",
  databaseURL: "https://bot-editor-prod.firebaseio.com",
  projectId: "bot-editor-prod",
  storageBucket: "bot-editor-prod.appspot.com",
  messagingSenderId: "938144697052"
})

const db = admin.firestore()

db.settings({
  timestampsInSnapshots: true
})

const cors = require('cors')({origin: true})

exports.getScenario = functions.https.onRequest((req, res) => {

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  cors(req, res, async function() {

    let data = req.body
    var scenarioId = data.scenarioId

    if (scenarioId) {
      // getScenarioViaFirestore(scenarioId)
      var scenario = await db.collection('projects')
        .doc(scenarioId)
        .collection('scenario')
        .get()
        .then((doc) => {
          return doc.docs.map(function(doc){
            return doc.data()
          })
        })
      res.status(200).send({scenario: scenario}).end()
    } else {
      console.log('No scenarioId')
      return
    }
  }) // cors

})

exports.getProject = functions.https.onRequest((req, res) => {

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  cors(req, res, async function() {

    let data = req.body
    var scenarioId = data.scenarioId

    if (scenarioId) {
      // getScenarioViaFirestore(scenarioId)
      var project = await db.collection('projects')
        .doc(scenarioId)
        .get()
        .then((doc) => {
          return doc.data()
        })
      res.status(200).send({project: project}).end()
    } else {
      console.log('No scenarioId')
      return
    }
  }) // cors

})

// var getScenario = async (id) => {
  // const uri = 'http://localhost:5000/bot-editor-prod/us-central1/getScenario'
  //   const response = await fetch(uri, {
  //     method: 'POST',
  //     mode: 'cors',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Accept': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       'scenarioId': id
  //     })
  //   })
  // var result = await response.json()
//     console.log('result:', result)
// }

