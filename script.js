let penger = 10;
let kostnad = 5;
let varerPaLager = 0;
let button = document.querySelector(".lageKnapp");
let viserGjeldenePris = 5;
let priceInput = document.getElementById("prisInput");
let dobbeltjernOppgradering = false;
let antallVaflerPerRunde = 1;
let lagerCooldown = false;

let ansatte = 0;
let lonnPerAnsatt = 35;
let produksjonPerAnsatt = 0.25;
let produksjonsBuffer = 0;

let xp = 0;
let niva = 1;
let reputation = 50;
let totalSolgt = 0;
let sisteLonnAdvarsel = 0;

const maal = [
    { id: "selg20", tekst: "Selg 20 vafler", type: "sell", target: 20 },
    { id: "selg500", tekst: "Selg 500 vafler", type: "sell", target: 500 },
    { id: "kapital1000", tekst: "Ha 1000 NOK", type: "money", target: 1000 },
    { id: "ansett1", tekst: "Ansett 1 ansatt", type: "staff", target: 1 },
    { id: "nivå5", tekst: "Nå nivå 5", type: "level", target: 5 }
];

const kundeTyper = [
    { navn: "Student", priceTolerance: 0.85, tipChance: 0.05, patience: 0.7 },
    { navn: "Familie", priceTolerance: 1.0, tipChance: 0.1, patience: 0.8 },
    { navn: "Turist", priceTolerance: 1.2, tipChance: 0.2, patience: 0.6 },
    { navn: "Gourmet", priceTolerance: 1.4, tipChance: 0.25, patience: 0.5 }
];

function lagVaffel() {
    lagerCooldown = true;
    button.disabled = true;
    setTimeout(function () {
        lagerCooldown = false;
        oppdaterUi();
    }, 2000);
    if (penger >= kostnad) {
        varerPaLager += antallVaflerPerRunde;
        document.getElementById("viserVarebeholdning").textContent = varerPaLager + " vafler på lager";
        penger -= kostnad * antallVaflerPerRunde;
        document.getElementById("viserAntallKroner").textContent = "Totalkapital: " + penger;
    } else {
        notify("Ikke nok penger til å lage vafler!", "negative");
    }
}
function normaliserPris(verdi) {
    const parsed = Number.parseInt(verdi, 10);
    if (Number.isNaN(parsed)) {
        return kostnad;
    }
    return Math.max(kostnad, parsed);
}

function oppdaterPris() {
    if (priceInput) {
        priceInput.value = viserGjeldenePris;
    }
}

function settPris(nyPris) {
    viserGjeldenePris = normaliserPris(nyPris);
    oppdaterPris();
}
document.getElementById("prisNedKnapp").addEventListener("click", function() {
    settPris(viserGjeldenePris - 1);
    oppdaterUi();
});
document.getElementById("prisOppKnapp").addEventListener("click", function() {
    settPris(viserGjeldenePris + 1);
    oppdaterUi();
});
if (priceInput) {
    priceInput.addEventListener("input", function() {
        settPris(priceInput.value);
        oppdaterUi();
    });
    priceInput.addEventListener("blur", function() {
        settPris(priceInput.value);
        oppdaterUi();
    });
}
document.addEventListener("DOMContentLoaded", function() {
    setInterval(function() {
        forsokSelgVaffel();
    }, 5000);

    setInterval(function() {
        produserOgLonn();
    }, 1000);

    oppdaterUi();
    oppdaterMal();
});
function forsokSelgVaffel() {
    if (varerPaLager <= 0) {
        notify("Lageret er tomt, du må lage vafler!", "negative");
        return;
    }

    const kunde = trekkKunde();
    const sjanse = kalkulerSalgsSjanse(kunde);
    oppdaterKundeUi(kunde, sjanse);

    if (Math.random() * 100 < sjanse) {
        penger += viserGjeldenePris;
        varerPaLager--;
        totalSolgt++;
        reputation = Math.min(100, reputation + 1);
        leggTilXp(Math.max(5, Math.round(viserGjeldenePris * 0.6)));

        let tips = 0;
        if (Math.random() < kunde.tipChance) {
            tips = Math.max(1, Math.round(viserGjeldenePris * 0.3));
            penger += tips;
        }

        notify(`Solgt til ${kunde.navn}! Tips: ${tips} NOK`, "positive");
    } else {
        reputation = Math.max(0, reputation - 1);
        notify(`Kunden (${kunde.navn}) syntes prisen var høy.`, "negative");
    }

    oppdaterUi();
    oppdaterMal();
}
function notify(melding, type) {
    let notifikasjonPanel = document.getElementById("notifi");
    notifikasjonPanel.textContent = melding;
    notifikasjonPanel.classList.remove("positiv", "negativ");
    if (type === "negative") {
        notifikasjonPanel.classList.add("negativ");
    } else if (type === "positive") {
        notifikasjonPanel.classList.add("positiv");
    }
}
function kjopOppgradering(oppgradering) {
    if (oppgradering === 'dobbeljern' && !dobbeltjernOppgradering) {
        if (niva < 3) {
            notify("Dobbeltjern låses opp på nivå 3.", "negative");
            return;
        }
        if (penger >= 500) {
            penger -= 500;
            dobbeltjernOppgradering = true;
            antallVaflerPerRunde = 2;
            document.getElementById("viserAntallKroner").textContent = "Totalkapital: " + penger;
            notify("Dobbeltjern aktivert! Nå lager du 2 vafler per runde.", "positive");
        } else {
            notify("Du har ikke nok penger til å kjøpe denne oppgraderingen.", "negative");
        }
    } else if (dobbeltjernOppgradering) {
        notify("Du har allerede oppgradert til dobbeltjern.", "negative");
    }
    oppdaterUi();
}
document.getElementById('hjelp').addEventListener('click', function() {
    alert("Velkommen til sjappa mi! Her lager vi vafler! Spillet går ut på å oppgradere, og tjene masse penger, men vær obs, fordi jo mer du selger for, jo lavere skjanse er det for å få solgt, så du må bare være tålmodig! Lykke til :3");
});

document.getElementById("ansettKnapp").addEventListener("click", function() {
    if (niva < 2) {
        notify("Ansatte låses opp på nivå 2.", "negative");
        return;
    }
    const pris = 1500;
    if (penger < pris) {
        notify("Du har ikke nok penger til å ansette.", "negative");
        return;
    }
    penger -= pris;
    ansatte++;
    notify("Du ansatte en medarbeider! Husk lønn.", "positive");
    oppdaterUi();
    oppdaterMal();
});

function xpForNesteNiva(level) {
    return 50 * level * level;
}

function leggTilXp(mengde) {
    xp += mengde;
    let krav = xpForNesteNiva(niva);
    while (xp >= krav) {
        xp -= krav;
        niva++;
        notify(`Nytt nivå! Du er nå nivå ${niva}.`, "positive");
        krav = xpForNesteNiva(niva);
    }
}

function trekkKunde() {
    const index = Math.floor(Math.random() * kundeTyper.length);
    return kundeTyper[index];
}

function kalkulerSalgsSjanse(kunde) {
    const base = 78 + (reputation - 50) * 0.5;
    const prisMargin = Math.max(0, viserGjeldenePris - kostnad);
    const prisStraff = prisMargin * 1.6;
    const toleranseBonus = (kunde.priceTolerance - 1) * 25;
    let sjanse = base - prisStraff + toleranseBonus;
    sjanse = Math.max(5, Math.min(95, sjanse));
    return sjanse;
}

function oppdaterKundeUi(kunde, sjanse) {
    const profil = document.getElementById("kundeProfil");
    const ettersporsel = document.getElementById("kundeEttersporsel");
    profil.textContent = `Kunde: ${kunde.navn}`;
    ettersporsel.textContent = `Etterspørsel: ${sjanse.toFixed(0)}% (rykte ${reputation})`;
}

function produserOgLonn() {
    if (ansatte > 0) {
        produksjonsBuffer += ansatte * produksjonPerAnsatt;
        const ferdige = Math.floor(produksjonsBuffer);
        if (ferdige > 0) {
            varerPaLager += ferdige;
            produksjonsBuffer -= ferdige;
        }

        const lonnPerSek = (ansatte * lonnPerAnsatt) / 60;
        if (penger >= lonnPerSek) {
            penger -= lonnPerSek;
        } else {
            penger = 0;
            const na = Date.now();
            if (na - sisteLonnAdvarsel > 10000) {
                reputation = Math.max(0, reputation - 3);
                notify("Du klarte ikke å betale lønn. Rykte synker!", "negative");
                sisteLonnAdvarsel = na;
            }
        }
    }
    oppdaterUi();
}

function oppdaterUi() {
    document.getElementById("viserAntallKroner").textContent = `Totalkapital: ${Math.floor(penger)}`;
    document.getElementById("viserPrisIngredienser").textContent = `Pris for ingredienser: ${kostnad} NOK pr/stk`;
    document.getElementById("viserVarebeholdning").textContent = `${varerPaLager} vafler på lager`;
    if (button) {
        button.disabled = lagerCooldown || penger < kostnad;
    }
    if (priceInput) {
        priceInput.value = viserGjeldenePris;
        priceInput.min = kostnad;
    }
    document.getElementById("viserNivaa").textContent = `Nivå: ${niva}`;
    document.getElementById("viserXp").textContent = `XP: ${Math.floor(xp)} / ${xpForNesteNiva(niva)}`;
    document.getElementById("viserAnsatte").textContent = `Ansatte: ${ansatte}`;
    document.getElementById("viserLonn").textContent = `Lønn per min: ${ansatte * lonnPerAnsatt} NOK`;
    document.getElementById("viserProduksjon").textContent = `Produksjon: ${(ansatte * produksjonPerAnsatt).toFixed(2)} vafler/s`;

    const ansettKnapp = document.getElementById("ansettKnapp");
    const ansettPris = 1500;
    ansettKnapp.disabled = niva < 2 || penger < ansettPris;

    const dobbelKnapp = document.getElementById("dobbeljernOppgradering");
    const dobbelPris = 500;
    dobbelKnapp.disabled = niva < 3 || dobbeltjernOppgradering || penger < dobbelPris;
}

function oppdaterMal() {
    const liste = document.getElementById("malListe");
    liste.innerHTML = "";
    maal.forEach((mal) => {
        let progress = 0;
        if (mal.type === "sell") {
            progress = totalSolgt;
        } else if (mal.type === "money") {
            progress = penger;
        } else if (mal.type === "staff") {
            progress = ansatte;
        } else if (mal.type === "level") {
            progress = niva;
        }

        const fullfort = progress >= mal.target;
        const li = document.createElement("li");
        const label = document.createElement("span");
        label.textContent = `${mal.tekst} (${Math.min(progress, mal.target)}/${mal.target})`;
        const badge = document.createElement("span");
        badge.className = `badge${fullfort ? " fullfort" : ""}`;
        badge.textContent = fullfort ? "Fullført" : "Pågår";
        li.appendChild(label);
        li.appendChild(badge);
        liste.appendChild(li);
    });
}