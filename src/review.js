// src/review.js

import { db, auth } from "./firebaseConfig.js";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";



let hikeDocID = localStorage.getItem("hikeDocID");

displayHikeName(hikeDocID);

async function displayHikeName(id) {
    if (!id) {
        console.warn("No hikeDocID found in localStorage.");
        return;
    }

    try {
        const hikeRef = doc(db, "hikes", id);
        const hikeSnap = await getDoc(hikeRef);

        if (hikeSnap.exists()) {
            const hikeName = hikeSnap.data().name;
            document.getElementById("hikeName").textContent = hikeName;
        } else {
            console.log("No such hike found!");
        }
    } catch (error) {
        console.error("Error getting hike document:", error);
    }
}



let hikeRating = 0;

function manageStars() {
    const stars = document.querySelectorAll(".star");

    stars.forEach((star, index) => {
        star.addEventListener("click", () => {
            stars.forEach((s, i) => {
                s.textContent = i <= index ? "star" : "star_outline";
            });
            hikeRating = index + 1;
            console.log("Current rating:", hikeRating);
        });
    });
}


async function writeReview() {
    console.log("Inside writeReview");

    const hikeTitle = document.getElementById("title").value;
    const hikeLevel = document.getElementById("level").value;
    const hikeSeason = document.getElementById("season").value;
    const hikeDescription = document.getElementById("description").value;
    const hikeFlooded =
        document.querySelector('input[name="flooded"]:checked')?.value;
    const hikeScrambled =
        document.querySelector('input[name="scrambled"]:checked')?.value;

    console.log("inside writeReview, rating =", hikeRating);
    console.log("hikeDocID =", hikeDocID);
    console.log(
        hikeTitle,
        hikeLevel,
        hikeSeason,
        hikeDescription,
        hikeFlooded,
        hikeScrambled
    );

    if (!hikeTitle || !hikeDescription) {
        alert("Please complete all required fields (title + description).");
        return;
    }

    const user = auth.currentUser;

    if (!user) {
        alert("You must be logged in to submit a review.");
        return;
    }

    try {
        const userID = user.uid;

        await addDoc(collection(db, "reviews"), {
            hikeDocID: hikeDocID,
            userID: userID,
            title: hikeTitle,
            level: hikeLevel,
            season: hikeSeason,
            description: hikeDescription,
            flooded: hikeFlooded,
            scrambled: hikeScrambled,
            rating: hikeRating,
            timestamp: serverTimestamp(),
        });

        console.log("Review successfully written!");

        window.location.href = `eachHike.html?docID=${hikeDocID}`;
    } catch (error) {
        console.error("Error adding review:", error);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    manageStars();

    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
        submitBtn.addEventListener("click", writeReview);
    }
});