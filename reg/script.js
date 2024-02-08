
$(document).ready(function () {
  $('.select2').select2();

  const InputSubject = document.getElementById('InputSubject');
  const divAddress = document.getElementById('address');

  let token;
  let level = 0;
  let objectGuid='';

  const urlSearchAddress = 'https://food-delivery.kreosoft.ru/api/address/search?parentObjectId=';

  $('#InputPhone').inputmask('+7 (999) 999-99-99', { "placeholder": "х" });

  function makeSelect() {
    level += 1;
    const divElement = document.createElement('div');
    divElement.classList.add('form-group', 'mt-3');
    divElement.id = `divLevel-${level}`;


    // Создание элемента label
    const labelElement = document.createElement('label');
    labelElement.setAttribute('for', divElement.id);
    labelElement.textContent = 'Следующий элемент';

    // Создание элемента select
    const selectElement = document.createElement('select');
    selectElement.classList.add('select2', 'form-control');
    selectElement.id = `level-${level}`;//zapro


    // Создание элемента option
    const optionElement = document.createElement('option');
    optionElement.value = '0';

    // Добавление option в select
    selectElement.appendChild(optionElement);

    // Добавление label и select в div
    divElement.appendChild(labelElement);
    divElement.appendChild(selectElement);
    $(selectElement).select2();

    return divElement;
  }
  

  function handleInputChange( select, div, line) {

    $(`#level-${line}`).on('select2:open', function () {
      let inputValue = $(this).data('select2').$dropdown.find('.select2-search__field');
      let parentValue = $('#level-' + (line - 1)).val();
      inputValue.off('input').on('input', function () {


          console.log('Введенные данные улицы:', $(this).val(), parentValue);
          getAddress(parentValue, $(`#level-${line}`).get(0), $(this).val())
      });
  });


    $(`#level-${line}`).change(function () {
      let optionData = JSON.parse(select.options[select.selectedIndex].getAttribute("data-value"));
      console.log(div.id);
      const divsToRemove = divAddress.querySelectorAll('div');
  
      divsToRemove.forEach(divElement => {
        const divId = divElement.id;
        const idNumber = parseInt(divId.match(/\d+/)[0]); // Извлекаем число из id
        const currentLevel = parseInt(div.id.match(/\d+/)[0]);
        if (idNumber > currentLevel) {
          divAddress.removeChild(divElement);
          level = currentLevel;
        }
      })
  
      if (select.value != 0) {
        const optionToRemove = select.querySelector("option[value='0']");
        if (optionToRemove) {
          optionToRemove.remove();
        }
        console.log(1, optionData.objectLevelText);
  
        div.querySelector('label').textContent = optionData.objectLevelText;
        div.querySelector('label').setAttribute("for", optionData.objectLevelText);
      }
      if (optionData.objectLevel != "Building") {
        objectGuid='';
        inputAddress(optionData.objectId);
      }
      else {
        objectGuid = optionData.objectGuid;
      }
    });

    
  }
  
  function inputAddress(InputValue) {
    let div = makeSelect();
    let select = div.querySelector('select');
    console.log(select.id);
  
    divAddress.appendChild(div);
    getAddress(InputValue, select);
    handleInputChange(select, div, level);
   
  }
  


  $("#InputSubject").change(function () {
    let InputSubjectValue = InputSubject.value; 
    console.log("Выбранное значение: " + InputSubjectValue);
    if (InputSubject.value != 0) {
      InputSubject.querySelector('option').remove();

      inputAddress(InputSubjectValue);
    }

  });

  async function getAddress(parentObjectId, select, name) {
    try {
      let url =urlSearchAddress + parentObjectId;
      if (name){
        url=url+"&query="+name;
        console.log(url);
        while (select.options.length > 0) {
          select.remove(0);
        }
      }
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        const option = document.createElement("option");
        option.value = data[i].objectId;
        option.text = data[i].text;
        option.setAttribute("data-value", JSON.stringify(data[i]));
        select.appendChild(option);

      }
    } catch (error) {
      console.log(error);
    }
  };

 

  $('form').submit(function (event) {
    event.preventDefault(); // Отменяем стандартное поведение отправки формы
    let regex = /\d/; // Регулярное выражение для поиска цифры

    if (!regex.test($('#InputPassword').val())) {
      alert("в пароле должна быть хотя бы одна цифра")
    }
    else if (objectGuid == "") {
      alert("Введите полный адрес")
    }
    else {
      // Получаем значения полей ввода
      let name = $('#InputName').val();
      let password = $('#InputPassword').val();
      let email = $('#InputEmail').val();
      let gender = $('#SelectGender').val();
      let phone = $('#InputPhone').val();
      let birthDate = $('#DateOfBirth').val();
      let object = objectGuid;

      // Создаем объект с данными для отправки
      let data = {
        fullName: name,
        password: password,
        email: email,
        addressId: object,
        birthDate: birthDate,
        gender: gender,
        phoneNumber: phone,
      };

      // Отправляем POST-запрос
      fetch('https://food-delivery.kreosoft.ru/api/account/register', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => {
          if (!response.ok) {
            if (response.status === 400) {
              alert("Этот email уже занят" + error.message);
              throw new Error('Ошибка: некорректный запрос');
            } else {
              alert("Что-то пошло не так. Проверьте введенные данные." + error.message);
              throw new Error('Ошибка ' + response.status);
            }
          }
          return response.json();
        })
        .then(data => {
          console.log('Успешно отправлено!', data);
          token = data.token; // Получаем токен из ответа сервера
          console.log(token);
          localStorage.setItem('token', token); // Сохраняем токен в localStorage
          window.location.href = "../index.html"
        })
        .catch(error => {
          console.error('Произошла ошибка:', error, data);
        });

    }


  });

});



