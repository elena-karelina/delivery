$(document).ready(function () {
    let token = localStorage.getItem("token");
    let volume;

    const urlPostDish = "https://food-delivery.kreosoft.ru/api/basket/dish/";



    GetProfile();
    outputDishes();


    document.getElementById("order").addEventListener("click", function () {
        window.location.href = "../makeOrder/index.html"
    });

    async function GetProfile() {
        try {
            let response = await fetch('https://food-delivery.kreosoft.ru/api/account/profile', {
                headers: {
                    'accept': 'text/plain',
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
                $('#mail').text(data.email);
            }


        } catch (error) {
            console.log(error);
        }
    };

    async function outputDishes() {
        let list = await getBasket();
        console.log(list);
        for (let i = 0; i < list.length; i++) {
            $.get('item.html', function (item) {
                let $item = $(item); // создаем jQuery-объект из элемента
                $item.find("button").attr("id", list[i].id);
                $item.find('.num').text(i + 1 + ".");
                $item.find("img").attr("src", list[i].image);
                $item.find("h4").text(list[i].name);
                $item.find("input").attr("old-value", list[i].amount);
                $item.find("input").val(list[i].amount);
                $item.find(".price").text(list[i].price);

                $('#list').append($item);
            });
        }

    }

    async function getBasket() {
        try {
            console.log(1);
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
                    window.location.href = "../authorization/index.html"
                }
            }
            else {

                volume = 0;
                let data = await response.json();
                console.log(data);
                let list = [];
                data.forEach(item => {
                    volume += item.amount;
                    list.push(item);
                });
                console.log(list);
                
                if(volume>0){
                    $("#order").removeClass("d-none");
                }
                else{
                    $("#list").find("span").text("Корзина пуста :(");
                }
                return list;
                
            }



        } catch (error) {
            console.log(error);
        }
    };

     function deleteDish(dishId, increase) {
        try {
            const url = urlPostDish + dishId + "?increase=" + increase;
             fetch(url, {
                method: 'DELETE',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            }).then(response => {
                if (response.ok) {
                    console.log("del");
                    if(!increase){
                        location.reload();
                    }
                }
                else {
                    if (response.status == 401) {
                        localStorage.removeItem('token');
                        window.location.href = "../authorization/index.html"

                    }
                    alert("Ошибка: " + response.status);
                }
            })
        }
        catch (error) {
            console.log(error);

        }

    };


    function PostDish(dishId) {
        try {
            const url = urlPostDish + dishId;
            fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            }).then(response => {
                if (response.ok) {
                    console.log("add");
                }
                else {
                    if (response.status == 401) {
                        localStorage.removeItem('token');
                        window.location.href = "../authorization/index.html"

                    }
                    alert("Ошибка: " + response.status);
                }

            })
        }
        catch (error) {
            console.log(error);
            alert(error);
        }

    };

    $('body').on('click', '.number-minus, .number-plus', function () {
        let $row = $(this).closest('.number');
        let $input = $row.find('.number-text');
        let step = $row.data('step');
        let val = parseFloat($input.val());
        if ($(this).hasClass('number-minus')) {
            val -= step;
        } else {
            val += step;
        }
        $input.val(val);
        $input.change();
        return false;
    });

    $('body').on('change', '.number-text', function () {
        let $input = $(this);
        let $row = $input.closest('.number');
        let $form = $input.closest('form');
        let id = $form.find("button").attr("id");
        let step = $row.data('step');
        let min = parseInt($row.data('min'));
        let max = parseInt($row.data('max'));
        let val = parseFloat($input.val());
        let oldValue = $input.attr('old-value');
        if (isNaN(val)) {
            val = step;
        } else if (min && val < min) {
            val = min;
        } else if (max && val > max) {
            val = max;
        }
        console.log(oldValue, val);
        if (oldValue > val ) {
            for (let i = val; i < oldValue; i++) {
                deleteDish(id, true);
               // console.log('del');
            }
        }
        else if (oldValue < val) {
            for (let i = oldValue; i < val; i++) {
                PostDish(id);
                //sconsole.log('post');
            }
        }
        volume = volume - oldValue + val;
        console.log(oldValue, val, volume);
        $("#basketVolume").text(volume)
        $input.val(val);
        $input.attr('old-value', val);
    });

    $('#list').on('click', '.delete', function (e) {
        e.preventDefault(); // Предотвращаем действие кнопки по умолчанию
        let id = $(this).attr('id');
        console.log("Значение атрибута : " + id);
        deleteDish(id, false);
    });
});