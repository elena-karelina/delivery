$(document).ready(function () {
    const foto = document.getElementById('foto');
    const vegFoto = document.getElementById('vegFoto');
    const title = document.getElementById("card-title");
    const category = document.getElementById('category');
    const veg = document.getElementById('veg');
    const description = document.getElementById("description");
    const price = document.getElementById("price");
    const ratingActive = document.getElementById("ratingActive");

    const urlDish = "https://food-delivery.kreosoft.ru/api/dish/";
    let idDish = localStorage.getItem('idDish');
    let token = localStorage.getItem("token");


    console.log('Токен:', token);
    //;
    getInformation();

    if (token != null) {
        setRating().then(response => {
            const ratingButton = document.getElementById("rating-button");
            ratingButton.addEventListener("click", function () {
                event.preventDefault();
                let selectedInput = document.querySelector('input[name="rating"]:checked');
                let selectedValue = selectedInput.value;
                
                console.log(selectedValue);
                rating(selectedValue);
                ratingButton.disabled = true;
                
            });
        })
        .catch(error => {
            console.log(error);
        });

    }




    
    async function setRating() {
        try {
            let url = urlDish + idDish+'/rating/check';
            const response = await fetch(url, {
                headers: {
                    'accept': 'text/plain',
                    'Authorization': 'Bearer ' + token,
                }
            });
            if (!response.ok) {
                alert("Ошибка: " + response.status);
            }
            else {
                const data = await response.json();
                console.log(data);
                if (data){
                    $('#rating').removeClass('d-none');
                }
            }
            return response;

        } catch (error) {
            console.log(error);
        }
    };

    async function getInformation() {
        try {
            let url = urlDish + idDish;
            const response = await fetch(url);
            if (!response.ok) {
                alert("Ошибка: " + response.status);
            }
            else {
                const data = await response.json();
                console.log(data);
                foto.src = data.image;
                if (data.vegetarian) {
                    veg.textContent = "Вегетерианское";
                    vegFoto.classList.remove('d-none');
                }
                else {
                    veg.textContent = "Не вегетерианское";

                }
                title.textContent = data.name;
                category.textContent = data.category;
                description.textContent = data.description;
                price.textContent = data.price;
                ratingActive.style.width = `${data.rating * 10}%`;
            }

        } catch (error) {
            console.log(error);
        }
    };

    function rating(number) {
        try {
            const url = urlDish+idDish+'/rating?ratingScore='+number;
            fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            }).then(response => {
                if (response.ok) {
                    alert("Спасибо за оценку!");
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


});