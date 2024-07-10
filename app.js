const express =require ('express');
const port=process.env.PORT || 5500;
const path = require('path');
// const fs=require('fs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');
const { Script } = require('vm');
const fs = require('fs');
// const { val } = require('cherio/lib/api/attributes');
const app=express();
//mysql connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'demo'
});


// API Middele wares 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('cloudcruise'));

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Note: For production, set secure: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

app.use(express.static(path.join(__dirname, '../public')));
// API routes
app.get('/public/index.html',(_req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
}).get('/public/flights.html',(_req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'flights.html'));
}).get('/public/stories.html',(_req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'stories.html'));
}).get('/public/contactus.html',(_req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'contactus.html'));
}).get('/public/signup.html',(_req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
}).get('/public/login.html',(_req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
}).get('/public/aftercontact.html',(_req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'aftercontact.html'));
}).get('/public/booking.html',(_req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'booking.html'));
}).get('/public/bill.html',(_req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'bill.html'));
}).get('/public/seat.html', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'seat.html'));
}).get('/public/navbar.html',(_req, res)=>{
    res.sendFile(path.join(__dirname,'public','navbar.html'));
}).get('/public/updateStatus.html',(_req, res)=>{
    res.sendFile(path.join(__dirname,'public','updateFlights.html'));
}).get('/public/runway.html',(_req, res)=>{
    res.sendFile(path.join(__dirname,'public','runway.html'));
}).get('/public/staff_details.html',(_req, res)=>{
    res.sendFile(path.join(__dirname,'public','staff_details.html'));
})

// Route to search flights
app.get('/search', (req, res) => {
    const { departure,arrival, date, seat} = req.query;

    const query = `
        SELECT * FROM flights
        WHERE departure = ? AND arrival = ? AND DATE(departure_date) = ? AND seat = ?
    `;
    
    db.query(query, [departure, arrival, date, seat], (err, results) => {
        
        if (err) throw err;
        res.json(results);
    });
}).get('/results', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'results.html'));
});
// For seats

let seats = Array.from({ length: 80 }, (_, i) => ({ name: `Seat ${i + 1}`, booked: false }));
app.get('/seat.html', (req, res) => {
    res.sendFile(__dirname + '/public/seat.html');
});

app.get('/available-seats', (req, res) => {
    res.json(seats);
});

app.get('/booking.html', (req, res) => {
    res.sendFile(__dirname + '/public/booking.html');
});

app.post('/book-seat', (req, res) => {
    const { seat } = req.body;
    const seatIndex = seats.findIndex(s => s.name === seat);
    if (seatIndex !== -1 && !seats[seatIndex].booked) {
        seats[seatIndex].booked = true;
        res.redirect(`/booking.html?seat=${seat}`);
    } else {
        res.redirect('/seat.html');
    }
});



// Express route for handling user login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    const values = [email, password];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (result.length > 0) {
            // User authenticated, set session
            req.session.user = email;
            
            // Check for special user (example: admin)
            if (email === 'cloudcruise@gmail.com' && password === 'cloudcruise@9876') {
                req.session.isSpecialUser = true;
                // Send special HTML page for admin
                fs.readFile(path.join(__dirname, 'public', 'updateFlights.html'), 'utf8', (err, data) => {
                    if (err) {
                        console.log('Error opening stories.html:', err);
                        res.status(500).send('Internal server error');
                        return;
                    }
                    // Modify HTML to show "Add Story" button and send to client
                    const modifiedHtml = data.replace('</body>', `
                        <script>
                         sessionStorage.setItem('isLoggedIn', 'true');
                         sessionStorage.setItem('isSpecialUser', 'true');
                            document.addEventListener('DOMContentLoaded', () => {
                                const navbarElement = document.getElementById('navbar-placeholder');
                                if (navbarElement) {
                                    fetch('navbar.html')
                                        .then(response => response.text())
                                        .then(navbarHtml => {
                                            navbarElement.innerHTML = navbarHtml;
                                            updateNavbar();
                                        })
                                        .catch(error => console.error('Error fetching navbar:', error));
                                }
                            });
                        </script>
                    </body>`);

                    res.send(modifiedHtml);
                });
            } 
        else {
                // For regular users, send stories.html
                req.session.isSpecialUser = false; // Regular user
                fs.readFile(path.join(__dirname, 'public', 'stories.html'),'utf-8', (err,data) => {
                    if (err) {
                        console.error('Error sending flights.html:', err);
                        res.status(500).send('Internal server error');
                    }
                    const modifiedHtml = data.replace('</body>', `
                        <script>
                        sessionStorage.setItem('isLoggedIn', 'true');
                        sessionStorage.setItem('isSpecialUser', 'false');
                        updateNavbar();
                        </script>
                        </body>`);
                        res.send(modifiedHtml);
                })
            
        } 
    }else {
            // User authentication failed, send login.html with error message
            console.log('Login failed. Sending login.html with error message');
            const errorMessage = 'Check your username/password';
            fs.readFile(path.join(__dirname, 'public', 'login.html'), 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading login.html:', err);
                    res.status(500).send('Internal server error');
                    return;
                }

                const modifiedHtml = data.replace('</body>', `
                    <script>
                        document.addEventListener('DOMContentLoaded', () => {
                            const errorElement = document.getElementById('error');
                            if (errorElement) {
                                errorElement.innerHTML = '<span>${errorMessage}</span>';
                            }
                        });
                    </script>
                </body>`);

                res.send(modifiedHtml);
            });
        }
    
    });
});
app.get('/myflights.html', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login.html');
        return;
    }

    const email = req.session.user;

    // Get mobile number from users table
    const userQuery = 'SELECT Mobileno FROM users WHERE email = ?';
    db.query(userQuery, [email], (err, userResult) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).send('Internal server error');
            return;
        }

        if (userResult.length > 0) {
            const mobileNumber = userResult[0].Mobileno;

            // Get travel history from passengers table
            const passengerQuery = 'SELECT * FROM passengers WHERE Email = ? AND Number = ?';
            db.query(passengerQuery, [email, mobileNumber], (err, passengerResults) => {
                if (err) {
                    console.error('Database query error:', err);
                    res.status(500).send('Internal server error');
                    return;
                }

                // Log the passenger results to check the data structure
                console.log('Passenger Results:', passengerResults);
                
                fs.readFile(path.join(__dirname, 'public', 'myflights.html'), 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading myflights.html:', err);
                        res.status(500).send('Internal server error');
                        return;
                    }

                    const flightsHtml = passengerResults.map(record => `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${record.Airline || ''}</h5>
                                <p class="card-text">Passenger: ${record.Name || ''}</p>
                                <p class="card-text">From: ${record.Departure || ''} To: ${record.Arrival || ''}</p>
                                <p class="card-text">Departure: ${record.Departure_time || ''}</p>
                                <p class="card-text">Arrival: ${record.Arrival_time || ''}</p>
                                <p class="card-text">Flight Number: ${record.Flight_number || ''}</p>
                                <p class="card-text">Seat: ${record.Seat || ''}</p>
                                <p class="card-text">Price: $${record.Price || ''}</p>
                                <p class="card-text">Gate: ${record.Gate || ''}</p>
                            </div>
                        </div>
                    `).join('');

                    const escapedFlightsHtml = flightsHtml.replace(/`/g, '\\`');

                    const modifiedHtml = data.replace('</body>', `
                        <script>
                            document.addEventListener('DOMContentLoaded', () => {
                                const recordsContainer = document.getElementById('recordsContainer');
                                recordsContainer.innerHTML = \`${escapedFlightsHtml}\`;
                            });
                        </script>
                    </body>`);

                    res.send(modifiedHtml);
                });
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});



// app.get('/myflights.html', (req, res) => {
//     if (!req.session.user) {
//         res.redirect('/login.html');
//         return;
//     }

//     const email = req.session.user;

//     // Get mobile number from users table
//     const userQuery = 'SELECT Mobileno FROM users WHERE email = ?';
//     db.query(userQuery, [email], (err, userResult) => {
//         if (err) {
//             console.error('Database query error:', err);
//             res.status(500).send('Internal server error');
//             return;
//         }

//         if (userResult.length > 0) {
//             const mobileNumber = userResult[0].mobileno;

//             // Get travel history from passengers table
//             const passengerQuery = 'SELECT * FROM passengers WHERE Number = ?';
//             db.query(passengerQuery, [mobileNumber], (err, passengerResults) => {
//                 if (err) {
//                     console.error('Database query error:', err);
//                     res.status(500).send('Internal server error');
//                     return;
//                 }

//                 fs.readFile(path.join(__dirname, 'public', 'myflights.html'), 'utf8', (err, data) => {
//                     if (err) {
//                         console.error('Error reading myflights.html:', err);
//                         res.status(500).send('Internal server error');
//                         return;
//                     }

//                     const modifiedHtml = data.replace('</body>', `
//                         <script>
//                             document.addEventListener('DOMContentLoaded', () => {
//                                 const recordsContainer = document.getElementById('recordsContainer');
//                                 const records = ${JSON.stringify(passengerResults)};
//                                 records.forEach(record => {
//                                     const recordDiv = document.createElement('div');
//                                     recordDiv.className = 'card mb-3';
//                                     recordDiv.innerHTML = '
//                                         <div class="card-body">
//                                             <h5 class="card-title">${record.Airline}</h5>
//                                             <p class="card-text">Passenger: ${record.Name}</p>
//                                             <p class="card-text">From: ${record.Departure} To: ${record.Arrival}</p>
//                                             <p class="card-text">Departure: ${record.Departure_time}</p>
//                                             <p class="card-text">Arrival: ${record.Arrival_time}</p>
//                                             <p class="card-text">Flight Number: ${record.Flight_number}</p>
//                                             <p class="card-text">Seat: ${record.Seat}</p>
//                                             <p class="card-text">Price: $${record.Price}</p>
//                                             <p class="card-text">Gate: ${record.Gate}</p>
//                                         </div>
//                                     ';
//                                     recordsContainer.appendChild(recordDiv);
//                                 });
//                             });
//                         </script>
//                     </body>`);
//                     res.send(modifiedHtml);
//                 });
//             });
//         } else {
//             res.status(404).send('User not found');
//         }
//     });
// });
// Express route for handling user logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal server error');
            return;
        }
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
});

app.use(express.static('public'));
// original
//Post details of new user
app.post('/formpost', (req, res) => {
    const { name, email ,mobileno, password} = req.body;
    let sql = 'INSERT INTO users (Name, email, mobileno, password) VALUES (?, ?, ?, ?)';
    let values = [name, email, mobileno, password];
    db.query(sql,values);
    res.sendFile(__dirname + '/public/flights.html');
}).post('/bill', (req, res) => {
    const { name, email, mobileno, departure, arrival, airline, flight_number, departure_time, arrival_time, seat, gate, price } = req.body;

    let sql = 'INSERT INTO passengers (Name, Email, Number, Departure, Arrival, Airline, Flight_number, Departure_time, Arrival_time, Seat, Price, Gate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    let values = [name, email, mobileno, departure, arrival, airline, flight_number, departure_time, arrival_time, seat, price, gate];
    
    console.log(values);

    db.query(sql, values, (err) => {
        if (err) {
            console.error('Error inserting record:', err);
            res.status(500).send('Error inserting record');
        } else {
            res.render('bill', {name,email,mobileno,departure,arrival,airline,
                flight_number,departure_time,arrival_time,seat,gate,price
            });
        }
    });
});

app.post('/add-flights', (req, res) => {
    const numFlights = req.body.num_flights;
    const airlines = req.body.airline;
    const flightNumbers = req.body.flight_number;
    const departures = req.body.departure;
    const arrivals = req.body.arrival;
    const departureDates = req.body.departure_date;
    const departureTimes = req.body.departure_time;
    const arrivalDates = req.body.arrival_date;
    const arrivalTimes = req.body.arrival_time;
    const prices = req.body.price;
    const seats = req.body.seat;
    const gates = req.body.gate;

    for (let i = 0; i < numFlights; i++) {
        let flight = {
            airline: airlines[i],
            flight_number: flightNumbers[i],
            departure: departures[i],
            arrival: arrivals[i],
            departure_date: departureDates[i],
            departure_time: departureTimes[i],
            arrival_date: arrivalDates[i],
            arrival_time: arrivalTimes[i],
            price: prices[i],
            seat: seats[i],
            gate: gates[i]
        };

        let sql = 'INSERT INTO flights SET ?';
        let query = db.query(sql, flight, (err, result) => {
            if (err) {
                throw err;
            }
            console.log(result);
        });
    }

    res.send('Flights added...');
}).post('/delete-flight',(req,res)=>{
    const flightNumber=req.body.flight_number;
    let sql = 'DELETE FROM flights WHERE flight_number = ?';
    let query = db.query(sql, [flightNumber], (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        res.send(`Flights with flight number ${flightNumber} deleted...`);
    });
});
app.post('/update-status', (req, res) => {
    const flightNumber = req.body.flight_number;
    const status = req.body.status;

    let sql = 'UPDATE flights SET status = ? WHERE flight_number = ?';
    let query = db.query(sql, [status, flightNumber], (err, result) => {
        if (err) {
            throw err;
        }
        console.log(result);
        res.send(`Status for flight number ${flightNumber} updated to ${status}...`);
    });
});

app.post('/search-employees', (req, res) => {
    const searchType = req.body.search_type;
    const searchValue = req.body.search_value;

    let sql;

    if (searchType === 'airport_designation') {
        sql = `
            SELECT 
                e.EmployeeId,
                e.EmployeeName,
                e.EmployeeSalary,
                ae.Designation AS AirportDesignation,
                ae.Department AS AirportDepartment,
                ap.Designation AS AirplaneDesignation
            FROM 
                Employees e
            LEFT JOIN 
                AirportEmployees ae ON e.EmployeeId = ae.EmployeeId
            LEFT JOIN 
                AirplaneEmployees ap ON e.EmployeeId = ap.EmployeeId
            WHERE 
                ae.Designation = ?;
        `;
    } else if (searchType === 'airport_department') {
        sql = `
            SELECT 
                e.EmployeeId,
                e.EmployeeName,
                e.EmployeeSalary,
                ae.Designation AS AirportDesignation,
                ae.Department AS AirportDepartment,
                ap.Designation AS AirplaneDesignation
            FROM 
                Employees e
            LEFT JOIN 
                AirportEmployees ae ON e.EmployeeId = ae.EmployeeId
            LEFT JOIN 
                AirplaneEmployees ap ON e.EmployeeId = ap.EmployeeId
            WHERE 
                ae.Department = ?;
        `;
    } else if (searchType === 'airplane_designation') {
        sql = `
            SELECT 
                e.EmployeeId,
                e.EmployeeName,
                e.EmployeeSalary,
                ae.Designation AS AirportDesignation,
                ae.Department AS AirportDepartment,
                ap.Designation AS AirplaneDesignation
            FROM 
                Employees e
            LEFT JOIN 
                AirportEmployees ae ON e.EmployeeId = ae.EmployeeId
            LEFT JOIN 
                AirplaneEmployees ap ON e.EmployeeId = ap.EmployeeId
            WHERE 
                ap.Designation = ?;
        `;
    }

    db.query(sql, [searchValue], (err, results) => {
        if (err) {
            throw err;
        }
        res.render('staff', { results });
    });
});

app.post('/add-employee', (req, res) => {
    const { name, salary, type, airportDesignation, airportDepartment, airplaneDesignation } = req.body;
    let employeeId;

    // Insert into Employees table
    let sql = 'INSERT INTO Employees (EmployeeName, EmployeeSalary) VALUES (?, ?)';
    db.query(sql, [name, salary], (err, result) => {
        if (err) throw err;
        employeeId = result.insertId;

        if (type === 'airport') {
            sql = 'INSERT INTO AirportEmployees (EmployeeId, Designation, Department) VALUES (?, ?, ?)';
            db.query(sql, [employeeId, airportDesignation, airportDepartment], (err, result) => {
                if (err) throw err;
                res.send('Airport Employee added successfully');
            });
        } else if (type === 'airplane') {
            sql = 'INSERT INTO AirplaneEmployees (EmployeeId, Designation) VALUES (?, ?)';
            db.query(sql, [employeeId, airplaneDesignation], (err, result) => {
                if (err) throw err;
                res.send('Airplane Employee added successfully');
            });
        }
    });
});

app.get('/get-employee/:id', (req, res) => {
    const { id } = req.params;
    let sql = 'SELECT * FROM Employees WHERE EmployeeId = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            const employee = result[0];

            // Check if employee is in AirportEmployees or AirplaneEmployees
            sql = 'SELECT * FROM AirportEmployees WHERE EmployeeId = ?';
            db.query(sql, [id], (err, airportResult) => {
                if (err) throw err;
                if (airportResult.length > 0) {
                    res.json({ success: true, employee, airportEmployee: airportResult[0] });
                } else {
                    sql = 'SELECT * FROM AirplaneEmployees WHERE EmployeeId = ?';
                    db.query(sql, [id], (err, airplaneResult) => {
                        if (err) throw err;
                        if (airplaneResult.length > 0) {
                            res.json({ success: true, employee, airplaneEmployee: airplaneResult[0] });
                        } else {
                            res.json({ success: true, employee });
                        }
                    });
                }
            });
        } else {
            res.json({ success: false });
        }
    });
});

// Route to handle form submission for deleting an employee
app.post('/delete-employee', (req, res) => {
    const { employeeId } = req.body;

    // Delete from AirportEmployees and AirplaneEmployees first to avoid foreign key constraint errors
    let sql = 'DELETE FROM AirportEmployees WHERE EmployeeId = ?';
    db.query(sql, [employeeId], (err, result) => {
        if (err) throw err;
        sql = 'DELETE FROM AirplaneEmployees WHERE EmployeeId = ?';
        db.query(sql, [employeeId], (err, result) => {
            if (err) throw err;
            // Delete from Employees table
            sql = 'DELETE FROM Employees WHERE EmployeeId = ?';
            db.query(sql, [employeeId], (err, result) => {
                if (err) throw err;
                res.send('Employee deleted successfully');
            });
        });
    });
});

app.listen(port,"127.0.0.1",()=>{
    console.log(`Server started at http://localhost:${port}`);
    
})