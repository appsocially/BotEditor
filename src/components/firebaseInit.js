// import firebase from "firebase"
import firebase from 'firebase/app'
import 'firebase/app'
import "firebase/firestore"
import "firebase/storage"
import "firebase/auth"
import firebaseConfig from "./firebaseConfig"

const firebaseApp = firebase.initializeApp(firebaseConfig)

const strage = firebaseApp.storage()
const auth = firebaseApp.auth()
const firestore = firebaseApp.firestore()

export default firebaseApp.firestore()
// export {strage}
export {firestore, firebase, strage, auth}
