js


// Paste your Firebase config below
const firebaseConfig = {
  apiKey: "AIzaSyD8sOzjI75E8FmjlZg2ab4gyZxQdBPk06E",
  authDomain: "promoterconnect-1463e.firebaseapp.com",
  projectId: "promoterconnect-1463e",
  storageBucket: "promoterconnect-1463e.firebasestorage.app",
  messagingSenderId: "935098600996",
  appId: "1:935098600996:web:7e896cfc6ba889ff7d12b1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Signup Function
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      alert("Signup Successful!");
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}

// Login Function
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      alert("Login Successful!");
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}



function createEvent() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login first.");
    return;
  }

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const date = document.getElementById("date").value;
  const location = document.getElementById("location").value;
  const budget = document.getElementById("budget").value;

  db.collection("events").add({
    title,
    description,
    date,
    location,
    budget,
    createdBy: user.uid,
    applicants: []
  })
  .then(() => {
    alert("Event posted successfully!");
    // Optionally: Clear the form
  })
  .catch((error) => {
    alert("Error: " + error.message);
  });
}



// Load Events for Promoter
function loadEvents() {
  const eventList = document.getElementById("eventList");
  db.collection("events").get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        const div = document.createElement("div");
        div.innerHTML = `
          <h3>${data.title}</h3>
          <p>${data.description}</p>
          <p>Date: ${data.date}</p>
          <p>Location: ${data.location}</p>
          <p>Pay: ₹${data.budget}</p>
          <button onclick="applyToEvent('${doc.id}')">Apply</button>
          <hr>
        `;
        eventList.appendChild(div);
      });
    });
}

// Apply to Event
function applyToEvent(eventId) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login first.");
    return;
  }

  const eventRef = db.collection("events").doc(eventId);
  eventRef.update({
    applicants: firebase.firestore.FieldValue.arrayUnion(user.uid)
  })
  .then(() => {
    alert("Applied to event successfully!");
  })
  .catch((error) => {
    alert("Error applying: " + error.message);
  });
}

// Auto load when promoter-dashboard opens
if (window.location.pathname.includes("promoter-dashboard.html")) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      loadEvents();
    } else {
      window.location.href = "login.html";
    }
  });
}


// Load Company Events + Show Applicants
function loadCompanyEvents() {
  const user = auth.currentUser;
  if (!user) return;

  const myEventsDiv = document.getElementById("myEvents");

  db.collection("events").where("createdBy", "==", user.uid).get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        const applicants = data.applicants || [];

        const div = document.createElement("div");
        div.innerHTML = `
          <h3>${data.title}</h3>
          <p>${data.description}</p>
          <strong>Applicants:</strong><br>
          ${applicants.length > 0 ? applicants.map(uid => `<li>${uid}</li>`).join('') : '<i>No one applied yet</i>'}
          <hr>
        `;

        myEventsDiv.appendChild(div);
      });
    });
}

// Auto load when company-dashboard opens
if (window.location.pathname.includes("company-dashboard.html")) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      loadCompanyEvents();
    } else {
      window.location.href = "login.html";
    }
  });
}




let chatRoomId = null;

// Init Chat
function initChat() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("event");
  const promoterUID = params.get("promoter");
  const companyUID = params.get("company");

  auth.onAuthStateChanged((user) => {
    if (user && eventId && promoterUID && companyUID) {
      chatRoomId = `${eventId}_${promoterUID}_${companyUID}`;
      listenForMessages(chatRoomId);
    } else {
      alert("Chat initialization failed. Missing info.");
    }
  });
}

// Send message
function sendMessage() {
  const msgInput = document.getElementById("messageInput");
  const message = msgInput.value.trim();
  if (!message) return;

  const user = auth.currentUser;
  if (!user || !chatRoomId) return;

  db.collection("chats")
    .doc(chatRoomId)
    .collection("messages")
    .add({
      sender: user.uid,
      message: message,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

  msgInput.value = "";
}

// Listen for messages in real-time
function listenForMessages(roomId) {
  const msgBox = document.getElementById("messages");
  db.collection("chats")
    .doc(roomId)
    .collection("messages")
    .orderBy("timestamp")
    .onSnapshot((snapshot) => {
      msgBox.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        const msg = document.createElement("div");
        msg.innerHTML = `<b>${data.sender}:</b> ${data.message}`;
        msgBox.appendChild(msg);
      });
      msgBox.scrollTop = msgBox.scrollHeight;
    });
}

// Auto-init if chat.html loaded
if (window.location.pathname.includes("chat.html")) {
  initChat();
}



