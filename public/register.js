const form = document.getElementById('form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');
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

// Check input length
function checkLength(input, min, max) {
  if (input.value.length < min) {
    showError(
      input,
      `${getFieldName(input)} must be at least ${min} characters`
    );
    return false;
  } else if (input.value.length > max) {
    showError(
      input,
      `${getFieldName(input)} must be less than ${max} characters`
    );
    return false;
  } else {
    showSuccess(input);
    return true;
  }
}

// Check passwords match
function checkPasswordsMatch(input1, input2) {
  if (input1.value !== input2.value) {
    showError(input2, 'Passwords do not match');
    return false;
  }
  return true;
}

// Get fieldname
function getFieldName(input) {
  return input.id.charAt(0).toUpperCase() + input.id.slice(1);
}

// Event listener for form submission
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Step 1: Ensure all required fields are filled
  const isNotEmpty = checkRequired([username, email, password, password2]);

  // Step 2: Stop further validation if any field is empty
  if (!isNotEmpty) return;

  // Step 3: Run additional validation checks only if required fields are filled
  const isUsernameValid = checkLength(username, 3, 15);
  const isPasswordValid = checkLength(password, 6, 25);
  const isEmailValid = checkEmail(email);
  const doPasswordsMatch = checkPasswordsMatch(password, password2);

  // Step 4: Stop submission if any additional validation fails
  if (
    !isUsernameValid ||
    !isPasswordValid ||
    !isEmailValid ||
    !doPasswordsMatch
  ) {
    return;
  }

  // Step 5: If all validations pass, proceed with the POST request
  const formData = {
    username: username.value.trim(),
    email: email.value.trim(),
    password: password.value.trim(),
  };

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    errorPopup.style.display = 'block';

    if (response.ok) {
      errorPopup.textContent = result.message;
      errorPopup.className = 'error-popup success';
      form.reset();
      if (result.redirect) {
        setTimeout(() => {
          window.location.href = result.redirect;
        }, 1000);
      }
    } else {
      errorPopup.textContent = result.error || 'An error occurred';
      errorPopup.className = 'error-popup error';
    }
  } catch (error) {
    console.error('Error:', error);
    errorPopup.textContent = 'Something went wrong!';
    errorPopup.className = 'error-popup error';
  }
});
