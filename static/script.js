document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('recommendation-form');
    const chatHistory = document.querySelector('.chat-history');
    const chatRecommendations = document.querySelector('.recommendations-section');
    const spinner = document.getElementById('spinner'); // Reference to the spinner element

    // Hide the spinner initially
    spinner.style.display = 'none';
    // Define categories
    const categories = ['Dress', 'Top', 'Bottom', 'Footwear', 'Accessories','Jewelry'];
    let recommendations = {}; // Variable to store recommendation data
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        // Show spinner while waiting for the response
        spinner.style.display = 'block';

        // Get user input from the form
        const genderInput = document.querySelector('[name="gender"]').value;
        const promptInput = document.querySelector('[name="prompt"]').value;

        // Display user input in the chat history section
        displayUserInput(genderInput, promptInput);

        // Send request for recommendation
        sendRecommendationRequest(genderInput, promptInput);
    });


    // Define variables to keep track of current index for each category
    const currentIndex = {};

    function displayUserInput(gender, prompt) {
        // Create a container for the user input
        const userInputContainer = document.createElement('div');
        userInputContainer.classList.add('user-input');

        // Create elements to display the user input
        const genderSpan = document.createElement('span');
        genderSpan.classList.add('user-gender');
        genderSpan.textContent = `Gender: ${gender.toUpperCase()}`;
        const promptSpan = document.createElement('span');
        promptSpan.classList.add('user-prompt');
        promptSpan.textContent = `Prompt: ${prompt}`;

        // Append elements to the user input container
        userInputContainer.appendChild(genderSpan);
        userInputContainer.appendChild(document.createElement('br'));
        userInputContainer.appendChild(promptSpan);

        // Append the user input container to the chat history
        chatHistory.appendChild(userInputContainer);
    }

    function sendRecommendationRequest(gender, prompt) {
        const formData = new FormData(form);
        const xhr = new XMLHttpRequest();
    
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                spinner.style.display = 'none';
                if (xhr.status === 200) {
                    console.log('Response:', xhr.responseText); // Log the response text
                    const data = JSON.parse(xhr.responseText);
                    recommendations = data[0]; // Update recommendations data
                    const searches = data[1];
                    console.log('Recommendations:', recommendations);
                    console.log('Searches:', searches);
                    displaySearches("FasAi Suggests:", searches); // Display searches in chat history
                    displayRecommendations();
                } else {
                    console.error('Error:', xhr.statusText);
                }
            }
        };
    
        xhr.open('POST', form.action, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(new URLSearchParams(formData).toString());
    }
    

    function displaySearches(label, searches) {
        // Create a container for the searches
        const searchesContainer = document.createElement('div');
        searchesContainer.classList.add('searches');
    
        // Create a span element to display the searches
        const searchesSpan = document.createElement('span');
    
        // Use <pre> tag to maintain preformatted text
        searchesSpan.innerHTML = `<pre>${label}\n${searches}</pre>`;
    
        // Append the searches span to the searches container
        searchesContainer.appendChild(searchesSpan);
    
        // Append the searches container to the chat history
        chatHistory.appendChild(searchesContainer);
    }
    
    

    function displayRecommendations() {
        // Iterate over each category (tops, bottoms, footwear, accessories)
        categories.forEach(category => {
            // Check if the category has recommendations
            if (recommendations.hasOwnProperty(category) && recommendations[category].length > 0) {
                // Create a container for the outfit images in the current category
                const outfitContainer = document.createElement('div');
                outfitContainer.classList.add('outfit-carousel'); // Add class for carousel
                outfitContainer.id = `${category}-outfit-container`; // Add id for easy selection
                
                // Set initial index to 0 for each category
                currentIndex[category] = 0;
    
                // Create a div to hold the carousel content
                const carouselContent = document.createElement('div');
                carouselContent.classList.add('carousel-content');
    
                // Function to display next three images for the category upon button click
                const displayNextImages = () => {
                    // Clear existing content in the container
                    carouselContent.innerHTML = '';
    
                    // Get the outfits to display based on the current index
                    const nextOutfits = recommendations[category].slice(currentIndex[category], currentIndex[category] + 3);
    
                    // Log the outfit data to the console for debugging
                    console.log('Outfits:', nextOutfits);
    
                    // Iterate over the next outfits and create elements for each
                    nextOutfits.forEach(outfit => {
                        // Create anchor element
                        const outfitLink = document.createElement('a');
                        outfitLink.href = outfit['Link'];
                        outfitLink.target = '_blank'; // Open link in a new tab
                        carouselContent.appendChild(outfitLink);
    
                        // Create image element inside anchor
                        const outfitImg = document.createElement('img');
                        outfitImg.src = outfit['Image'];
                        outfitImg.alt = outfit['Title'];
                        outfitImg.classList.add('outfit-image');
                        outfitLink.appendChild(outfitImg);
    
                        // Repeat the process for other information (e.g., price, brand)
                    });
    
                    // Increment the current index for the category
                    currentIndex[category] += 3;
    
                    // If all outfits have been displayed, hide the button
                    if (currentIndex[category] >= recommendations[category].length) {
                        const button = document.getElementById(`${category}-button`);
                        if (button) {
                            button.style.display = 'none';
                        }
                    }
                };
    
                // Display initial three images for the category
                displayNextImages();
    
                // Create a button to load next three images for the category
                const button = document.createElement('button');
                button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M6.854 4.354a.5.5 0 0 1 0 .707L9.793 8l-2.939 2.939a.5.5 0 1 1-.707-.707l2.5-2.5a.5.5 0 0 0 0-.707l-2.5-2.5a.5.5 0 0 1 .707-.707z"/></svg>';
                button.addEventListener('click', displayNextImages);
                button.id = `${category}-button`;
                outfitContainer.appendChild(button);

                // Function to display previous three images for the category upon button click
                const displayPreviousImages = () => {
                    // Update the current index to go back three steps
                    currentIndex[category] = Math.max(0, currentIndex[category] - 3);
                    // Display the previous three images
                    displayRecommendationsForCategory(category);
                };

                // Create a button to load previous three images for the category
                const prevButton = document.createElement('button');
                prevButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.354 4.354a.5.5 0 0 1 0 .707L4.414 8l2.939 2.939a.5.5 0 1 1-.707.707l-3-3a.5.5 0 0 1 0-.707l3-3a.5.5 0 0 1 .707 0z"/></svg>';
                prevButton.addEventListener('click', displayPreviousImages);
                prevButton.id = `${category}-prev-button`;
                outfitContainer.appendChild(prevButton);

                // Append carousel content to outfit container
                outfitContainer.appendChild(carouselContent);
    
                // Append the outfit container to the chat history
                chatRecommendations.appendChild(outfitContainer);
            }
        });
    }

    function displayRecommendationsForCategory(category) {
        // Clear existing content in the container
        const outfitContainer = document.getElementById(`${category}-outfit-container`);
        const carouselContent = outfitContainer.querySelector('.carousel-content');
        carouselContent.innerHTML = '';

        // Get the outfits to display based on the current index
        const nextOutfits = recommendations[category].slice(currentIndex[category], currentIndex[category] + 3);
        
        // Iterate over the next outfits and create elements for each
        nextOutfits.forEach(outfit => {
            // Create anchor element
            const outfitLink = document.createElement('a');
            outfitLink.href = outfit['Link'];
            outfitLink.target = '_blank'; // Open link in a new tab
            carouselContent.appendChild(outfitLink);

            // Create image element inside anchor
            const outfitImg = document.createElement('img');
            outfitImg.src = outfit['Image'];
            outfitImg.alt = outfit['Title'];
            outfitImg.classList.add('outfit-image');
            
            outfitLink.appendChild(outfitImg);

            // Repeat the process for other information (e.g., price, brand)
        });

        // If all outfits have been displayed, hide the button
        const button = document.getElementById(`${category}-button`);
        if (button) {
            button.style.display = currentIndex[category] >= recommendations[category].length ? 'none' : 'block';
        }
    }
});
