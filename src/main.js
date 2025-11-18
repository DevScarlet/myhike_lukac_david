import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";
import { doc, getDoc, onSnapshot, collection, getDocs, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";



function readQuote(day) {
  const quoteDocRef = doc(db, "quotes", day);

  onSnapshot(quoteDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const quoteSpan = document.getElementById("quote-goes-here");
      if (quoteSpan) quoteSpan.innerHTML = docSnap.data().quote;
    }
  });
}



function showDashboard() {
  const nameElement = document.getElementById("name-goes-here");

  onAuthReady(async (user) => {
    if (!user) {
      location.href = "index.html";
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : {};

    const name = userData.name || user.displayName || user.email;
    if (nameElement) nameElement.textContent = `${name}!`;

    const bookmarks = userData.bookmarks || [];

    await displayCardsDynamically(user.uid, bookmarks);
  });
}



async function displayCardsDynamically(userId, bookmarks) {
  let cardTemplate = document.getElementById("hikeCardTemplate");
  const hikesCollectionRef = collection(db, "hikes");

  const querySnapshot = await getDocs(hikesCollectionRef);

  document.getElementById("hikes-go-here").innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    let newcard = cardTemplate.content.cloneNode(true);
    const hike = docSnap.data();
    const hikeId = docSnap.id;

    newcard.querySelector(".card-title").textContent = hike.name;
    newcard.querySelector(".card-text").textContent =
      hike.details || `Located in ${hike.city}.`;
    newcard.querySelector(".card-length").textContent = hike.length;

    if (newcard.querySelector(".card-image"))
      newcard.querySelector(".card-image").src = `./images/${hike.code}.jpg`;

    const detailsBtn = newcard.querySelector(".get-details-btn");
    if (detailsBtn) {
      detailsBtn.addEventListener("click", () => {
        window.location.href = `eachHike.html?docID=${hikeId}`;
      });
    }

    const icon = newcard.querySelector(".bookmark-icon");
    icon.id = "save-" + hikeId;

    const isBookmarked = bookmarks.includes(hikeId);
    icon.innerText = isBookmarked ? "bookmark" : "bookmark_border";

    icon.onclick = () => toggleBookmark(userId, hikeId);

    document.getElementById("hikes-go-here").appendChild(newcard);
  });
}



async function toggleBookmark(userId, hikeDocID) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data() || {};
  const bookmarks = userData.bookmarks || [];

  const icon = document.getElementById("save-" + hikeDocID);
  const isBookmarked = bookmarks.includes(hikeDocID);

  try {
    if (isBookmarked) {
      await updateDoc(userRef, { bookmarks: arrayRemove(hikeDocID) });
      icon.innerText = "bookmark_border";
    } else {
      await updateDoc(userRef, { bookmarks: arrayUnion(hikeDocID) });
      icon.innerText = "bookmark";
    }
  } catch (e) {
    console.error("Error toggling bookmark:", e);
  }
}



readQuote("tuesday");
showDashboard();
