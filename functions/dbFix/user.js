// module.exports = async function () {
//   console.log("db fix")
// }

const admin = require('firebase-admin')

// Dev
admin.initializeApp({
  apiKey: "AIzaSyC0VOO9oTOxKTH2uoVVMeJOzFNz5Paiw5s",
  authDomain: "bot-editor-dev.firebaseapp.com",
  databaseURL: "https://bot-editor-dev.firebaseio.com",
  projectId: "bot-editor-dev",
  storageBucket: "bot-editor-dev.appspot.com",
  messagingSenderId: "962503874281"
})

// Prod
// admin.initializeApp({
//   apiKey: "AIzaSyCmHqMdiSIy8t9SSGDwQ7N44V-CMsxv8Is",
//   authDomain: "bot-editor-prod.firebaseapp.com",
//   databaseURL: "https://bot-editor-prod.firebaseio.com",
//   projectId: "bot-editor-prod",
//   storageBucket: "bot-editor-prod.appspot.com",
//   messagingSenderId: "938144697052"
// })

const db = admin.firestore()

db.settings({
  timestampsInSnapshots: true
})

var changeUserModel = async () => {

  var currentUsers = await db.collection("users")
    .get()
    .then((q) => {
      return q.docs.map((d) => {
        return d.data()
      })
    })
  
  console.log("\n\nbefore:::\n", currentUsers[0])

  for (var i=0; i<currentUsers.length; i++) {
    console.log("\nProgress:", `${i/currentUsers.length * 100}%`)
    var teamObj = {
      author: currentUsers[i].uid,
      iconURL: "https://firebasestorage.googleapis.com/v0/b/chatcenter-min-ui.appspot.com/o/util%2Fcc-logo.png?alt=media&token=3554e2f5-8a27-44e3-a8d6-365fe5554852",
      name: `Team ${currentUsers[i].name}`,
      primary: currentUsers[i].uid
    }
    var teamId = await db.collection("teams").add(teamObj).then((d) => {
      return d.id
    })
    
    var newUserObj = {
      createdAt: currentUsers[i].creationTime,
      currentTeam: teamId,
      iconURL: "https://firebasestorage.googleapis.com/v0/b/chatcenter-min-ui.appspot.com/o/util%2Fcc-logo.png?alt=media&token=3554e2f5-8a27-44e3-a8d6-365fe5554852",
      isAnonymous: false,
      lastSignInTime: currentUsers[i].lastSignInTime,
      name: currentUsers[i].name,
      plan: "BASIC_PLAN",
      profile: "No Profile",
      team: [teamId],
      type: "human",
      uid: currentUsers[i].uid
    }

    console.log("newUserObj", newUserObj)

    await db.collection("users").doc(currentUsers[i].uid).set(newUserObj)
    db.collection("users").doc(currentUsers[i].uid)
      .collection("secrets").doc("email")
      .set({ author: currentUsers[i].uid, email: currentUsers[i].email })

  }

  console.log("Completed!!!")

  return true
}

changeUserModel()