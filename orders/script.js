$(document).ready(function () {
    let token = localStorage.getItem('token');
    console.log('token:', token);
    const ordersList = document.getElementById("list");
    const orderButton = document.getElementById("order");
    const urlOrders = "https://food-delivery.kreosoft.ru/api/order";

    getOrders();

    orderButton.addEventListener("click", function () {
        event.preventDefault();
        window.location.href = "../basket/index.html"
    });

    async function getOrders() {
        try {
            let response = await fetch(urlOrders, {
                headers: {
                    'accept': ' application/json',
                    'Authorization': 'Bearer ' + token,
                }
            });
            if (response.ok) {
                let data = await response.json();
                console.log(data);
                for(let i=0; i<data.length; i++){
                    console.log(data[i]);
                    makeItem(data[i], i+1);
                }
            }
            else {
                alert("Ошибка: " + response.status + " " + response.statusText);
                if (response.status == 401) {
                    localStorage.removeItem('token');
                    window.location.href = "../authorization/index.html"

                }
            }

        } catch (error) {
            console.log(error);
        }
    };

    async function makeItem(data, num) {
        console.log(data);
        const orderHtml = await new Promise((resolve, reject) => {
            $.get('orderItem.html', function (order) {
                resolve(order);
            }).fail(function () {
                reject("Ошибка при загрузке select.html");
            });
        });

        const parser = new DOMParser();
        const orderDocument = parser.parseFromString(orderHtml, 'text/html');
        const divElement = orderDocument.body.firstChild;

        divElement.setAttribute("id", data.id);
        divElement.querySelector("button").setAttribute("for", data.id);
        divElement.querySelector("a").setAttribute("for", data.id);
        divElement.querySelector("a").setAttribute("num", num);

        const title = divElement.querySelector(".title");
        const dateTime = new Date(data.orderTime);
        const timeOrder = dateTime.toLocaleTimeString();

        const dateOrder = new Intl.DateTimeFormat('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dateTime);
        title.textContent = timeOrder+"  "+dateOrder;

        const status = divElement.querySelector(".status");
        if (data.status == 'InProcess') {
            status.textContent = "В процессе";
        }
        else {
            status.textContent = "Доставлено";
            divElement.querySelector(".button").classList.add("d-none");
        }


        const delivery = divElement.querySelector(".delivery");
        const dateTimeDelivery = new Date(data.deliveryTime);
        const timeDelivery = dateTimeDelivery.toLocaleTimeString();

        const dateDelivery = new Intl.DateTimeFormat('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dateTimeDelivery);
        delivery.textContent = dateDelivery+" в "+timeDelivery;

        const cost = divElement.querySelector(".cost");
        cost.textContent = data.price;

        ordersList.appendChild(divElement);

    }

    $('#list').on('click', '.btn', function (e) {
        e.preventDefault(); // Предотвращаем действие кнопки по умолчанию
        let formId = this.getAttribute('for');

        console.log("Значение атрибута 'form': " + formId);
        $('#' + formId + ' .status').text("Доставлен");
        $(this).addClass("d-none");
        postStatus(formId);
    });
    
    $('#list').on('click', 'a', function (e) {
         // Предотвращаем действие кнопки по умолчанию
        let orderId = this.getAttribute('for');
        let orderNum = this.getAttribute('num');

        console.log("Значение атрибута 'a': " + orderId);
        localStorage.setItem('orderId', orderId);
        localStorage.setItem('orderNum', orderNum);

    });

    function postStatus(id) {
        try {
            const url = urlOrders + "/"+id+"/status";
            fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            }).then(response => {
                if (response.ok) {
                    console.log("status change");
                }
                else {
                    alert("Ошибка: " + response.status);
                    if (response.status == 401) {
                        localStorage.removeItem('token');
                        window.location.href = "../authorization/index.html"
                    }
                }

            })
        }
        catch (error) {
            console.log(error);
            alert(error);
        }

    };

    
});