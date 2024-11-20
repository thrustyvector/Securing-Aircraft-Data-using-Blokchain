document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const loginContainer = document.querySelector('.form-container:not(.hidden)');
    const signupContainer = document.querySelector('.form-container.hidden');
  
    // Function to toggle between login and signup forms
    function toggleForms() {
      loginContainer.classList.toggle('hidden');
      signupContainer.classList.toggle('hidden');
    }
  
    // Event listeners for switching forms
    loginLink.addEventListener('click', function(event) {
      event.preventDefault();
      toggleForms();
    });
  
    signupLink.addEventListener('click', function(event) {
      event.preventDefault();
      toggleForms();
    });
  
    // Function to handle form submission for Signup
    function handleSignup(event) {
      event.preventDefault();
      
      // Get form values
      const username = document.getElementById('signupUsername').value;
      const password = document.getElementById('signupPassword').value;
  
      // Check if username already exists in localStorage
      if (localStorage.getItem(username)) {
        alert('Username already exists! Please choose another one.');
        return;
      }
  
      // Store username and password in localStorage
      localStorage.setItem(username, password);
      alert('Signup successful! Please login.');
      
      // Clear signup form
      document.getElementById('signupForm').reset();
  
      // Switch to login form after successful signup
      toggleForms();
    }
  
    // Function to handle form submission for Login
    function handleLogin(event) {
      event.preventDefault();
      
      // Get form values
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;
  
      // Check if username exists in localStorage and password matches
      const storedPassword = localStorage.getItem(username);
      if (password === storedPassword) {
        // alert('Login successful!');
        // Redirect to another page
        window.location.href = 'HomePage.html'; // Replace 'welcome.html' with your desired page
        
      } else {
        alert('Invalid username or password.');
      }
  
      // Clear login form
      document.getElementById('loginForm').reset();
    }
  
    // Event listeners for form submissions
    signupForm.addEventListener('submit', handleSignup);
    loginForm.addEventListener('submit', handleLogin);
  });
  