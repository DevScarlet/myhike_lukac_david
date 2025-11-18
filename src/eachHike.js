// src/eachHike.js

import { db } from "./firebaseConfig.js";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";



async function loadHikeDetails() {
    const params = new URL(window.location.href);
    const hikeID = params.searchParams.get("docID");

    if (!hikeID) {
        console.warn("No hike ID found in URL.");
        return;
    }

    try {
        const hikeRef = doc(db, "hikes", hikeID);
        const hikeSnap = await getDoc(hikeRef);

        if (hikeSnap.exists()) {
            const data = hikeSnap.data();
            const name = data.name || "Unknown hike";

            document.getElementById("hikeName").textContent = name;

        } else {
            console.log("No such hike document!");
        }
    } catch (error) {
        console.error("Error getting hike document:", error);
    }
}



function saveHikeDocumentIDAndRedirect() {
    const params = new URL(window.location.href);
    const hikeID = params.searchParams.get("docID");

    if (!hikeID) {
        console.warn("No hike ID found in URL. Cannot continue.");
        return;
    }

    localStorage.setItem("hikeDocID", hikeID);
    window.location.href = "review.html";
}
document.addEventListener("DOMContentLoaded", () => {
    const writeReviewBtn = document.getElementById("writeReviewBtn");
    if (writeReviewBtn) {
        writeReviewBtn.addEventListener("click", saveHikeDocumentIDAndRedirect);
    }
});



async function populateReviews() {
    const hikeCardTemplate = document.getElementById("reviewCardTemplate");
    const hikeCardGroup = document.getElementById("reviewCardGroup");

    const params = new URL(window.location.href);
    const hikeID = params.searchParams.get("docID");
    if (!hikeID) {
        console.warn("No hike ID found in URL.");
        return;
    }

    if (!hikeCardTemplate || !hikeCardGroup) {
        console.warn("Review template or group not found in DOM.");
        return;
    }

    try {
        const q = query(collection(db, "reviews"), where("hikeDocID", "==", hikeID));
        const querySnapshot = await getDocs(q);

        console.log("Found", querySnapshot.size, "reviews");

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();

            const title = data.title || "(No title)";
            const level = data.level || "(Not specified)";
            const season = data.season || "(Not specified)";
            const description = data.description || "";
            const flooded = data.flooded || "(unknown)";
            const scrambled = data.scrambled || "(unknown)";
            const rating = data.rating || 0;

            let time = "";
            if (data.timestamp?.toDate) {
                time = data.timestamp.toDate().toLocaleString();
            }

            const reviewCard = hikeCardTemplate.content.cloneNode(true);

            reviewCard.querySelector(".title").textContent = title;
            reviewCard.querySelector(".time").textContent = time;
            reviewCard.querySelector(".level").textContent = `Level: ${level}`;
            reviewCard.querySelector(".season").textContent = `Season: ${season}`;
            reviewCard.querySelector(".scrambled").textContent = `Scrambled: ${scrambled}`;
            reviewCard.querySelector(".flooded").textContent = `Flooded: ${flooded}`;
            reviewCard.querySelector(".description").textContent = `Description: ${description}`;

            let starRating = "";
            for (let i = 0; i < rating; i++) {
                starRating += '<span class="material-icons">star</span>';
            }
            for (let i = rating; i < 5; i++) {
                starRating += '<span class="material-icons">star_outline</span>';
            }
            reviewCard.querySelector(".star-rating").innerHTML = starRating;

            hikeCardGroup.appendChild(reviewCard);
        });
    } catch (error) {
        console.error("Error loading reviews:", error);
    }
}



loadHikeDetails();
populateReviews();