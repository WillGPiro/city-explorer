//application dependencies
const express = require('express');
const app = express();
const data = require('./geo.json');
const cors = require('cors');
const weather = require('./darksky.json')

// initialize global state of lat and lng so we can access it in other routes. 

let lat;
let lng;

//const latLonData = require('')


//app.get takes query params. If it has a ? it is a query param. 
app.get('/location', (request, respond) => {
    //data.results[0] is the shape of the data. In geo.json the data is in results and is the 0 index.
    const cityData = data.results[0];
    console.log(cityData.geometry);
    respond.json({

        formatted_query: cityData.formatted_address,
        latitude: cityData.geometry.location.lat,
        longitude: cityData.geometry.location.lng,

    });
});

const getWeatherData = (lat, lng) => {
    return weather.daily.data.map(forecast => {
        return {

            forecast: forecast.summary,
            time: new Date(forecast.time * 1000)
        };
    })
};

app.get('/weather', (request, respond) => {
//us the lat and lng from first query to get weather data for our area.
    const portlandWeather = getWeatherData(lat, lng);

    respond.json(portlandWeather);
});




// const getWeatherData = (lat,)



// app.get('/weather', (request, respond) => {
//     //use the lat and long  from earlier to get weather data for the selected area. 
//     const portlandWeather = getWeatherData(lat, lng)
//     return portlandWeather.daily.data.map(forecast => {
//         return {
//             forecast: forecast.summary,
//             time: new Date(forecast.time),
//         }
//     })
// })

//use heroku local



const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}!`));


