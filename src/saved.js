import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

function initSavedPage() {
    onAuthReady(async (user) => {
        if (!user) {
            location.href = "/login.html";
            return;
        }

        const userId = user.uid;
        await insertNameFromFirestore(userId);
        await renderSavedHikes(userId);
    });
}

initSavedPage();



async function insertNameFromFirestore(userId) {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
        const name = snap.data().name || "Hiker";
        document.getElementById("name-goes-here").innerText = name;
    }
}



import { getDoc as gd, doc as d2 } from "firebase/firestore";

async function renderSavedHikes(userId) {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    const data = snap.data() || {};
    const bookmarks = data.bookmarks || [];

    const template = document.getElementById("savedCardTemplate");
    const group = document.getElementById("hikeCardGroup");

    for (const hikeId of bookmarks) {
        const hikeRef = d2(db, "hikes", hikeId);
        const hikeSnap = await gd(hikeRef);

        if (!hikeSnap.exists()) continue;

        const hike = hikeSnap.data();
        const card = template.content.cloneNode(true);

        card.querySelector(".card-title").innerText = hike.name;
        card.querySelector(".card-text").innerText =
            hike.details || `Located in ${hike.city}.`;
        card.querySelector(".card-length").innerText = hike.length;
        card.querySelector(".card-image").src = `./images/${hike.code}.jpg`;
        card.querySelector(".read-more").href = `eachHike.html?docID=${hikeId}`;

        group.appendChild(card);
    }
}
