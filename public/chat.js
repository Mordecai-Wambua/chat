const form = document.getElementById('create-room-form');
const roomName = document.getElementById('roomName');
const room = document.querySelector('.room');
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
  const isNotEmpty = checkRequired([roomName]);

  // Step 2: Stop further validation if any field is empty
  if (!isNotEmpty) return;

  // Step 3: If all validations pass, proceed with the POST request
  const formData = {
    roomName: roomName.value.trim(),
  };

  console.log(formData);

  try {
    const response = await fetch('/chat/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    errorPopup.style.display = 'block';

    if (response.ok) {
      errorPopup.textContent = result.message || 'successful!';
      errorPopup.className = 'error-popup success';
      form.reset();
      // Redirect to dashboard or home page
      setTimeout(() => {
        window.location.href = `/chat`;
      }, 1000);
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
