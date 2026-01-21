import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "./firebaseConfig";

// Ініціалізація Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase ініціалізовано успішно");
} catch (error) {
  console.error("Помилка ініціалізації Firebase:", error);
}

export { db };
export default app;
