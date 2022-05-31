const myModal = new bootstrap.Modal("#transactions-modal");
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");

let data = {
    transactions: []
};

document.getElementById("button-logout").addEventListener("click", logout);
document.getElementById("arg-delete").addEventListener("click", deletarConta);

//ADICIONAR LANCAMENTO
document.getElementById("transaction-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const value = parseFloat(document.getElementById("value-input").value);
    const description = document.getElementById("description-input").value;
    const date = document.getElementById("date-input").value;
    const type = document.querySelector('input[name="type-input"]:checked').value;

    var transaction = {
        value: value, type: type, description: description, date: date
    };
    saveData(transaction);

    e.target.reset();

    alert("Lançamento adicionado com sucesso.");

});

checkLogged();

function checkLogged() {

    if (!logged) {
        window.location.href = "index.html";
        return;
    }

    const dataUser = localStorage.getItem(logged);
    if (dataUser) {
        data = JSON.parse(dataUser);
    }

    getTransactions(); 

}

function logout() {
    sessionStorage.removeItem("logged");
    localStorage.removeItem("sessions");

    window.location.href = "index.html";
}

function showTransactions() {
    const transactions = data.transactions;
    let transactionsHtml = ``;

    if(transactions.length) {
        transactions.forEach((item) => {
            let type = "Entrada";

            if(item.type === "2") {
                type = "Saída"; 
            }

            transactionsHtml += `
                <tr>
                    <th scope = "row">${item.date}</th>
                    <td>${item.value.toFixed(2)}</td>
                    <td>${type}</td>
                    <td>${item.description}</td>
                </tr>
            `

        })
    }

    document.getElementById("transactions-list").innerHTML = transactionsHtml;
}

function getTransactions(){
    return firebase.firestore().collection("cash")
    .where("user", "==", logged)
    .get()
    .then(x => {
        const transactions = x.docs.map(doc => doc.data());
        console.log(transactions);
        data.transactions = transactions;
        showTransactions();
    });
}

function deletarConta(){
    console.log("deletar conta");
    firebase.firestore().collection("cash")
    .where("user", "==", logged).get()
    .then(x => {
        x.docs.forEach(doc => {
            doc.ref.delete();
        });
        firebase.firestore().collection("accounts").where("email","==",logged).get()
        .then(x => {
            x.docs.forEach(doc => {
                doc.ref.delete();
            });
            setTimeout(() => {
                localStorage.removeItem("session");
                sessionStorage.removeItem("logged");
                window.location.href = "index.html";
            }, 1000);
        });
        
    });
}

function saveData(formData) {
    firebase.firestore().collection("cash").add({
        ...formData,
        user: logged
    }).then(x => {
        data.transactions.push(formData);
        myModal.hide();
        showTransactions();
    });
}
