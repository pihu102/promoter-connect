// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// Your Firebase config (replace with your own if not done)
const firebaseConfig = {
  apiKey: "AIzaSyD8sOzjI75E8FmjlZg2ab4gyZxQdBPk06E",
  authDomain: "promoterconnect-1463e.firebaseapp.com",
  projectId: "promoterconnect-1463e",
  storageBucket: "promoterconnect-1463e.firebasestorage.app",
  messagingSenderId: "935098600996",
  appId: "1:935098600996:web:7e896cfc6ba889ff7d12b1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Handle Signup
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!role) {
      alert("Please select a role.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role
      });

      // Redirect based on role
      if (role === "promoter") {
        window.location.href = "dashboard-promoter.html";
      } else {
        window.location.href = "dashboard-company.html";
      }

    } catch (error) {
      alert(error.message);
    }
  });
}

// Handle Login
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user role from Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const role = docSnap.data().role;

        if (role === "promoter") {
          window.location.href = "dashboard-promoter.html";
        } else {
          window.location.href = "dashboard-company.html";
        }
      } else {
        alert("User data not found.");
      }

    } catch (error) {
      alert(error.message);
    }
  });
}



<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js"></script>
