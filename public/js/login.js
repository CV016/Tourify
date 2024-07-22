/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
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
      showAlert('success', 'Logged in Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    // console.log('This is the response');
    // console.log(res);
  } catch (err) {
    // console.log('This is the error', err.response.data.message);
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });
    console.log(res.data);
    if ((res.data.status = 'success')) location.reload('/');
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error logging out! . Please Try Again!');
  }
};
