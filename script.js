let allCountries;
let countriesByCode = {};

function setup() {
    document.querySelector("#container").innerText = "Loading...";

    fetch("https://restcountries.eu/rest/v2/all")
        .then(resp => resp.json())
        .then(cs => {
            allCountries = cs;
            allCountries.forEach(country => countriesByCode[country.alpha3Code] = country);

            const searchBox = document.querySelector("#search-box");
            searchBox.addEventListener("keyup", () => renderAllCountries());

            const regionSelector = document.querySelector("#region-selector");
            regionSelector.appendChild(makeOption("Filter by Region", ""));

            const regionsSet = new Set();
            allCountries.map(country => country.region).filter(region => region).forEach(region => regionsSet.add(region));
            const regions = [...regionsSet];
            regions.sort();
            regions.forEach(region => regionSelector.appendChild(makeOption(region)));
            regionSelector.addEventListener("change", () => renderAllCountries());

            renderAllCountries();
        })
}

function renderAllCountries() {
    document.querySelectorAll(".country-list-specific").forEach(element => element.style.visibility = "visible");

    const container = document.querySelector("#container");
    container.innerText = "";

    const list = document.createElement("ul");
    list.id = "countries-list";
    list.className = "countries-list";
    container.appendChild(list);

    const searchTerm = document.querySelector("#search-box").value.toLowerCase();
    const searchFilter = country => !searchTerm || country.name.split(" ").some(word => word.toLowerCase().startsWith(searchTerm));

    const region = document.querySelector("#region-selector").value;
    const regionFilter = country => !region || country.region == region;
    allCountries
        .filter(regionFilter)
        .filter(searchFilter)
        .forEach((country, index, array) => {
            const li = document.createElement("li");
            li.className = "country";

            const flagContainer = document.createElement("div");
            flagContainer.className = "flag-container";
            const flag = document.createElement("img");
            flag.className = "flag";
            flag.src = country.flag;
            flagContainer.appendChild(makeCountryLink(country, flag));
            li.appendChild(flagContainer);

            const name = document.createElement("h2");
            name.innerText = country.name;
            li.appendChild(makeCountryLink(country, name));

            const infoBox = document.createElement("div");
            infoBox.className = "info-box";
            appendLabelledFact(infoBox, "Population", country.population.toLocaleString());
            appendLabelledFact(infoBox, "Region", country.region);
            appendLabelledFact(infoBox, "Capital", country.capital);
            li.appendChild(infoBox);

            list.appendChild(li);
        });
}

function appendLabelledFact(container, label, value) {
    const div = document.createElement("div");

    const labelSpan = document.createElement("span");
    labelSpan.className = "label";
    labelSpan.innerText = label + ": ";
    div.appendChild(labelSpan);

    const valueSpan = document.createElement("span");
    valueSpan.innerText = value;
    div.appendChild(valueSpan);

    container.appendChild(div);
}

function makeOption(text, explicitValue) {
    const option = document.createElement("option");
    option.innerText = text;
    if (explicitValue !== undefined) {
        option.value = explicitValue;
    }
    return option;
}

function makeCountryLink(country, element) {
    const link = document.createElement("a");
    link.appendChild(element);
    link.addEventListener("click", () => {
        history.pushState(country, "");
        renderOneCountry(country);
    });
    return link;
}

function renderOneCountry(country) {
    document.querySelectorAll(".country-list-specific").forEach(element => element.style.visibility = "hidden");

    const container = document.querySelector("#container");
    container.innerText = "";

    const countryNav = document.createElement("div");
    countryNav.className = "country-nav";
    const backButton = document.createElement("button");
    backButton.innerText = "←  Back";
    backButton.addEventListener("click", () => history.back());
    countryNav.appendChild(backButton);
    container.appendChild(countryNav);

    const div = document.createElement("div");
    div.className = "country-container";

    const flagContainer = document.createElement("div");
    flagContainer.className = "flag-container";
    const flag = document.createElement("img");
    flag.className = "flag";
    flag.src = country.flag;
    flagContainer.appendChild(flag);
    div.appendChild(flagContainer);

    const textContainer = document.createElement("div");
    textContainer.className = "text-container";
    div.appendChild(textContainer);

    const name = document.createElement("h2");
    name.innerText = country.name;
    textContainer.appendChild(name);

    const infoBox = document.createElement("div");
    infoBox.className = "info-box";
    appendLabelledFact(infoBox, "Native Name", country.nativeName);
    appendLabelledFact(infoBox, "Population", country.population.toLocaleString());
    if (country.region) {
        appendLabelledFact(infoBox, "Region", country.region);
    }
    if (country.subRegion) {
        appendLabelledFact(infoBox, "Sub Region", country.subRegion);
    }
    appendLabelledFact(infoBox, "Capital", country.capital);
    if (country.topLevelDomain.length === 1) {
        appendLabelledFact(infoBox, "Top Level Domain", country.topLevelDomain[0]);
    } else {
        appendLabelledFact(infoBox, "Top Level Domains", country.topLevelDomain.join(", "));
    }
    appendLabelledFact(infoBox, "Currencies", country.currencies.map(c => c.name).join(", "));
    appendLabelledFact(infoBox, "Languages", country.languages.map(c => c.name).join(", "));

    div.appendChild(infoBox);

    if (country.borders.length > 0) {
        console.log(country.borders);
        const borderCountriesBox = document.createElement("div");
        borderCountriesBox.className = "border-countries";
        const borderCountriesLabel = document.createElement("span");
        borderCountriesLabel.innerText = "Border Countries: ";
        borderCountriesLabel.className = "label";
        borderCountriesBox.appendChild(borderCountriesLabel);

        const borderCountriesButtons = document.createElement("div");
        borderCountriesButtons.className = "border-country-buttons";
        country.borders.forEach(border => {
            const borderCountry = countriesByCode[border];
            const button = document.createElement("button");
            button.innerText = borderCountry.name;
            borderCountriesButtons.appendChild(makeCountryLink(borderCountry, button));
        })
        borderCountriesBox.appendChild(borderCountriesButtons);
        div.appendChild(borderCountriesBox);
    }

    container.appendChild(div);
}

document.onload = setup();
window.addEventListener("popstate", event => {
    if (event.state === null) {
        renderAllCountries();
    } else {
        renderOneCountry(event.state);
    }
});