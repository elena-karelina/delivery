
$(document).ready(function () {
  let token = localStorage.getItem('token');
  console.log('token:',token);
  const basketVolume = document.getElementById("basketVolume");
  const address = document.getElementById("address");
  const saveButton = document.getElementById("save");
  const urlAddress = 'https://food-delivery.kreosoft.ru/api/address/getaddresschain?objectGuid=';
  const urlSearchAddress = 'https://food-delivery.kreosoft.ru/api/address/search?parentObjectId=';
  let level = 0;
  let objectGuid='';

  $('#InputPhone').inputmask('+7 (999) 999-99-99', { "placeholder": "х" });



  function dateFormat(date) {

    let dateTime = new Date(date);

    let year = dateTime.getFullYear();
    let month = ("0" + (dateTime.getMonth() + 1)).slice(-2); // Добавляем ведущий ноль к месяцу, если нужно
    let day = ("0" + dateTime.getDate()).slice(-2); // Добавляем ведущий ноль к дню, если нужно

    let formattedDate = year + "-" + month + "-" + day;
    return formattedDate;

  }

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
      $('#InputName').val(data.fullName);
      $('#DateOfBirth').val(dateFormat(data.birthDate));
      $('#InputPhone').val(data.phoneNumber);
      $('#SelectGender').val(data.gender);
      $('#email').text(data.email);
      objectGuid= await outputAddress(data.address);
      }
      else {
        alert("Ошибка: " + response.status);
      }
      
    } catch (error) {
      console.log(error);
    }
  };

  GetData();

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

  function handleInputChange( select, div, line) {

    $(`#level-${line}`).on('select2:open', function () {
      let inputValue = $(this).data('select2').$dropdown.find('.select2-search__field');
      let parentValue = $('#level-' + (line - 1)).val();  
      inputValue.off('input').on('input', function () {


        console.log('Введенные данные улицы:', $(this).val(), parentValue);
        getAddress(parentValue,  $(`#level-${line}`).get(0), null, $(this).val())
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
          console.log(idNumber+" delete");
          console.log("del "+idNumber+" изменен "+currentLevel);

        }
        
      });
      level = parseInt(div.id.match(/\d+/)[0]);

      console.log(level);
  
      if (select.value != 0) {
        const optionToRemove = select.querySelector("option[value='0']");
        if (optionToRemove) {
          optionToRemove.remove();
        }
        console.log(1, optionData.objectLevelText);
  
        div.querySelector('label').textContent = optionData.objectLevelText;
      }
      if (optionData.objectLevel != "Building") {
        objectGuid='';
        console.log("обнуление адреса")
        inputAddress(optionData.objectId);
      }
      else {
        objectGuid = optionData.objectGuid;
      }
      console.log(objectGuid);
    });
  }
  
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
        $.get('../makeOrder/select.html', function (select) {
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


  async function getAddress(parentObjectId, select, objectId, name) {
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
      console.log(objectGuid);
      for (let i = 0; i < data.length; i++) {
        if (objectId != data[i].objectId) {
          const option = document.createElement("option");
          option.value = data[i].objectId;
          option.text = data[i].text;
          option.setAttribute("data-value", JSON.stringify(data[i]));
          select.appendChild(option);
        }
        else{
          select.querySelector("option[value='" + objectId + "']").setAttribute("data-value", JSON.stringify(data[i]));
        }


      }
    } catch (error) {
      console.log(error);
    }
  };

  function PutData() {
    let data = {
      fullName:  $('#InputName').val(),
      addressId: objectGuid,
      birthDate: $('#DateOfBirth').val(),
      gender: $('#SelectGender').val(),
      phoneNumber: $('#InputPhone').val(),
    };
    console.log(JSON.stringify(data));
    try {
        const url = "https://food-delivery.kreosoft.ru/api/account/profile";
        fetch(url, {
            method: 'PUT',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                alert("Изменения сохранены");
            }
            else {
                if (response.status==401){
                    localStorage.removeItem('token');
                    window.location.href = "/authorization/index.html"
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

saveButton.addEventListener("click", function() {
  event.preventDefault();
  if (!objectGuid) {
    alert("Введите полный адрес", objectGuid)
  }
  else {
    PutData();
    
  }
  
});

})
