const myModal = new bootstrap.Modal("#register-modal");
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");

//LOGAR NO SISTEMA
document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;
    const checkSession = document.getElementById("session-check").checked;

    getAccount(email).then(account => {
        if (!account) {
            alert("Opps! Verifique o usuário ou a senha.");
            return;
        }

        if (account) {
            if (account.password !== password) {
                alert("Opps! Verifique o usuário ou a senha.");
                return;
            }

            saveSession(email, checkSession);
            window.location.href = "./html/home.html";
        }
    });


});

//CRIAR CONTA
document.getElementById("create-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email-create-input").value;
    const password = document.getElementById("password-create-input").value;

    if (email.length < 5) {
        alert("Preencha o campo com um e-mail válido.");
        return;
    }

    if (password.length < 4) {
        alert("Preencha a senha com no mínimo 4 dígitos.");
        return;
    }

    firebase.firestore().collection("accounts").add({
        email,
        password,
        transactions: []
    }).then(x => {
        alert("Conta criada com sucesso!");
        myModal.hide();
    });
});

function checkLogged() {
    if (session) {
        session.setItem("logged", session);
        logged = session;
    }

    if (logged) {
        saveSession(logged, session);
        window.location.href = "./html/home.html";
    }
}

function saveSession(data, saveSession) {
    if (saveSession) {
        localStorage.setItem("session", data);
    }

    sessionStorage.setItem("logged", data);
}

function getAccount(key) {
    return firebase.firestore().collection("accounts").where("email", "==", key).get().then(function (doc) {
        if (doc.size == 1) {
            console.log("Document data:", doc.docs[0].data());
            return doc.docs[0].data();
        } else {
            return null;
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });
}