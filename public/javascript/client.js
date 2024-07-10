document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    updateNavbar(); // Update navbar state on page load

    // Function to handle logout
    window.logout = function() {
        console.log('Logout clicked');
        // Example: Clear session variables or cookies indicating login state
        sessionStorage.removeItem('isLoggedIn');
        updateNavbar(); // Update navbar immediately on logout
    };
});

// Function to update navbar links based on login status
function updateNavbar() {
    const loginLink = document.getElementById('login-link');
    const signupLink = document.getElementById('signup-link');
    const logoutLink = document.getElementById('logout-link');
    const flightsLink = document.getElementById('flights'); 
    const storiesLink=document.getElementById('stories');
    const contactLink=document.getElementById('contact');
    console.log('loginLink:', loginLink);
    console.log('signupLink:', signupLink);
    console.log('logoutLink:', logoutLink);

    if (loginLink && signupLink && logoutLink) {
        if (isLoggedIn()) {
            console.log('User is logged in');
            loginLink.style.display = 'none';
            signupLink.style.display = 'none';
            logoutLink.style.display = 'inline-block';
            if (isSpecialUser()) {
                flightsLink.innerHTML = '<a class="nav-link active" aria-current="page" href="updateFlights.html">UpdateFlights</a>';
                storiesLink.innerHTML = '<a class="nav-link active" aria-current="page" href="runway.html">Runway</a>';
                contactLink.innerHTML = '<a class="nav-link active" aria-current="page" href="staff_details.html">staff details</a>';
            } else {
                storiesLink.innerHTML = '<a class="nav-link active" aria-current="page" href="stories.html">Stories</a>';
                flightsLink.innerHTML = '<a class="nav-link active" aria-current="page" href="myflights.html">MyFlights</a>';
                contactLink.innerHTML = '<a class="nav-link active" aria-current="page" href="contactus.html">contact</a>';
            }
        }else{
            console.log('User is not logged in');
            loginLink.style.display = 'inline-block';
            signupLink.style.display = 'inline-block';
            logoutLink.style.display = 'none';
            flightsLink.innerHTML = '<a class="nav-link active" aria-current="page" href="flights.html">Flights</a>'; // Default link
        }

    } else {
        console.error('One or more navbar elements not found');
    }
}

// Function to check if the user is logged in
function isLoggedIn() {
    // Example: Check if a session variable or cookie indicates the user is logged in
    const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    console.log('isLoggedIn:', loggedIn);
    return loggedIn;
}

// Function to check if the user is a special user
function isSpecialUser() {
    const specialUser = sessionStorage.getItem('isSpecialUser') === 'true';
    console.log('isSpecialUser:', specialUser);
    return specialUser;
}