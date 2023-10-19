document.addEventListener("DOMContentLoaded", function () {
    // Fetch user data from the server
    fetch('/myprofile/data')
        .then(response => response.json())
        .then(data => {
            const nameElement = document.getElementById("namefield");
            const emailElement = document.getElementById("emailfield");
            const genderElement = document.getElementById("genderfield");
            const ageElement = document.getElementById("agefield");
            const hieghtElement = document.getElementById("heightfield");
            const wieghtElement = document.getElementById("weightfield");
            const activityElement = document.getElementById("activityfield");
            const allergiesElement = document.getElementById("allergiesfield");
            const healthgoalElement = document.getElementById("healthgoalfield");
            const dietaryPreferencesElement = document.getElementById("dietaryPreferencesfield");


            // Update the HTML elements with the user data
            nameElement.innerHTML = data.name;
            emailElement.innerHTML = data.email;
            genderElement.innerHTML = data.gender;
            ageElement.innerHTML = data.age;
            hieghtElement.innerHTML = data.height;
            wieghtElement.innerHTML = data.weight;
            activityElement.innerHTML = data.activity;
            allergiesElement.innerHTML = data.allergies;
            healthgoalElement.innerHTML = data.healthgoal;
            if(data.vegetarian){dietaryPreferencesElement.textContent += " Vegetarian"};
            if(data.vegan){dietaryPreferencesElement.textContent += " Vegan"};
            if(data.glutenFree){dietaryPreferencesElement.textContent += " Gluten Free"};

        })
        .catch(error => console.error(error));
});