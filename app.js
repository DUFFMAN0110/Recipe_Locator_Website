const API_URL = "https://recipeapi.io/api/v1/recipes"

const API_KEY = "INPUT_KEY_HERE"

/* HTML ElEMENTS */

    /* Search form containing the input and Search button. */
    const searchForm = document.getElementById("search-form");

    /* Input where the user enters a recipe name or ingredient. */
    const searchInput = document.getElementById("search-input");

    /* Area used to display loading messages, errors, and other search information.*/
    const searchStatus = document.getElementById("search-status");

    /* Container where recipe cards will be displayed. */
    const recipeResults = document.getElementById("recipe-results");

    /* Section containing the full recipe information. */
    const recipeDetails = document.getElementById("recipe-details");

    /* Container where the selected recipe information will be inserted. */
    const detailsContent = document.getElementById("details-content");

    /* Button used to close the recipe details section. */
    const closeDetailsButton = document.getElementById("close-details");


/* EVENTS */

/* =========================================================
   3. SEARCH FORM EVENT
   ========================================================= */

/*
   Listen for the user submitting the search form.

   This happens when the user:
   - Clicks the Search button
   - Presses Enter inside the search field
*/
searchForm.addEventListener("submit", function (event) {

    /*
       Prevent the browser from reloading the page
       when the form is submitted.
    */
    event.preventDefault();


    /*
       Get the user's search term and remove unnecessary
       spaces from the beginning and end.
    */
    const searchTerm = searchInput.value.trim();


    /*
       Do not make an API request if the user submitted
       an empty search.
    */
    if (searchTerm === "") {

        searchStatus.textContent =
            "Please enter a recipe name or ingredient.";

        searchInput.focus();

        return;
    }


    /*
       Search for recipes using the user's input.
    */
    searchRecipes(searchTerm);

});


/* =========================================================
   4. SEARCH FOR RECIPES
   ========================================================= */

/*
   Asynchronously searches the Recipe API.
*/
async function searchRecipes(searchTerm) {

    /*
       Display a loading message while the API request
       is being processed.
    */
    searchStatus.textContent = "Searching for recipes...";


    /*
       Clear previous recipe results.
    */
    recipeResults.innerHTML = "";


    /*
       Hide recipe details when a new search begins.
    */
    recipeDetails.hidden = true;


    try {

        /*
           Create the API URL.

           encodeURIComponent() makes the search safe to
           include in a URL.

           Example:
           "chicken pasta"

           becomes:
           "chicken%20pasta"
        */
        const url =
            `${API_URL}?search=${encodeURIComponent(searchTerm)}`;


        /*
           Make an asynchronous GET request to the API.

           The await keyword pauses this function until
           the server responds.
        */
        const response = await fetch(url, {

            method: "GET",

            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Accept": "application/json"
            }

        });


        /*
           Check whether the API request was successful.

           HTTP status codes in the 200 range indicate success.
        */
        if (!response.ok) {

            throw new Error(
                `API request failed with status ${response.status}`
            );

        }


        /*
           Convert the response from JSON into a
           JavaScript object.
        */
        const data = await response.json();


        /*
           Display the recipes returned by the API.
        */
        displayRecipes(data);


    } catch (error) {

        /*
           Display an error message to the user if
           something went wrong.
        */
        console.error("Recipe search error:", error);

        recipeResults.innerHTML = `
            <p class="empty-message">
                Unable to find recipes right now.
                Please try again later.
            </p>
        `;

        searchStatus.textContent =
            "There was a problem connecting to the recipe service.";

    }

}


/* =========================================================
   5. DISPLAY RECIPES
   ========================================================= */

/*
   Takes the API response and creates recipe cards
   inside the recipe-results container.
*/
function displayRecipes(data) {

    /*
       The current Recipe API response places the recipes
       inside a "data" property.

       If data.data isn't an array, use an empty array
       instead.
    */
    const recipes = Array.isArray(data.data)
        ? data.data
        : [];


    /*
       Check whether any recipes were returned.
    */
    if (recipes.length === 0) {

        recipeResults.innerHTML = `
            <p class="empty-message">
                No recipes were found.
                Try another ingredient or recipe name.
            </p>
        `;

        searchStatus.textContent = "No recipes found.";

        return;
    }


    /*
       Update the status message with the number of
       recipes returned.
    */
    searchStatus.textContent =
        `${recipes.length} recipe${recipes.length === 1 ? "" : "s"} found.`;


    /*
       Create a recipe card for every recipe returned
       by the API.
    */
    recipes.forEach(function (recipe) {

        const recipeCard = createRecipeCard(recipe);

        recipeResults.appendChild(recipeCard);

    });

}


/* =========================================================
   6. CREATE RECIPE CARD
   ========================================================= */

/*
   Creates an individual recipe card.

   Each card contains:
   - Recipe name
   - Description
   - Category
   - Cuisine
   - View Recipe button
*/
function createRecipeCard(recipe) {

    const article = document.createElement("article");

    article.classList.add("recipe-card");

    const content = document.createElement("div");

    content.classList.add("recipe-card-content");

    const title = document.createElement("h3");

    title.textContent =
        recipe.name || "Unnamed Recipe";

    const description = document.createElement("p");

    description.textContent =
        recipe.description || "No description available.";

    const button = document.createElement("button");

    button.type = "button";

    button.textContent = "View Recipe";

    button.addEventListener("click", function () {

        showRecipeDetails(recipe.id);

    });

    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(button);

    article.appendChild(content);

    return article;
}



/* =========================================================
   7. GET FULL RECIPE DETAILS
   ========================================================= */

/*
   Retrieves the complete recipe information using
   the recipe's unique ID.
*/
async function showRecipeDetails(recipeId) {

    /*
       Tell the user that the recipe is being loaded.
    */
    searchStatus.textContent =
        "Loading recipe details...";


    try {

        /*
           Build the URL for the selected recipe.

           Example:
           /api/v1/recipes/12345
        */
        const url =
            `${API_URL}/${encodeURIComponent(recipeId)}`;


        /*
           Request the complete recipe.
        */
        const response = await fetch(url, {

            method: "GET",

            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Accept": "application/json"
            }

        });


        /*
           Check for an unsuccessful response.
        */
        if (!response.ok) {

            throw new Error(
                `Recipe detail request failed with status ${response.status}`
            );

        }


        /*
           Convert the API response to JavaScript data.
        */
        const result = await response.json();


        /*
           The full recipe is returned inside the data property.
        */
        const recipe = result.data;


        /*
           Display the selected recipe.
        */
        displayRecipeDetails(recipe);


    } catch (error) {

        console.error(
            "Recipe detail error:",
            error
        );

        searchStatus.textContent =
            "Unable to load the recipe details.";

    }

}


/* =========================================================
   8. DISPLAY RECIPE DETAILS
   ========================================================= */

/*
   Displays the complete selected recipe.
*/
function displayRecipeDetails(recipe) {

    /*
       Clear any previous recipe details.
    */
    detailsContent.innerHTML = "";


    /*
       Create the recipe title.
    */
    const title = document.createElement("h3");

    title.textContent =
        recipe.name || "Unnamed Recipe";


    /*
       Create the recipe description.
    */
    const description = document.createElement("p");

    description.textContent =
        recipe.description || "No description available.";


    /*
       Add the title and description.
    */
    detailsContent.appendChild(title);
    detailsContent.appendChild(description);


    /*
       Display recipe category and cuisine when available.
    */
    if (recipe.category || recipe.cuisine) {

        const information = document.createElement("p");

        const category =
            recipe.category
                ? `Category: ${recipe.category}`
                : "";

        const cuisine =
            recipe.cuisine
                ? `Cuisine: ${recipe.cuisine}`
                : "";


        information.textContent =
            [category, cuisine]
                .filter(Boolean)
                .join(" | ");


        detailsContent.appendChild(information);

    }


    /*
       Add the ingredients section.
    */
    createIngredientsSection(recipe);


    /*
       Add the instructions section.
    */
    createInstructionsSection(recipe);


    /*
       Display the details section.
    */
    recipeDetails.hidden = false;


    /*
       Move the user's view to the recipe details.
    */
    recipeDetails.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    /*
       Update the search status.
    */
    searchStatus.textContent =
        `Viewing ${recipe.name || "recipe"}.`;

}


/* =========================================================
   9. INGREDIENTS SECTION
   ========================================================= */

/*
   Creates an expandable Ingredients section.
*/
function createIngredientsSection(recipe) {

    const details = document.createElement("details");

    const summary = document.createElement("summary");
    summary.textContent = "Ingredients";

    const list = document.createElement("ul");

    if (
        Array.isArray(recipe.ingredients) &&
        recipe.ingredients.length > 0
    ) {

        recipe.ingredients.forEach(function (ingredient) {

            const listItem = document.createElement("li");

            listItem.textContent = formatIngredient(ingredient);

            list.appendChild(listItem);

        });

    }

    if (list.children.length === 0) {

        const listItem = document.createElement("li");

        listItem.textContent =
            "Ingredient information is unavailable.";

        list.appendChild(listItem);

    }

    details.appendChild(summary);
    details.appendChild(list);

    detailsContent.appendChild(details);
}



/* =========================================================
   10. FORMAT INGREDIENT
   ========================================================= */

/*
   Converts an ingredient object from the API into
   readable text.
*/
function formatIngredient(ingredient) {

    /*
       Different APIs can use different field names,
       so we check several possibilities.
    */
    const quantity =
        ingredient.quantity ??
        ingredient.amount ??
        "";


    const unit =
        ingredient.unit ??
        "";


    const name =
        ingredient.name ??
        ingredient.ingredient ??
        "Unknown ingredient";


    /*
       Combine the available information.
    */
    return [
        quantity,
        unit,
        name
    ]
        .filter(Boolean)
        .join(" ");

}


/* =========================================================
   11. INSTRUCTIONS SECTION
   ========================================================= */

/*
   Creates an expandable Instructions section.
*/
function createInstructionsSection(recipe) {

    const details = document.createElement("details");

    const summary = document.createElement("summary");
    summary.textContent = "Instructions";

    const list = document.createElement("ol");

    if (
        Array.isArray(recipe.instructions) &&
        recipe.instructions.length > 0
    ) {

        recipe.instructions.forEach(function (step) {

            const listItem = document.createElement("li");

            listItem.textContent = step;

            list.appendChild(listItem);

        });

    }

    if (list.children.length === 0) {

        const listItem = document.createElement("li");

        listItem.textContent =
            "Instruction information is unavailable.";

        list.appendChild(listItem);

    }

    details.appendChild(summary);
    details.appendChild(list);

    detailsContent.appendChild(details);
}



/* =========================================================
   12. CLOSE RECIPE DETAILS
   ========================================================= */

/*
   Return to the recipe results when the Close button
   is clicked.
*/
closeDetailsButton.addEventListener("click", function () {

    /*
       Hide the recipe details section.
    */
    recipeDetails.hidden = true;


    /*
       Clear the recipe details from the page.
    */
    detailsContent.innerHTML = "";


    /*
       Update the status message.
    */
    searchStatus.textContent =
        "Recipe details closed.";


    /*
       Return the user's view to the recipe results.
    */
    document.getElementById("recipes").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});


/* =========================================================
   13. INITIAL PAGE STATE
   ========================================================= */

/*
   Make sure recipe details are hidden when the
   application first loads.
*/
recipeDetails.hidden = true;


/*
   Place the cursor in the search field when the page
   is ready.
*/
searchInput.focus();

