import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";
import { doc, getDoc, onSnapshot, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";



function readQuote(day) {
  const quoteDocRef = doc(db, "quotes", day);

  onSnapshot(
    quoteDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const quoteSpan = document.getElementById("quote-goes-here");
        if (quoteSpan) {
          quoteSpan.innerHTML = docSnap.data().quote;
        }
      } else {
        console.log("No such quote document!");
      }
    },
    (error) => {
      console.error("Error listening to quote document: ", error);
    }
  );
}



function showDashboard() {
  const nameElement = document.getElementById("name-goes-here");

  onAuthReady(async (user) => {
    if (!user) {
      location.href = "index.html";
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      const name = userDoc.exists()
        ? userDoc.data().name
        : user.displayName || user.email;

      if (nameElement) {
        nameElement.textContent = `${name}!`;
      }
    } catch (error) {
      console.error("Error loading user dashboard data:", error);
    }
  });
}



function addHikeData() {
  const hikesRef = collection(db, "hikes");
  console.log("Adding sample hike data...");

  addDoc(hikesRef, {
    code: "BBY01",
    name: "Burnaby Lake Park Trail",
    city: "Burnaby",
    level: "easy",
    details: "A lovely place for a lunch walk.",
    length: 10,
    hike_time: 60,
    lat: 49.2467097082573,
    lng: -122.9187029619698,
    last_updated: serverTimestamp(),
  });

  addDoc(hikesRef, {
    code: "AM01",
    name: "Buntzen Lake Trail",
    city: "Anmore",
    level: "moderate",
    details: "Close to town, and relaxing.",
    length: 10.5,
    hike_time: 80,
    lat: 49.3399431028579,
    lng: -122.85908496766939,
    last_updated: serverTimestamp(),
  });

  addDoc(hikesRef, {
    code: "NV01",
    name: "Mount Seymour Trail",
    city: "North Vancouver",
    level: "hard",
    details: "Amazing ski slope views.",
    length: 8.2,
    hike_time: 120,
    lat: 49.38847101455571,
    lng: -122.94092543551031,
    last_updated: serverTimestamp(),
  });
}



async function displayCardsDynamically() {
  const cardTemplate = document.getElementById("hikeCardTemplate");
  const container = document.getElementById("hikes-go-here");
  if (!cardTemplate || !container) {
    console.warn("Hike card template or container not found in DOM.");
    return;
  }

  const hikesCollectionRef = collection(db, "hikes");

  try {
    const querySnapshot = await getDocs(hikesCollectionRef);

    container.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const hike = docSnap.data();
      const hikeId = docSnap.id;

      const newCard = cardTemplate.content.cloneNode(true);

      newCard.querySelector(".card-title").textContent = hike.name;
      newCard.querySelector(".card-text").textContent =
        hike.details || `Located in ${hike.city}.`;
      newCard.querySelector(".card-length").textContent = hike.length;

      const detailsBtn = newCard.querySelector(".get-details-btn");
      if (detailsBtn) {
        detailsBtn.addEventListener("click", () => {
          window.location.href = `eachHike.html?docID=${hikeId}`;
        });
      }

      container.appendChild(newCard);
    });
  } catch (error) {
    console.error("Error getting hikes documents: ", error);
  }
}



async function seedHikes() {
  const hikesRef = collection(db, "hikes");

  try {
    const querySnapshot = await getDocs(hikesRef);
    if (querySnapshot.empty) {
      console.log("Hikes collection is empty. Seeding data...");
      addHikeData();
    } else {
      console.log("Hikes collection already contains data. Skipping seed.");
    }
  } catch (error) {
    console.error("Error checking hikes collection: ", error);
  }
}



readQuote("tuesday");
showDashboard();
displayCardsDynamically();
seedHikes();
