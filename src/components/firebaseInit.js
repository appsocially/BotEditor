import firebase from "firebase"
import "firebase/firestore"
import firebaseConfig from "./firebaseConfig"
const firebaseApp = firebase.initializeApp(firebaseConfig)
export default firebaseApp.firestore()
window.firebase = firebase
export {firebase}
