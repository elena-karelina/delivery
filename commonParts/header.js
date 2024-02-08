$(document).ready(function () {


    const body = document.querySelector("body");
    let token = localStorage.getItem("token");
    let basketVolume;

    const currentPage = window.location.href;
    const currentPageArray = currentPage.split('/');
    const currentPageFileName = currentPageArray[currentPageArray.length - 2];

    let headerPath = '';
    let authorizationPath = '';
    let regPath = '';
    let basketPath = '';
    let ordersPath = '';
    let mainPath = '#';

    if (currentPageFileName === 'delivery') {
        headerPath = 'commonParts/header.html';
        authorizationPath='authorization/index.html'
        regPath='reg/index.html'
        basketPath='basket/index.html'
        ordersPath='orders/index.html'
    } else {
        headerPath = '../commonParts/header.html';
        authorizationPath='../authorization/index.html'
        regPath='../reg/index.html'
        basketPath='../basket/index.html'
        ordersPath='../orders/index.html'
        mainPath='../index.html'
    }
    console.log( 1);


    console.log( authorizationPath, regPath, currentPage, currentPageFileName);

    const headerPromise = new Promise((resolve, reject) => {
        $.get(headerPath, function (header) {
            resolve(header);
        }).fail(function () {
            reject("Ошибка при загрузке header.html");
        });
    });
    

    headerPromise.then(function (header) {
        const parser = new DOMParser();
        const headerDocument = parser.parseFromString(header, 'text/html');
        const headerContent = headerDocument.body.firstChild;
        body.insertBefore(headerContent, body.firstChild);

        const registerButton = document.getElementById("register");
        const loginButton = document.getElementById("login");
        const logoutButton = document.getElementById("logout");
        const basket = document.getElementById('basket');
        const orders = document.getElementById('orders');
        const main = document.getElementById('main');
        basket.setAttribute('href', basketPath);
        orders.setAttribute('href', ordersPath);
        main.setAttribute('href', mainPath);

        if (token == null) {
            $('#mail').addClass("d-none");
            $('#logout').addClass("d-none");
            $('#basket').addClass("d-none");
            $('#orders').addClass("d-none");
    
        }
        else {
            console.log(token);
            $('#login').addClass("d-none");
            $('#register').addClass("d-none");
            basketVolume = document.getElementById("basketVolume");
            startVolume();
            GetProfile();
        }
    
        registerButton.addEventListener("click", function () {
            window.location.href = regPath
        });
    
        loginButton.addEventListener("click", function () {
            window.location.href = authorizationPath
        });
    
        logoutButton.addEventListener("click", function () {
            event.preventDefault();
            logout();
        });
    }).catch(function (error) {
        console.log(error);
    })

    async function startVolume() {
        volume = 0;
        let list = await getBasket();
        list.forEach(item => {
            volume += item[1];
        });
        basketVolume.textContent = volume;
    }

    async function getBasket() {
        try {
            let response = await fetch('https://food-delivery.kreosoft.ru/api/basket', {
                headers: {
                    'accept': 'text/plain',
                    'Authorization': 'Bearer ' + token,
                }
            });
            if (!response.ok) {
                alert("Ошибка: " + response.status);
                if (response.status == 401) {
                    localStorage.removeItem('token');
                    window.location.href = authorizationPath;
                }
            }
            else {
                let data = await response.json();
                console.log(data);

                let list = [];
                data.forEach(item => {
                    let id = item.id;
                    let amount = item.amount;
                    list.push([id, amount]);
                });
                return list;
            }

        } catch (error) {
            console.log(error);
        }
    };

    function logout() {
        try {
            const url = "https://food-delivery.kreosoft.ru/api/account/logout";
            fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            }).then(response => {
                if (response.ok) {
                    console.log("logout");
                    localStorage.removeItem('token');
                    window.location.href = "../index.html"
                }
                else {
                    alert("Ошибка: " + response.status);
                }
            })
        }
        catch (error) {
            console.log(error);

        }

    };

    async function GetProfile() {
        try {
            let response = await fetch('https://food-delivery.kreosoft.ru/api/account/profile', {
                headers: {
                    'accept': 'text/plain',
                    'Authorization': 'Bearer ' + token,
                }
            });
            if (response.status == 401) {
                localStorage.removeItem('token');
                window.location.href = authorizationPath;

            }
            else {
                let data = await response.json();
                console.log(data);
                $('#mail').text(data.email);
            }


        } catch (error) {
            console.log(error);
        }
    };

});

