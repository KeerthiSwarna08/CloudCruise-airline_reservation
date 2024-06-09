// Access the form and display area elements
const form = document.getElementById('dataForm');
const displayArea = document.getElementById('displayArea');

// Event listener for form submission
form.addEventListener('submit', function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();
    
    // Get the input value from the form field
    const inputData = document.getElementById('inputField').value;
    
    // Process the input data (e.g., you can perform validation or formatting here)
    
    // Save the processed data in another variable or perform further actions
    const savedData = inputData;
    
    // Display the saved data in the display area
    displayArea.textContent = `Saved Data: ${savedData}`;
});