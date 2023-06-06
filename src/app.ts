import "./_colors.scss";
import "./style.scss";

const submitBtn = document.getElementById("submit")! as HTMLButtonElement;
const cityName = document.getElementById("city")! as HTMLInputElement;
const temp = document.querySelector(".temperature__amount")!;
const weather = document.querySelector(
	".weather__type"
)! as HTMLParagraphElement;
const hum = document.querySelector(
	".humidity__amount"
)! as HTMLParagraphElement;
const cityInfo = document.querySelector(".city-name")! as HTMLParagraphElement;

const GOOGLE_API_KEY = "AIzaSyDxcEROAMoFjBAxHhIVnZK0EYD3Y5kQezU";
const WEATHER_API_KEY = "064174e0c700b5fe430823f4599ad01f";

type GoogleGeocodingResponse = {
	results: {
		geometry: { location: { lat: number; lng: number } };
		address_components: { 0: { long_name: string } };
	}[];
};

type WeatherApiResponse = {
	main: { temp: number; humidity: number };
	weather: { 0: { main: string } };
};

async function getCords(e?: Event) {
	if (e) {
		e.preventDefault();
	}
	try {
		const address: string = cityName.value || "Krakow";
		const cords = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(
				address
			)}&key=${GOOGLE_API_KEY}`
		);
		const data = await cords.json();
		console.log(data);
		if (data.status == "ZERO_RESULTS") {
			alert(`Can't find this city, try again`);
		} else {
			return handleChanges(data);
		}
	} catch {
		alert(`Internal server error, try again later`);
	}
}

async function getWeather(cords: { lat: number; lng: number }) {
	try {
		const data = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${cords.lat}&lon=${cords.lng}&appid=${WEATHER_API_KEY}&units=metric`
		);
		const weatherInfo = await data.json();
		return setWeather(weatherInfo);
	} catch {
		console.log("exddd");
	}
}

const handleChanges = (data: GoogleGeocodingResponse) => {
    cityInfo.textContent = data.results[0].address_components[0].long_name
	renderMap(data.results[0].geometry.location);
	getWeather(data.results[0].geometry.location);
	cityName.value = '';
};

const setWeather = (weatherInfo: WeatherApiResponse) => {
	temp.textContent = (weatherInfo.main.temp.toFixed(1)).toString() + ' °C';
	hum.textContent = weatherInfo.main.humidity.toString() + ' %';
	weather.textContent = weatherInfo.weather[0].main;
};

const renderMap = (cords: { lat: number; lng: number }) => {
	console.log(cords);

	const map = new google.maps.Map(document.getElementById('map')!, {
        center: cords,
        zoom: 8
    })
	new google.maps.Marker({position: cords, map: map})
};

getCords();
submitBtn.addEventListener("click", getCords);
