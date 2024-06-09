// Importing the exported data
import { sendData } from './datasender.js';

// Now you can use the exported function to receive the data
const data = "Hello from file 2!";
sendData(data);
