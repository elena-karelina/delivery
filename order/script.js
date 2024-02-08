$(document).ready(function () {
    let token = localStorage.getItem('token');
    let orderId = localStorage.getItem('orderId');
    let orderNum = localStorage.getItem('orderNum');
    console.log('token:', token);
    console.log('orderId:', orderId);
    console.log('orderNum:', orderNum);

    const orderDone = document.getElementById("btn-done");

    const urlBasket = 'https://food-delivery.kreosoft.ru/api/basket';
    const urlLogout = "https://food-delivery.kreosoft.ru/api/account/logout";
    const urlProfile = 'https://food-delivery.kreosoft.ru/api/account/profile';
    const urlData = 'https://food-delivery.kreosoft.ru/api/order/';
    const urlOrders = "https://food-delivery.kreosoft.ru/api/order";
    const urlAddress = 'https://food-delivery.kreosoft.ru/api/address/getaddresschain?objectGuid=';


    getData();
    $('.num').text(orderNum);


    orderDone.addEventListener("click", function () {
        event.preventDefault();
        $('.status').text("Доставлено");
        $(this).addClass("d-none");
        postStatus(orderId);
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

    async function getAddress(id) {
        try {
            let url = urlAddress + id;
            let response = await fetch(url, {
                headers: {
                    'accept': 'text/plain',
                }
            });
            if (response.ok) {
                let data = await response.json();
                for (let i = 0; i < data.length; i++) {
                    let currentValue = $('.address').text();
                    let newValue = currentValue + data[i].text;
                    if (i!=data.length-1){
                        newValue+=", ";
                    }
                    $('.address').text(newValue);
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

    function outputlist(list) {
        for (let i = 0; i < list.length; i++) {
            $.get('../makeOrder/item.html', function (item) {
                let $item = $(item); // создаем jQuery-объект из элемента
                $item.find("img").attr("src", list[i].image);
                $item.find("h4").text(list[i].name);
                $item.find(".price-one").text(list[i].price);
                $item.find(".price").text(list[i].totalPrice);
                $item.find(".count").text(list[i].amount);
                $('#list').append($item);
            });
        }
    }

    async function getData() {
        try {
            let url = urlData + orderId;
            let response = await fetch(url, {
                headers: {
                    'accept': ' application/json',
                    'Authorization': 'Bearer ' + token,
                }
            });
            if (!response.ok) {
                alert("Ошибка: " + response.status);
                if (response.status == 401) {
                    localStorage.removeItem('token');
                    window.location.href = "../authorization/index.html"
                }
            }

            else {
                let data = await response.json();
                console.log(data);
                $('.all-price').text(data.price);

                const dateTimeOrder = new Date(data.orderTime);
                const timeOrder = dateTimeOrder.toLocaleTimeString();
                const dateOrder = new Intl.DateTimeFormat('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dateTimeOrder);
                $('.order-time').text(dateOrder + " " + timeOrder);

                const dateTimeDelivery = new Date(data.deliveryTime);
                const timeDelivery = dateTimeDelivery.toLocaleTimeString();
                const dateDelivery = new Intl.DateTimeFormat('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dateTimeDelivery);
                $('.delivery').text(dateDelivery + " " + timeDelivery);

                if (data.status == "Delivered") {
                    $('.status').text("Доставлено");
                    $('.done').addClass("d-none");

                }
                else {
                    $('.status').text("В обработке");

                }

                outputlist(data.dishes);
                getAddress(data.address)
            }

        } catch (error) {
            console.log(error);
        }
    };


});