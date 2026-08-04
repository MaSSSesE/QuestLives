const axios = require("axios");


axios.post("http://localhost:3001/set-quest", {

  username: "DemoPlayer",

  quest: {

    id: 1,

    title: "Read for 20 Minutes",

    points: 100,

    difficulty: "Easy"

  }

})

.then(response => {

  console.log(response.data);

})

.catch(error => {

  console.log(error.message);

});