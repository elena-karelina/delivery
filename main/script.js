
$(document).ready(function () {

    const categoriesSelect = document.getElementById("categories");
    const sortingSelect = document.getElementById("sorting");
    const switchInput = document.getElementById("vegetarian");
    const pagination = document.getElementById("pagination");
    
    const urlGetDish = "https://food-delivery.kreosoft.ru/api/dish?";
    const urlPostDish = "https://food-delivery.kreosoft.ru/api/basket/dish/";
    let forms = [];



    let categories = [];
    let sorting = sortingSelect.value;
    let vegetarian = switchInput.checked;

    let count;
    let current = 1;
    let volume=0;


    let token = localStorage.getItem("token");
    console.log('Токен:', token);

    getOptionsAndMenu();
    
    async function isDishInBasket(id) {
        let list = await getBasket();
        let matchingPair = list.find(pair => pair[0] === id);
        return matchingPair;
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
                    window.location.href = "authorization/index.html"
                }
            }
            else {
                let volumeCopy=0
                let data = await response.json();
                console.log(data);

                let list = [];
                data.forEach(item => {
                    let id = item.id;
                    let amount = item.amount;
                    volumeCopy+=amount;
                    list.push([id, amount]);
                });
                volume=volumeCopy;
                return list;
            }

        } catch (error) {
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
                        alert("Авторизируйтесь чтобы добавить товар в корзину");
                        window.location.href = "authorization/index.html"

                    }
                    else{
                    alert("Ошибка: " + response.status);                        
                    }

                }

            })
        }
        catch (error) {
            console.log(error);
            alert(error);
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
                }
                else {
                    if (response.status == 401) {
                        localStorage.removeItem('token');
                        window.location.href = "authorization/index.html"

                    }
                    alert("Ошибка: " + response.status);
                }
            })
        }
        catch (error) {
            console.log(error);

        }

    };


    function makePagination() {

        const liElements = pagination.getElementsByTagName('li'); // Находим все дочерние <li>

        while (liElements.length > 0) {
            pagination.removeChild(liElements[0]);
        }

        for (let i = 0; i < count; i++) {
            let li = document.createElement('li');
            li.classList.add('page-item');
            if (i == current - 1) {
                li.classList.add('active');
                pagination.appendChild(li);
                let span = document.createElement('span');
                span.classList.add('page-link');
                li.appendChild(span);
                span.textContent = i + 1;
            }
            else {
                pagination.appendChild(li);
                let a = document.createElement('a');
                a.classList.add('page-link');
                li.appendChild(a);
                a.textContent = i + 1;
            };

        }
        const linkElements = document.querySelectorAll('.page-item a'); // Получаем все элементы 'a'

        for (let i = 0; i < linkElements.length; i++) {
            linkElements[i].addEventListener('click', function (event) {
                event.preventDefault(); // Отменяем действие по умолчанию (переход по ссылке)

                current = this.textContent; // Получаем значение элемента 'a'
                console.log('Нажата ссылка с значением:', current);
                getMenu();
            });
        }

    };



    async function makeCard(id, src, isVegetarian, name, type, rating, description, cost) {
        let inBasket = false;
        if (localStorage.getItem("token")) {
            inBasket = await isDishInBasket(id);
        }
    
        const cardHtml = await new Promise((resolve, reject) => {
            $.get('main/card.html', function (card) {
                resolve(card);
            }).fail(function () {
                reject("Ошибка при загрузке card.html");
            });
        });
    
        const parser = new DOMParser();
    const cardDocument = parser.parseFromString(cardHtml, 'text/html');
    const cardElement = cardDocument.body.firstChild;

    cardElement.setAttribute("id", id);
    cardElement.querySelector(".foto").setAttribute("src", src);
    cardElement.querySelector("h5").textContent = name;
    cardElement.querySelector(".category").textContent = type;
    cardElement.querySelector(".card-text").textContent = description;
    cardElement.querySelector(".price").textContent = cost;
    cardElement.querySelector("button").setAttribute("form", id)

    if (isVegetarian == true) {
        const veg = cardElement.querySelector(".veg");
        veg.classList.remove('d-none');
    }

    const ratingActive = cardElement.querySelector(".rating\\-active");
    const ratingActiveWidth = rating * 10;
    ratingActive.style.width = `${ratingActiveWidth}%`;

    if (inBasket) {
        const button = cardElement.querySelector("button");
        button.classList.add("d-none");

        const number = cardElement.querySelector(".number");
        number.classList.remove("d-none");

        const input = cardElement.querySelector("input");
        input.value = inBasket[1];
        input.setAttribute("old-value", inBasket[1]);
    }

    return cardElement;
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
        let $form = $input.closest('form'); // Находим ближайшую форму
        let formId = $form.attr('id');
        let $row = $input.closest('.number');
        let step = $row.data('step');
        let min = parseInt($row.data('min'));
        let max = parseInt($row.data('max'));
        let val = parseFloat($input.val());
        let oldValue = $input.attr('old-value');
        let isDelete = false;


        if (isNaN(val)) {
            val = step;
        } else if (min && val < min) {
            $row.addClass('d-none');
            let $button = $form.find('.toBasket');
            $button.removeClass('d-none');
            deleteDish(formId, false);
            isDelete = true;
            volume -= 1;
            val = min;
        } else if (max && val > max) {
            val = max;
        }
        console.log(oldValue, val);
        if (oldValue > val && !isDelete) {
            for (let i = val; i < oldValue; i++) {
                deleteDish(formId, true);

            }
        }
        else if (oldValue < val) {
            for (let i = oldValue; i < val; i++) {
                PostDish(formId);
            }
        }
        volume = volume - oldValue + val;
        $('#basketVolume').text(volume);
        $input.val(val);
        $input.attr('old-value', val); // Обновляем сохраненное значение
    });

    async function getMenu(number) {
        try {
            if (number!=null) current=number;
            let url = urlGetDish;
            for (let category of categories) {
                url = url + "categories=" + category + "&";
            }
            url = url + "vegetarian=" + vegetarian + "&sorting=" + sorting + "&page=" + current;
            console.log(url);
            const menuDiv = document.querySelector('#menu');
            menuDiv.replaceChildren();
            const response = await fetch(url);
            const data = await response.json();
            console.log(data);
            console.log(data.dishes.length);
            const dataPage = data.pagination;
            count = dataPage.count;
            current = dataPage.current;
            for (let i = 0; i < data.dishes.length; i++) {
                const dataDishes = data.dishes[i];
                menuDiv.appendChild(await makeCard(dataDishes.id, dataDishes.image, dataDishes.vegetarian, dataDishes.name, dataDishes.category, dataDishes.rating, dataDishes.description, dataDishes.price));
            }
            makePagination();
            forms = document.getElementById("menu").getElementsByTagName('form');
            for (let i = 0; i < forms.length; i++) {
                forms[i].addEventListener('click', function (event) {
                    if (event.target.tagName === 'BUTTON' || event.target.closest('.number')) {
                        return; // Игнорировать нажатие на кнопку или <div>
                    }
                    localStorage.setItem('idDish', forms[i].id);
                    window.location.href = "item/index.html"
                    console.log('Нажата форма с id:', forms[i].id);
                });
            }

        } catch (error) {
            console.log(error);
        }
    };

    document.getElementById('types').querySelector('button').addEventListener('click', function () {
        event.preventDefault();
        console.log("click");
        getOptionsAndMenu();
    });

    function getOptionsAndMenu()
    {
        categories = Array.from(categoriesSelect.selectedOptions).map(option => option.value);
        sorting = sortingSelect.value;
        vegetarian = switchInput.checked;
        getMenu(1);
    };

    $(menu).on('click', '.toBasket', function (e) {
        e.preventDefault(); // Предотвращаем действие кнопки по умолчанию
        let formId = this.getAttribute('form');

        console.log("Значение атрибута 'form': " + formId);
        $('#' + formId + ' .number').removeClass('d-none');
        $(this).addClass('d-none');
        volume += 1;
        $('#basketVolume').text(volume);
        PostDish(formId);
    });



    // document.getElementById('categories').addEventListener('change', function () {
    //     categories = Array.from(categoriesSelect.selectedOptions).map(option => option.value);
    //     console.log(categories);

    // });
    // document.getElementById('sorting').addEventListener('change', function () {
    //     sorting = sortingSelect.value;
    //     console.log(sorting);
    // });
    // document.getElementById('vegetarian').addEventListener('change', function () {
    //     vegetarian = switchInput.checked;
    //     console.log(vegetarian);
    // });





});
