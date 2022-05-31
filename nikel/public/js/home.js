const myModal = new bootstrap.Modal("#transaction-modal");
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");
data = {};
document.getElementById("button-logout").addEventListener("click", logout);
document.getElementById("arg-delete").addEventListener("click", deletarConta);

document.getElementById("transactions-button").addEventListener("click", function() {
    window.location.href = "transactions.html"
})

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

    getCashIn();
    getCashOut();
    getTotal();
});

checkLogged();

function checkLogged(){

    if(!logged) {
        window.location.href = "index.html";
        return;
    }

    const dataUser = localStorage.getItem(logged);
    if(dataUser) {
        data = JSON.parse(dataUser);
    }

    getTransactions();
}



function logout() {
    sessionStorage.removeItem("logged");
    localStorage.removeItem("session");

    window.location.href = "index.html";
}

function getCashIn() {
    const transactions = data.transactions;
    const cashIn = transactions.filter((item) => item.type === "1"); 

    if (cashIn.length) {
        let cashInHtml = ``;
        let limit = 0;
    
        if (cashIn.length > 5) {
            limit = 5;
        } else {
            limit = cashIn.length;
        }

        for (let index = 0; index < limit; index++) {
            cashInHtml += `
            <div class="row mb-4">
                <div class="col-12">
                    <h3 class="fs-2">R$ ${cashIn[index].value.toFixed(2)}</h3>
                    <div class="container p-0">
                        <div class="row">
                            <div class="col-12 col-md-8">
                                <p>${cashIn[index].description}</p>
                            </div>
                            <div class="col-12 col-md-3 d-flex justify-content-end">
                                ${cashIn[index].date}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `
        }

        document.getElementById("cash-in-list").innerHTML = cashInHtml;
    }
}


function getCashOut() {
    const transactions = data.transactions;

    const cashOut = transactions.filter((item) => item.type === "2");

    if (cashOut.length) {
        let cashOutHtml = ``;
        let limit = 0;
        
        if (cashOut.length > 5) {
            limit = 5;
        } else {
            limit = cashOut.length;
        }

        for (let index = 0; index < limit; index++) {
            cashOutHtml += `
                <div class="row mb-4">
                    <div class="col-12">
                        <h3 class="fs-2">R$ ${cashOut[index].value.toFixed(2)}</h3>
                        <div class="container p-0">
                            <div class="row">
                                <div class="col-12 col-md-8">
                                    <p>${cashOut[index].description}</p>
                                </div>
                                <div class="col-12 col-md-3 d-flex justify-content-end">
                                    ${cashOut[index].date}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }

        document.getElementById("cash-out-list").innerHTML = cashOutHtml;
    }
}

function getTotal() {
    const transactions = data.transactions;
    let total = 0;

    transactions.forEach((item) => {
        if (item.type === "1") {
            total += item.value;
        } else {
            total -= item.value;
        }
    });

    document.getElementById("total").innerHTML = `R$ ${total.toFixed(2)}`;
}

function getTransactions(){
    return firebase.firestore().collection("cash")
    .where("user", "==", logged)
    .get()
    .then(x => {
        const transactions = x.docs.map(doc => doc.data());
        console.log(transactions);
        data.transactions = transactions;
        getCashIn();
        getCashOut();
        getTotal();
    });
}

function saveData(formData) {
    firebase.firestore().collection("cash").add({
        ...formData,
        user: logged
    }).then(x => {
        data.transactions.push(formData);
        myModal.hide();
        getCashIn();
        getCashOut();
        getTotal();
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