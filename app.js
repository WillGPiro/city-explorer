//application dependencies

require('dotenv').config()
const express = require('express');
const app = express();
const data = require('./geo.json');
//cors is an example of middle ware. Which adds something to the ovbject everytime it's requested. 
const cors = require('cors');
const weather = require('./darksky.json')
const request = require('superagent')

//cors is our middleware and we use it with app.use
app.use(cors());

// initialize global state of lat and lng so we can access it in other routes. 

let lat;
let lng;

//constlatLonData = require('')

//app.get takes query params. If it has a ? it is a query param. 

app.get('/location', async(req, res, next) => {

    try {
    //data.results[0] is the shape of the data. In geo.json the data is in results and is the 0 index
    const location = req.query.search;

    const URL = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${location}&format=json`;


    const cityData = await request.get(URL);

    //The data we are looking for will often live on the .body of the API object
    const firstResult = cityData.body[0];

    lat = firstResult.lat;
    lng = firstResult.lon;

    res.json({
        formatted_query: firstResult.display_name,
        latitude: lat,
        longitude: lng,

    });
} catch (err) {
    next(err);
}
});

const getWeatherData = async(lat, lng) => {

    const weather = await request.get(`https://api.darksky.net/forecast/${process.env.WEATHER_KEY}/${lat},${lng}`);
    
    return weather.body.daily.data.map(forecast => {
        return {

            forecast: forecast.summary,
            time: new Date(forecast.time * 1000)
        };
    });
};

app.get('/weather', async(rec, res, next) => {
//us the lat and lng from first query to get weather data for our area.
try {
    const portlandWeather = await getWeatherData(lat, lng);

    res.json(portlandWeather);
} catch (err) {
    next(err);
}
});

app.get('/yelp', async(req, res, next) => {
    
    try {
        const yelpInfo = await request
            .get(`https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${lat}&longitude=${lng}`)
            .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`);

            const mungedData = yelpInfo.body.businesses.map(business => {
                return {
        
                    name: business.name,
                    image_url: business.image_url,
                    price: business.price,
                    rating: business.rating,
                    url: business.url,
                }});       

    res.json(mungedData);

    }
     catch (err) {
        next(err);
    }
});

app.get('/eventful', async(req, res, next) =>{
    try{
        const eventfulInfo = await request.get(`http://api.eventful.com/json/events/search?app_key=${process.env.EVENTFUL_API_KEY}&where=${lat},${lng}&within=25&page_size=20&page_number=1`);

        const mungedEventData = eventfulInfo.text.map(event => {
            return {
    
                url: event.url,
                title: event.title,
                date: event.start_time,
                summary: event.description

            }}); 
//converts mungedYelpData from our API call to a string for use in our URL
    res.json(mungedEventData);

}
catch (err) {
   next(err);
}
});




const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}!`));

