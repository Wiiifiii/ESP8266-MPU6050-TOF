// app/api.js
import axios from 'axios';

export default axios.create({
  baseURL: 'http://192.168.4.1',  // ESP8266 default AP address
  timeout: 5000,                  // optional: 5s timeout
});
