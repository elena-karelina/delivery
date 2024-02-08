$(document).ready(function () {
 
    const body = document.querySelector("body");

    const currentPage = window.location.href;
    const currentPageArray = currentPage.split('/');
    const currentPageFileName = currentPageArray[currentPageArray.length - 1];
    
    let headerPath = '';
    
    if (currentPageFileName === 'index.html') {
      headerPath = '../commonParts/footer.html';
    } else {
      headerPath = 'commonParts/footer.html';
    }

    const footerPromise = new Promise((resolve, reject) => {
        $.get('commonParts/footer.html', function (footer) {
            resolve(footer);
        }).fail(function () {
            reject("Ошибка при загрузке footer.html");
        });
    });
    
    footerPromise.then(function (footer) {
        const parser = new DOMParser();
        const footerDocument = parser.parseFromString(footer, 'text/html');
        const footerContent = footerDocument.body.firstChild;
        body.appendChild(footerContent);
    }).catch(function (error) {
        console.log(error);
    })
});
