$(document).ready(function () {
    let token = localStorage.getItem('token');
    console.log('token:', token);
    let objectGuid = '';
    let level = 0;
    const address = document.getElementById("address");
    let volume;
    let dishes;
    const dateTimeInput = document.getElementById('data-time');

    const orderButton = document.getElementById("order");
    const urlOrder = "https://food-delivery.kreosoft.ru/api/order";
    const urlAddress = 'https://food-delivery.kreosoft.ru/api/address/getaddresschain?objectGuid=';
    const urlSearchAddress = 'https://food-delivery.kreosoft.ru/api/address/search?parentObjectId=';

    $('#phone').inputmask('+7 (999) 999-99-99', { "placeholder": "х" });
    $('.select2').select2();


    orderButton.addEventListener("click", function () {
        event.preventDefault();
        if (dateTimeInput.value == '') {
            alert('Пожалуйста, выберите время доставки.');
        }
        if (objectGuid == '') {
            alert('Пожалуйста, введите полный адрес.');
        }
        createOrder();
    });

    GetData();
    getBasket();

    dateTimeInput.addEventListener('change', function () {
        const selectedDateTime = new Date(dateTimeInput.value);
        const serverTime = new Date();

        // Проверяем, что выбранное время больше текущего времени
        if (selectedDateTime <= serverTime) {
            alert('Время доставки должно быть больше текущего времени.');
            dateTimeInput.value = ''; // Очищаем поле
        }
    });



    async function GetData() {
        try {
            let response = await fetch('https://food-delivery.kreosoft.ru/api/account/profile', {
                headers: {
                    'accept': 'text/plain',
                    'Authorization': 'Bearer ' + token,
                }
            });
            if (response.ok) {
                let data = await response.json();

                console.log(data);
                $('#phone').val(data.phoneNumber);
                $('#email').val(data.email);
                $('#mail').text(data.email);
                objectGuid = await outputAddress(data.address);
            }
            else {
                alert("Ошибка: " + response.status);
            }

        } catch (error) {
            console.log(error);
        }
    };


    function outputlist(list) {
        for (let i = 0; i < list.length; i++) {
            $.get('item.html', function (item) {
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


    async function outputAddress(objectGuid) {
        try {
            const url = urlAddress + objectGuid;
            let response = await fetch(url, {
                headers: {
                    'accept': 'text/plain',
                }
            });
            let data = await response.json();

            console.log('адресс:', data);
            objectGuid = data[data.length - 1].objectGuid;
            console.log("адрес в профиле", objectGuid);

            for (let i = 0; i < data.length; i++) {
                if (i > 0) {
                    let div = await makeSelect(data[i], data[i - 1].objectId);
                    let select = div.querySelector('select');
                    console.log(select.id);
                    address.appendChild(div);
                    handleInputChange(select, div, level);

                }
                else {
                    address.appendChild(await makeSelect(data[i], false))
                }
            }
            console.log("адрес в профиле", objectGuid);
            return objectGuid;

        } catch (error) {
            console.log(error);
        }
    };

    function inputAddress(InputValue) {
        makeSelect().then(function (div) {
            let select = div.querySelector('select');
            console.log(select.id);

            address.appendChild(div);
            getAddress(InputValue, select);
            handleInputChange(select, div, level);
        }).catch(function (error) {
            console.error(error);
        });
    }

    async function makeSelect(data, parentId) {
        console.log(data);
        level += 1;

        const selectHtml = await new Promise((resolve, reject) => {
            $.get('select.html', function (select) {
                resolve(select);
            }).fail(function () {
                reject("Ошибка при загрузке select.html");
            });
        });

        const parser = new DOMParser();
        const selectDocument = parser.parseFromString(selectHtml, 'text/html');
        const divElement = selectDocument.body.firstChild;


        const labelElement = divElement.querySelector("label");
        const selectElement = divElement.querySelector("select");
        selectElement.setAttribute("id", "level-" + level);
        divElement.setAttribute("id", "divLevel-" + level);
        labelElement.setAttribute("for", "level-" + level);

        if (!data) {
            labelElement.textContent = 'Следующий элемент';
            const optionElement = document.createElement('option');
            optionElement.value = '0';
            selectElement.appendChild(optionElement);

        }
        else {
            labelElement.textContent = data.objectLevelText;
            if (!parentId) {
                const option = document.createElement('option');
                option.value = data.objectId;
                option.text = data.text;
                selectElement.appendChild(option);

            }
            else {
                const option = document.createElement('option');
                option.value = data.objectId;
                option.text = data.text;
                selectElement.appendChild(option);
                getAddress(parentId, selectElement, data.objectId);

            }

        }
        $(selectElement).select2();

        return divElement;
    }

    function handleInputChange(select, div, line) {
        $(`#level-${line}`).on('select2:open', function () {
            let inputValue = $(this).data('select2').$dropdown.find('.select2-search__field');
            let parentValue = $('#level-' + (line - 1)).val();
            inputValue.off('input').on('input', function () {


                console.log('Введенные данные улицы:', $(this).val(), parentValue);
                getAddress(parentValue, $(`#level-${line}`).get(0), null, $(this).val())
            });
        });

        $(`#level-${line}`).change(function () {
            let optionData = JSON.parse(select.options[select.selectedIndex].getAttribute("data-value"));
            console.log(div.id);
            const divsToRemove = address.querySelectorAll('div');

            divsToRemove.forEach(divElement => {
                const divId = divElement.id;
                const idNumber = parseInt(divId.match(/\d+/)[0]); // Извлекаем число из id
                const currentLevel = parseInt(div.id.match(/\d+/)[0]);
                if (idNumber > currentLevel) {
                    address.removeChild(divElement);
                    level = currentLevel;
                }
            })

            if (select.value != 0) {
                const optionToRemove = select.querySelector("option[value='0']");
                if (optionToRemove) {
                    optionToRemove.remove();
                }
                //console.log(1, optionData.objectLevelText);

                div.querySelector('label').textContent = optionData.objectLevelText;
            }
            if (optionData.objectLevel != "Building") {
                objectGuid = '';
                console.log("обнуление адреса")
                inputAddress(optionData.objectId);
            }
            else {
                objectGuid = optionData.objectGuid;

            }
            console.log(objectGuid);
        });
    }

    async function getAddress(parentObjectId, select, objectId, name) {
        try {
            let url = urlSearchAddress + parentObjectId;
            if (name) {
                url = url + "&query=" + name;
                console.log(url);
                while (select.options.length > 0) {
                    select.remove(0);
                }
            }
            const response = await fetch(url);
            const data = await response.json();
            console.log(data);
            console.log(objectGuid);
            for (let i = 0; i < data.length; i++) {
                if (objectId != data[i].objectId) {
                    const option = document.createElement("option");
                    option.value = data[i].objectId;
                    option.text = data[i].text;
                    option.setAttribute("data-value", JSON.stringify(data[i]));
                    select.appendChild(option);
                }
                else {
                    select.querySelector("option[value='" + objectId + "']").setAttribute("data-value", JSON.stringify(data[i]));
                }

            }
        } catch (error) {
            console.log(error);
        }
    };

    async function getBasket() {
        try {
            let response = await fetch('https://food-delivery.kreosoft.ru/api/basket', {
                headers: {
                    'accept': 'text/plain',
                    'Authorization': 'Bearer ' + token,
                }
            });
            if (!response.ok) {
                if (response.status == 401) {
                    localStorage.removeItem('token');
                    window.location.href = "../authorization/index.html"

                }
                else {
                    alert("Ошибка: " + response.status);
                }
            }

            else {
                volume = 0;
                allPrice = 0;
                let data = await response.json();
                console.log(data);
                data.forEach(item => {
                    volume += item.amount;
                    allPrice += item.totalPrice;
                });
                $('.all-price').text(allPrice);
                dishes = data;
                outputlist(data);
            }

        } catch (error) {
            console.log(error);
        }
    };

    function createOrder() {
        try {
            fetch(urlOrder, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    "deliveryTime": dateTimeInput.value,
                    "addressId": objectGuid
                })
            }).then(response => {
                if (response.ok) {
                    alert("Ваш заказ оформлен!");
                    window.location.href = "../index.html";
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
})