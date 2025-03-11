const form = document.getElementById('login-form');
const email = document.getElementById('email');
const password = document.getElementById('password');
const errorPopup = document.getElementById('error-popup');

// Show input error message
function showError(input, message) {
  const formControl = input.parentElement;
  formControl.className = 'form-control error';
  const small = formControl.querySelector('small');
  small.innerText = message;
}

// Show success outline
function showSuccess(input) {
  const formControl = input.parentElement;
  formControl.className = 'form-control success';
}

// Check email is valid
function checkEmail(input) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (re.test(input.value.trim())) {
    showSuccess(input);
    return true;
  } else {
    showError(input, 'Email is not valid');
    return false;
  }
}

// Check required fields
function checkRequired(inputArr) {
  let isValid = true;
  inputArr.forEach(function (input) {
    if (input.value.trim() === '') {
      showError(input, `${getFieldName(input)} is required`);
      isValid = false;
    } else {
      showSuccess(input);
    }
  });

  return isValid;
}

// Get field name
function getFieldName(input) {
  return input.id.charAt(0).toUpperCase() + input.id.slice(1);
}

// Event listener for form submission
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Step 1: Ensure all required fields are filled
  const isNotEmpty = checkRequired([email, password]);

  // Step 2: Stop further validation if any field is empty
  if (!isNotEmpty) return;

  // Step 3: Run additional validation checks only if required fields are filled
  const isEmailValid = checkEmail(email);

  // Step 4: Stop submission if email validation fails
  if (!isEmailValid) {
    return;
  }

  // Step 5: If all validations pass, proceed with the POST request
  const formData = {
    email: email.value.trim(),
    password: password.value.trim(),
  };

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    errorPopup.style.display = 'block';

    if (response.ok) {
      errorPopup.textContent = result.message || 'Login successful!';
      errorPopup.className = 'error-popup success';
      form.reset();
      // Redirect to dashboard or home page
      if (result.redirect) {
        setTimeout(() => {
          window.location.href = result.redirect;
        }, 1000);
      }
    } else {
      errorPopup.textContent = result.error || 'Invalid login credentials';
      errorPopup.className = 'error-popup error';
    }
  } catch (error) {
    console.error('Error:', error);
    errorPopup.textContent = 'Something went wrong!';
    errorPopup.className = 'error-popup error';
  }
});
