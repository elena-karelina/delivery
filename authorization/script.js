$(document).ready(function () {

    let token = localStorage.getItem('token');
    console.log('token:', token);
    const url = "https://food-delivery.kreosoft.ru/api/account/login";



    $('form').submit(function (event) {
        event.preventDefault();
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({
                "email": $('#InputEmail').val(),
                "password": $('#InputPassword').val()
            })
        }).then(response => {
            if (!response.ok) {
                alert("Ошибка: " + response.status);
            }
            else {
                return response.json();
            }


        })
            .then(data => {
                console.log("вы вошли в аккаунт");

                token = data.token; // Получаем токен из ответа сервера
                console.log(token);
                localStorage.setItem('token', token);
                window.location.href = "../index.html"
            })
            .catch(error => {
                console.error('Произошла ошибка:', error);
            });
    })
});