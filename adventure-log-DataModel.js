import firebase from "firebase/app";
import "firebase/firestore";
// import "firebase/storage";

import { firebaseConfig } from "./secrets/adventure-log";

class DataModel {
  constructor() {
    // removes multiple FB initialization error
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }

    this.usersRef = firebase.firestore().collection("users");
    this.logsRef = firebase.firestore().collection("logs");
    // this.storageRef = firebase.storage().ref();

    this.users = [];
    this.logs = [];
    this.loadUsers();
  }

  // users
  loadUsers = async () => {
    let querySnap = await this.usersRef.get();
    querySnap.forEach(qDocSnap => {
      let key = qDocSnap.id;
      let data = qDocSnap.data();
      data.key = key;
      this.users.push(data);
    });
  }

  getUsers = () => {
    return this.users;
  }

  addUser = async (email, pass, dispName) => {
    let newUser = {
      email: email,
      password: pass,
      displayName: dispName
    }

    // add data to FB
    let newUserDocRef = await this.usersRef.add(newUser);

    // get new FB ID and add to app data model
    let key = newUserDocRef.id;
    newUser.key = key;
    this.users.push(newUser);

    return newUser;
  }

  // logs
  loadLogs = async () => {
    this.logs = []; // if called again, avoid duplicates
    let querySnap = await this.logsRef.orderBy("timestamp", "desc").get();
    querySnap.forEach(qDocSnap => {
      let key = qDocSnap.id;
      let log = qDocSnap.data();
      log.key = key;
      this.logs.push(log);
    });
  }

  cleanLogs = (userKey) => {
    let cleanedLogs = [];
    for (let log of this.logs) {
      if (log.user === userKey) {
        cleanedLogs.push(log);
      }
    }
    this.logs = cleanedLogs;
  }

  getLogs = () => {
    return this.logs;
  }

  addLog = async (newLog) => {
    // add data to FB
    let newLogDocRef = await this.logsRef.add(newLog);

    // get new FB ID and add to app data model
    let key = newLogDocRef.id;
    newLog.key = key;
    this.logs.push(newLog);
  }

  editLog = async (editedLog) => {
    // update FB
    let editedLogDocRef = this.logsRef.doc(editedLog.key);
    let editedLogWithoutKey = {...editedLog};
    delete editedLogWithoutKey.key;
    await editedLogDocRef.update(editedLogWithoutKey);
    
    // update app data model
    let logsList = this.logs;
    let foundIndex = -1;
    for (let idx in logsList) {
      if (logsList[idx].key === editedLog.key) {
        foundIndex = idx;
        break;
      }
    }

    // silently fail if item not found
    if (foundIndex !== -1) {
      logsList[foundIndex] = editedLog;
      this.logs = logsList;
    }
  }

  deleteLog = async (logKey) => {
    // delete from FB
    let docRef = this.logsRef.doc(logKey);
    await docRef.delete();

    // delete from app data model
    let foundIndex = -1;
    for (let idx in this.logs) {
      if (this.logs[idx].key === logKey) {
        foundIndex = idx;
        break;
      }
    }

    // silently fail if item not found
    if (foundIndex !== -1) {
      this.logs.splice(foundIndex, 1);
    }
  }

  addLogPicture = async (logKey, pictureObject) => {
  //   let fileName = logKey;
  //   let pictureRef = this.storageRef.child(fileName);

  //   // fetch picture object from the local filesystem
  //   let response = await fetch(pictureObject.uri);
  //   let pictureBlob = await response.blob();

  //   // upload to FB Storage
  //   await pictureRef.put(pictureBlob);

  //   // get picture URL
  //   let downloadURL = await pictureRef.getDownloadURL();
    
  //   // update log with picture and store in FB
  //   let logRef = this.logsRef.doc(logKey);
  //   await logRef.update({
  //     pictureURL: downloadURL,
  //     pictureHeight: pictureObject.height,
  //     pictureWidth: pictureObject.width
  //   });
  }

  // sport-specific
  createDive = (userKey) => {
    let blankDive = {
      // same for all logs
      user: userKey,
      timestamp: Date.now(),
      site: "",
      location: "",
      country: "",
      notes: "",
      pictureURL: "",
      pictureHeight: 0,
      pictureWidth: 0,
      favorite: false,
      rating: 0,
      latitude: "",
      longitude: "",

      // SCUBA diving
      sport: "scubaDiving",
      gas: "",
      maxDepth: "",
      tempBottom: "",
      tempSurface: "",
      totalTime: "",
      weights: ""
    }

    return blankDive;
  }

  createJump = (userKey) => {
    let blankJump = {
      // same for all logs
      user: userKey,
      timestamp: Date.now(),
      site: "",
      location: "",
      country: "",
      notes: "",
      pictureURL: "",
      pictureHeight: 0,
      pictureWidth: 0,
      favorite: false,
      rating: 0,
      latitude: "",
      longitude: "",

      // skydiving
      sport: "skydiving",
      type: "",
      category: "",
      staff: "",
      canopy: "",
      altJump: "",
      altOpen: "",
      freefall: ""
    }

    return blankJump;
  }
}


let theDataModel = undefined;

export function getDataModel() {
  if (!theDataModel) {
    theDataModel = new DataModel();
  }

  return theDataModel;
}