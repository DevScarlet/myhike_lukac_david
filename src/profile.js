import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig.js";



function populateUserInfo() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.log("No user is signed in, redirecting to login.");
            window.location.href = "login.html";
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                const { name = "", school = "", city = "" } = userData;

                document.getElementById("nameInput").value = name;
                document.getElementById("schoolInput").value = school;
                document.getElementById("cityInput").value = city;
            } else {
                console.log("No such user document!");
            }
        } catch (error) {
            console.error("Error getting user document:", error);
        }
    });
}

populateUserInfo();



document.querySelector("#editButton").addEventListener("click", editUserInfo);

function editUserInfo() {
    const fieldset = document.getElementById("personalInfoFields");
    if (fieldset) {
        fieldset.disabled = false;
    }
}



document.querySelector("#saveButton").addEventListener("click", saveUserInfo);

async function saveUserInfo() {
    const user = auth.currentUser;
    if (!user) {
        alert("No user is signed in. Please log in first.");
        return;
    }

    const userName = document.getElementById("nameInput").value;
    const userSchool = document.getElementById("schoolInput").value;
    const userCity = document.getElementById("cityInput").value;

    await updateUserDocument(user.uid, userName, userSchool, userCity);

    const fieldset = document.getElementById("personalInfoFields");
    if (fieldset) {
        fieldset.disabled = true;
    }
}



async function updateUserDocument(uid, name, school, city) {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, { name, school, city });
        console.log("User document successfully updated!");
    } catch (error) {
        console.error("Error updating user document:", error);
    }
}
