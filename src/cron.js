import https from "https";
import cron from "cron";

const URL = "https://vdotube.onrender.com/api/v1/healthcheck";

const job = new cron.CronJob('*/10 * * * *', function(){
    https.get(URL, (res) => {
        if(res.statusCode === 200){
            console.log("Server is healthy.");
        }
        else{
            console.log("GET request failed", res.statusCode);
        }
    }).on('error', (e) => {
        console.log("Error while sending cron request", e);
    })
})

export default job;