const functions = require('firebase-functions')
const firestore = require('firebase/firestore')
const admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue
const mailSender = require('./mailSender')

const mode = "prod"

if (mode === "dev") {
  // Dev
  admin.initializeApp({
    apiKey: "AIzaSyC0VOO9oTOxKTH2uoVVMeJOzFNz5Paiw5s",
    authDomain: "bot-editor-dev.firebaseapp.com",
    databaseURL: "https://bot-editor-dev.firebaseio.com",
    projectId: "bot-editor-dev",
    storageBucket: "bot-editor-dev.appspot.com",
    messagingSenderId: "962503874281"
  })

  var stripeKey = 'sk_test_ZluOqOvwXDnfxjOn7c6h2LqO00SVQfjQu0'
  var stripe = require('stripe')(stripeKey)

  var domain = "https://bot-editor-dev.firebaseapp.com"
} else if (mode === "prod") {
  // Prod
  admin.initializeApp({
    apiKey: "AIzaSyCmHqMdiSIy8t9SSGDwQ7N44V-CMsxv8Is",
    authDomain: "bot-editor-prod.firebaseapp.com",
    databaseURL: "https://bot-editor-prod.firebaseio.com",
    projectId: "bot-editor-prod",
    storageBucket: "bot-editor-prod.appspot.com",
    messagingSenderId: "938144697052"
  })

  var stripeKey = 'sk_live_aNk3sFovFEiRjHgewJjpEYeA00gg1jwxmM'
  var stripe = require('stripe')(stripeKey)

  var domain = "https://app.editor.chatcenter.ai"
}

const db = admin.firestore()

db.settings({
  timestampsInSnapshots: true
})

const cors = require('cors')({ origin: true })

// APIs
exports.sendEmailWithCustomVars = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  cors(req, res, async () => {
    console.log("call sendEmailWithCustomVars")

    var title = req.body.title
    var body = req.body.text
    var email = req.body.email

    var teamId = req.body.teamId
    var guestUid = req.body.uid
    
    var team = await db.collection('teams').doc(teamId).get().then(d => { return d.data() })
    var user = await db.collection('users').doc(team.author).get().then(d => { return d.data() })
    console.log("user:", user)

    if (user.plan === "BUSINESS_HR_SOLUTION_PLAN") {
      var customVars = await db.collection('teams')
        .doc(teamId).collection('rooms')
        .doc(guestUid).collection('customVars')
        .orderBy("createdAt", "asc")
        .get()
        .then(q => {
          return q.docs.map(d => { return d.data() })
        })
      var keyVals = customVars.map(e => {
        var value = (e.varType === "Array")? e.value.join(", "): e.value
        if (e.questionBy) {
          return `${e.questionBy.text}:\n${value}`
        } else {
          return `${e.location}:\n${value}`
        }
      })
      var customVarsListStr = keyVals.join("\n")

      if (!email) {
        email = await db.collection('users').doc(team.author)
          .collection('secrets').doc('email')
          .get().then((d) => { return d.data().email })
      }

      var subject = title
      var text = `${body}\n\n${domain}/profile/${teamId}/${guestUid}`
      // var text = `${body}\n\n${customVarsListStr}\n\n${domain}/profile/${teamId}/${guestUid}`

      console.log(`Send to ${email}`, text)

      mailSender(email, subject, text)

      res.status(200).send({result: "send email"}).end()
    } else {
      if (!email) {
        email = await db.collection('users').doc(team.author)
          .collection('secrets').doc('email')
          .get().then((d) => { return d.data().email })
      }

      var subject = title
      var text = `${body}\n\n${domain}/profile/${teamId}/${guestUid}`

      console.log(`Send to ${email}`, text)

      mailSender(email, subject, text)

      res.status(200).send({result: "anotherPlan"}).end()
    }
  }) // cors
})

exports.getScenario = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  cors(req, res, async () => {

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
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  cors(req, res, async () => {

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

exports.updateTeamAsGuest = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  cors(req, res, async () => {
    let data = req.body
    await db.collection("users").doc(data.uid)
      .update({
        teamAsGuest: FieldValue.arrayUnion(data.teamId)
      })
    res.status(200).send({result: "succeeded"}).end()
  }) // cors
})


// triggers
exports.createRoom = functions.firestore
  .document(`teams/{teamId}/rooms/{roomId}`)
  .onCreate(async (doc, context) => {
    console.log('createRoom', doc.data())
    var room = doc.data()
    await db.collection('teams').doc(room.teamId).update({roomNum: FieldValue.increment(1)})
    var team = await db.collection('teams')
      .doc(room.teamId)
      .get()
      .then((d) => {
        var team = d.data()
        team.id = d.id
        return team
      })

    var email = await db.collection('users').doc(team.author)
      .collection('secrets').doc('email')
      .get().then((d) => { return d.data().email })

    var subject = '[BotEditor] ボットにアクセスがありました。'
    var text = `誰かがあなたのボットにアクセスしました。\n\n ${domain}/profile/${team.id}/${doc.id}`
    mailSender(email, subject, text)

    // await updateStripeInformation({
    //   idempotencyKey: `${doc.id}-create`,
    //   uid: team.author,
    //   num: team.roomNum
    // }, context, db)
  })

// For Stripe
const INDIVIDUAL_CUSTOMVAR_CRM_PLAN = 'INDIVIDUAL_CUSTOMVAR_CRM_PLAN'

exports.getStripeSession = functions.https.onRequest((req, res) => {
  // res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  cors(req, res, async function () {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      subscription_data: {
        items: [{
          plan: req.body.plan
        }]
      },
      success_url: `${req.body.origin}/inbox?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.body.origin}/inbox?session_id=error`
    })

    await db.collection('sessions').doc(session.id).set({
      sessionId: session.id,
      uid: req.body.uid,
      createdAt: new Date(),
      plan: req.body.plan
    })

    res.status(200).send(session).end()

  }) // cors
})

// reference for upgrade plan: https://stripe.com/docs/billing/subscriptions/upgrading-downgrading

exports.webhook = functions.https.onRequest((req, res) => {
  // res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  console.log('call webhook')
  cors(req, res, async function () {
    const sig = req.headers['stripe-signature']

    let event

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, 'whsec_lVI6NHaDV6fvk2DIO8LrH4nKk8OVnGTl')
      console.log('event:', event)
      console.log('event.data.object:', event.data.object)
      // res.status(200).end({ message: 'succeeded' })
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      console.log('session before handler:', session)

      var sessionDoc = await db.collection('sessions').doc(session.id).get()
      if (sessionDoc.exists) {
        var plan = sessionDoc.data().plan
        console.log("session plan:", plan)
        await db.collection('users')
          .doc(sessionDoc.data().uid)
          .update({
            plan: plan
          })
      }
    }

    // Return a response to acknowledge receipt of the event
    res.status(200).send({ received: true }).end()
  }) // cors
})