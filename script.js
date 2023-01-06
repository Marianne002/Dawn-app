import config from '../config.js';

// Init Firebase
firebase.initializeApp(config);

document.getElementById("logged-in").style.display = "none";
document.getElementById("logged-out").style.display = "block";

//EventListener
document.getElementById("loginForm").addEventListener("submit", emailPasswordLogin);
document.getElementById("logout").addEventListener("click", logout);
$('#contenu').on('click', '[data_doc_id]', onDelete);
$('#contenu').on('click', '[data-doc-id]', onEditDate);
document.addEventListener("DOMContentLoaded",onPageLoad);

//Authentication
function emailPasswordLogin(event) {
    event.preventDefault();

    const email = $('#emailField').val();
    const password = $('#passwordField').val();

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(result => {
            document.getElementById("logged-out").style.display = "none";
            document.getElementById("logged-in").style.display = "block";
            document.getElementById("loginForm").reset();
            console.log(result);
        })
        .catch(error => alert(error.message));
};

let currentUser = null;

//Already connected ?
function onPageLoad() {
    firebase.auth().onAuthStateChanged(user => {
        if (user !== null) {
            document.getElementById("logged-out").style.display = "none";
            document.getElementById("logged-in").style.display = "block";
            currentUser = user;
        };
    });
};

//Logout
function logout() {
    firebase.auth().signOut().then(() => {
        document.getElementById("logged-out").style.display = "block";
        document.getElementById("logged-in").style.display = "none";
    });
};

//Add tour date
document.getElementById("addDateForm").addEventListener("submit", (event)=> {
    event.preventDefault();
    
    const date = $('#dateData').val();
    const place = $('#placeData').val();
    const locality = $('#localityData').val();
    const tickets = $('#ticketsData').val();

    //Add another tour date in the table
    firebase.firestore().collection('Tour').add({
        date:date,
        place: place,
        locality: locality,
        tickets: tickets
    })
    .then ( () => {
        document.getElementById("addDateForm").reset();
        $("#tourModal").modal("hide");
    });
});

// Lors de la modification d'une date
function onEditDate (event) {
    event.preventDefault();
    
    const id = $(this).attr('data-doc-id');
    const date = $('#dateData').val();
    const place = $('#placeData').val();
    const locality = $('#localityData').val();
    const tickets = $('#ticketsData').val();

    firebase.firestore().collection('Tour').doc(id).update({
        date:date,
        place: place,
        locality: locality,
        tickets: tickets
    }).then ( () => {
        document.getElementById("addDateForm").reset();
        $("#tourModal").modal("hide");
    });
};

//Delete tour date
function onDelete (event) {
    event.preventDefault();
    const id = $(this).attr('data_doc_id');
    const docRef = firebase.firestore().collection('Tour').doc(id);
    docRef.get()
        .then(linkObj => {
            if (!linkObj.exists) {
                throw new Error('Ce lien n\'existe pas ou plus !');
            }
        })
        .then(() => docRef.delete())
        .then(() => console.log('Lien supprimé !'))
        
};

//Show tour date from the firestore
const datesRef = firebase.firestore().collection("Tour");
datesRef.onSnapshot(querySnapshot => {
    document.getElementById("contenu").innerHTML="";
    querySnapshot.forEach(function(doc) {

        let {date, place, locality, tickets} = doc.data();
        let docID = doc.id;

        const template = 
        `<tr>
            <td>${locality}</td>
            <td><p>${place}</p></td>
            <th scope="row">${date}</th>
            <td>${tickets}</td>
            <td><button type="button" class="btn btn-outline-danger float-end" data-doc-id="${docID}">Update</button></td>
            <td><button type="button" class="btn btn-light float-end" data_doc_id="${docID}">❌</button></td>
        </tr>`;

        document.getElementById("contenu").innerHTML += template;
    });
});