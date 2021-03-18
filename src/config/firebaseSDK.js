// Firebase configuration

import firebase from 'firebase';

class FirebaseSDK {
  constructor() {
    this.init();
    this.observeAuth();
  }

  init = () =>
    firebase.initializeApp( {
      apiKey: "AIzaSyDDg8aAdKOiIT7_syFbWV2-TokiJ2qAt8s",
      authDomain: "chat-69135.firebaseapp.com",
      databaseURL: "https://chat-69135-default-rtdb.firebaseio.com",
      projectId: "chat-69135",
      storageBucket: "chat-69135.appspot.com",
      messagingSenderId: "328692848179",
      appId: "1:328692848179:web:8f4b6d46326fba6df33546",
      measurementId: "G-HFNL45M96W"
    });

  observeAuth = () =>
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);

  onAuthStateChanged = user => {
    if (!user) {
      try {
        firebase.auth().signInAnonymously();
      } catch ({ message }) {
        alert(message);
      }
    }
  };

  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }

  get ref() {
    return firebase.database().ref('group').child('messages');
  }

  parse = snapshot => {
    const { timestamp: numberStamp, text, user } = snapshot.val();
    const { key: _id } = snapshot;
    const timestamp = new Date(numberStamp);
    const message = {
      _id,
      timestamp,
      text,
      user,
    };
    return message;
  };

  on = callback =>
    this.ref
      .limitToLast(20)
      .on('child_added', snapshot => callback(this.parse(snapshot)));

  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }
  // send the message to the Backend
  send = messages => {
    for (let i = 0; i < messages.length; i++) {
      const { text, user } = messages[i];
      const message = {
        text,
        user,
        timestamp: this.timestamp,
      };
      this.append(message);
    }
  };

  append = message => this.ref.push(message);

  // close the connection to the Backend
  off() {
    this.ref.off();
  }
}

FirebaseSDK.shared = new FirebaseSDK();
export default FirebaseSDK;