/* eslint-disable */

const login = async (email, password) => {
  try {
    // console.log('Entering login function');
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      alert('Logged in Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    // console.log('This is the response');
    // console.log(res);
  } catch (err) {
    // console.log('This is the error');
    alert(err.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  // console.log('these are the email and password');
  // console.log(email, password);
  login(email, password);
});
