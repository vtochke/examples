const header = document.querySelector('header');
const form = document.querySelector('.form-search');
const footer = document.querySelector('footer');
const button = form.querySelector('button');
const inputs = form.querySelectorAll('input');

// Следит за изменнием формы
let verifyForm = new Proxy([],{
    set (target, prop, val) {
        Reflect.set(...arguments);
        button.disabled = !target.every(item => item);
        return true;
    }
});

// назначение обработчиков
[].forEach.call(inputs, (elem, i) => {
    verifyForm[i] = elem.value.length > 0;
    
    elem.addEventListener('keyup',e => {
        elem.value = elem.value.replace(/[^0-9]+/,'');
        if (elem.value.length) {
            if (parseInt(elem.value) < 1) elem.value = '';
            if (!verifyForm[i]) verifyForm[i] = 1;
        }
        else verifyForm[i] = 0;
    });
});

//const sentences = fishText.textContent.replace(/[\n\"]/g,' ').split(/(?<=[\.!\?])\s(?!Peters)/).map(e => e.trim()); // в фф не работает
const sentences = fishText.textContent.replace(/[\n\"]/g,' ').replace(/([\.!\?])\s(?!Peters)/g,'$1~').split('~').map(e => e.trim());
//console.log(sentences);

const createItem = (a,i) => {
    let block = document.createElement('div');
    let descr = document.createElement('p');
    block.className = 'item';
    block.insertAdjacentHTML('beforeend',`<span>${i+1}. ${a}</span>`);
    block.append(descr);
    blocks.append(block);
    return descr;
}

let _mapper = (a,i) => new Promise(resolve => {
    let ms = Math.round(Math.random() * 9000) + 1000;
    let descr = createItem(a,i);
    log.count++;
    setTimeout(() => {
        resolve({
            descr: descr,
            index: i,
            ms: ms
        })
    }, ms);
}).then(obj => {
    let delta = obj.index - (obj.index >= sentences.length ? sentences.length*(Math.floor(obj.index/sentences.length)) : 0);
    obj.descr.append(sentences[delta]);
    progress.span.textContent = parseInt(progress.span.textContent)+1;
    
    console.log(`Размер стека ${log.count}. Время работы ${((performance.now()-log.time)/1000).toFixed(2)} c`);
    log.count--;
    return obj.index;
});

function queue (ar = [], callback, limit = 10) {
    let i = 0;
    let count = -limit;
    let promises = [];
    let p;
    return new Promise(resolve => {
        let recurs = (o) => {
            if (ar[i]) {
                p = callback(ar[i],i);
                promises.push(p);
                p.then(recurs);
                i++;
            }
            count++;
            if (count == i) {
                blockedForm(false);
                resolve(promises);
            }
        }
        while (i < limit) {
            recurs(i);
        }
    });
}

function blockedForm(state = true){
    [].forEach.call(inputs, elem => elem.disabled = state);
    button.disabled = state;
}

let log = {count: 0,time: 0};

form.addEventListener('submit',e => {
    e.preventDefault();
    blocks.innerHTML = '';
    footer.classList.remove('no-content');
    let ar = [];
    for (let i=0;i < inputs[0].value; i++) {
        ar[i] = fishHead.textContent.substr(0,Math.round(Math.random()*190)+10);
    }

    if (parseInt(inputs[0].value) < parseInt(inputs[1].value)) inputs[1].value = inputs[0].value;
    
    blockedForm();
    progress.innerHTML = `Progress: <span>0</span> of ${inputs[0].value}`;
    progress.span = progress.querySelector('span');
    log.time = performance.now();
    let promises = queue(ar,_mapper,inputs[1].value);
    promises.then( r => console.log(r));
});

document.addEventListener('scroll',e => {
    if (window.pageYOffset > header.scrollHeight+2) {
        form.classList.add('scrolled');
    }
    else form.classList.remove('scrolled');
})