const kelimeler = {
    '-': "rakam doğru ama yanlış yerde",
    '+': "rakam doğru ve doğru yerde",
    '': "hiç bir şey doğru değil"
};
const zorlukDereceleri = {
    1:{
        text: "kolay",
        basamakSayisi: 3,
        ipucuSayisi:2
    },
    2:{
        text: "normal",
        basamakSayisi: 4,
        ipucuSayisi:2
    },
    3:{
        text: "zor",
        basamakSayisi: 5,
        ipucuSayisi:2
    },
    4:{
        text: "expert",
        basamakSayisi: 6,
        ipucuSayisi:2
    }
}

let range = document.getElementById("range");
range.addEventListener("change",(e)=>{
    zorlukDerecesi = zorlukDereceleri[range.value+""];
    document.getElementById("zorlukDerecesiLabel").innerHTML = zorlukDerecesi.text;
})

let okayBtn = document.getElementById("okayBtn");         
let resultInput = document.getElementById("resultInput");
let kontrolButonu = document.getElementById("kontrolButonu");
let ipucuButonu = document.getElementById("ipucu");
kontrolButonu.addEventListener('mousedown', resultCheck);
ipucuButonu.addEventListener('mousedown', ipucuIstegi);
document.addEventListener('keydown', (e)=>{
    if(e.code == 'KeyR') {
        createToast("success","Cevap : "+number);
    }
});

let zorlukDerecesi = zorlukDereceleri['1'];
console.log(zorlukDerecesi);
const ipucuE = 5;
const minNumber = Math.pow(10, zorlukDerecesi.basamakSayisi-1);
const maxNumber = Math.pow(10, zorlukDerecesi.basamakSayisi)-1;
let {number, digits} = generateDifferentDigitNumber(minNumber, maxNumber);

let ipucuNumaralari = [];

// basamakların ipucularının durumunu tutar.
let ipucuDurumu = [];

let done
do {
    done = false;
    for(let i=0;i<ipucuE;i++) {
        ipucuNumaralari[i] = ipucuOlusturma();
    }
    let basamakE = {};
    digits.forEach(d=>{
        basamakE[d] = 0;
        ipucuNumaralari.forEach(hn=>{
            if(hn.digits.includes(d)) {
                basamakE[d] = (basamakE[d]||0) + 1;
            }
        });
    });

    done = digits.filter(d=>basamakE[d]==0).length==0;
} while(!done);

ipucuNumaralari.forEach(hn => {
    let kelime = [];
    if(hn.sign =="") {
        kelime.push(kelimeler['']);
    } else {
        let count = {};
        hn.sign.split("").forEach(i => {
            count[i] = (count[i]||0) + 1;
        });
        for (const dg in count) {
            if (count[dg]) {
                kelime.push(count[dg] + ' ' + kelimeler[dg]);
            }
        }
    }            
    document.getElementById("ipucular").innerHTML += '<div class="alert alert-warning" role="alert">'+hn.number+" &nbsp;&nbsp;&nbsp;"+kelime.join(' , ')+'</div>';
});

for(let i=0;i<zorlukDerecesi.basamakSayisi;i++) {
    ipucuDurumu[i] = {text: i, status: false};
    createDigitHTML(i);
    updateDigitHTML(i, '?', false);
}

//console.log(ipucuDurumu);

function ipucuOlusturma() {
    let bulmak = false;
    let generatedNumObj;
    let signes;
    do {
        //console.log("working");
        generatedNumObj = generateDifferentDigitNumber(minNumber, maxNumber);
        if(generatedNumObj.number == number) { // filtering the result - number
            continue;
        }
        signes = "";
        
        for(let j=0;j<generatedNumObj.digits.length;j++) {
            if(generatedNumObj.digits[j] == digits[j]) {
                signes += "+";
            } else if(digits.includes(generatedNumObj.digits[j])) {
                signes +="-";
            }
        }

        let digitFilter = digits.filter(ns=>generatedNumObj.digits.includes(ns));
        if(digitFilter.length == 0) {
            continue;
        }
        
        bulmak = true;
    } while(!bulmak);

    return {sign: signes, number: generatedNumObj.number, digits: generatedNumObj.digits};
}

function createToast(type, text) {
    let toastHtml = 
    htmlToElement(
        '<div class="toast d-flex align-items-center text-white bg-'+type+' border-0" role="alert" aria-live="assertive" aria-atomic="true">'+
            '<div class="toast-body">'+
                text+
            '</div>'+
            '<button type="button" class="btn-close btn-close-white ms-auto me-2" data-bs-dismiss="toast" aria-label="Close"></button>'+
        '</div>'
    );

    document.getElementById("notification-area").appendChild(toastHtml);

    let toast = new bootstrap.Toast(toastHtml);
    toastHtml.addEventListener('hidden.bs.toast', function (e) {
        e.target.parentNode.removeChild(e.target);
    });
    toast.show();
}

//console.log(number);

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function createDigitHTML(num) {
    let html  = 
    '<div class="card digitareaText p-2 bd-highlight" style="min-width: 60px; height: 60px; margin:20px">'+
        '<div class="card-body">'+
          '<h5 id="digit-'+num+'" class="card-text"></h5>'+
        '</div>'+
    '</div>';

    document.getElementById("basamakTahminAlani").appendChild(htmlToElement(html));// += html;
}

function updateDigitHTML(num, text, isOpen) {
    let d = document.getElementById("digit-"+num);
    d.innerHTML = "";                
    let parent = d.parentElement.parentElement;
    parent.classList.remove(!isOpen ? "digit-open" : "digit-close");
    parent.classList.add(!isOpen ? "digit-close" : "digit-open");
    d.appendChild(htmlToElement(text));
}

function generateDifferentDigitNumber(min, max) {
    let r, rd;
    do {
        r = random(min, max);
        rd = (r+"").split("");
    } while(!isDigitsDifferent(rd));
    return {number: r, digits: rd};
}

function isDigitsDifferent(arr) {
    return arr.length === new Set(arr).size
}

function ipucuIstegi() {
    let filtered = getFilterHintState();
    if(filtered.length > 0 && ipucuDurumu.length - zorlukDerecesi.ipucuSayisi < filtered.length) {
        let r;
        do {
            r = random(0, ipucuDurumu.length-1);
        } while(ipucuDurumu[r].status===true);

        ipucuDurumu[r].text = digits[r];
        ipucuDurumu[r].status = true;
        updateDigitHTML(r, digits[r], true);
    }

    if(ipucuDurumu.length - zorlukDerecesi.ipucuSayisi >= getFilterHintState().length) {
        ipucuButonu.setAttribute("disabled", "disabled");
    }
}

function getFilterHintState() {
    return ipucuDurumu.filter(hs => hs.status === false);
}

function resultCheck() {
    let result = resultInput.value;
    console.log();
    if(result>maxNumber || result<minNumber) {
        createToast("danger","Lütfen "+minNumber+" - "+maxNumber+" arası sayı giriniz!");
        alert("Lütfen "+minNumber+" - "+maxNumber+" arası sayı giriniz!");   
    } else {
        let condition = result == number;
        //alert(condition);
        if(condition===true) {
            playConfetti();
        }else{
            createToast("danger","Yanlış Cevap");
        }
    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max-min+1)) + min); 
}

function playConfetti() {
    var end = Date.now() + (3 * 1000);
    var colors = ['#bb0000', '#ffffff'];

    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
        });
        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

function playConfetti_() {
    var count = 200;
    var defaults = {
    origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
    confetti(Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio)
    }));
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}