
// export default {
//   apiKey: process.env.VUE_APP_API_KEY, //"AIzaSyB8jmIBe5Cx-XpOjG30y-bro4sUYJyvmf4",
//   authDomain: process.env.VUE_APP_AUTH_DOMAIN, //"scenario-tree.firebaseapp.com",
//   databaseURL: process.env.VUE_APP_DATABASE_URL, //"https://scenario-tree.firebaseio.com",
//   projectId: process.env.VUE_APP_PROJECT_ID, //"scenario-tree",
//   storageBucket: process.env.VUE_APP_STORAGE_BUCKET, //"scenario-tree.appspot.com",
//   messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID //"762202280051"
// }

// For Dev
export default {
  apiKey: "AIzaSyC0VOO9oTOxKTH2uoVVMeJOzFNz5Paiw5s",
  authDomain: "bot-editor-dev.firebaseapp.com",
  databaseURL: "https://bot-editor-dev.firebaseio.com",
  projectId: "bot-editor-dev",
  storageBucket: "bot-editor-dev.appspot.com",
  messagingSenderId: "962503874281"
}

const api = "https://us-central1-bot-editor-dev.cloudfunctions.net"
// const api = "http://localhost:5000/bot-editor-dev/us-central1"
const stripeKey = "pk_test_J5Wi6Z7mtNhAEAI9QXGdUIl400EGRhCfTX"
export { api, stripeKey }

// For Prod
// export default {
//   apiKey: "AIzaSyCmHqMdiSIy8t9SSGDwQ7N44V-CMsxv8Is",
//   authDomain: "bot-editor-prod.firebaseapp.com",
//   databaseURL: "https://bot-editor-prod.firebaseio.com",
//   projectId: "bot-editor-prod",
//   storageBucket: "bot-editor-prod.appspot.com",
//   messagingSenderId: "938144697052"
// }

// const api = "https://us-central1-bot-editor-prod.cloudfunctions.net"
// const stripeKey = "pk_live_hbnraerdEYfGBWCPoARilSeO00kYKzAL6s"
// export { api, stripeKey }
