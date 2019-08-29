import firebase from "firebase"
import "firebase/firestore"
import firebaseConfig from "./firebaseConfig"
const firebaseApp = firebase.initializeApp(firebaseConfig)
const strage = firebaseApp.storage()
export default firebaseApp.firestore()
// export {strage}
export {firebase, strage}
