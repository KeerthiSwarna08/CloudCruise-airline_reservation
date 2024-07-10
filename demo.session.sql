SELECT * FROM users;
INSERT INTO demo.users VALUES(4,"Anjanarao","anajanarao@gmail.com");
INSERT INTO demo.users VALUES(5,"Bunty","bunty@gmail.com");
INSERT INTO demo.users VALUES(10,"Jambavathi","Jambavathi@gmail.com");
DELETE FROM users WHERE id>0;
INSERT INTO demo.flights VALUES(1,'Vistara','LH4234','Delhi','Banglore','2024-07-12','06:45 PM','2024-07-12','09:30 PM',12000,'Bussiness',2);
INSERT INTO demo.flights VALUES(2,'Indigo','IG3453','Delhi','Mumbai','2024-07-13','04:15 PM','2024-07-13','06:00 PM',18000,'FirstClass',1);
INSERT INTO demo.flights VALUES(4,'Air India','AI8768','Delhi','Leh','2024-07-12','2024-07-12',8000,'Economy',3);
INSERT INTO demo.flights VALUES(3,'Qantas','QS8799','Delhi','Goa','2024-07-13', '11:30 AM','2024-07-13','02:15 PM',12000,'Bussiness',2);

SELECT * FROM flights;
SELECT * FROM passengers;
SELECT * FROM users;
UPDATE passengers
SET departure_time = REPLACE(departure_time, 'T', ' ');
SELECT * FROM users WHERE email = 'padma@gmail.com' AND password = 'padma@123';

INSERT INTO demo.passengers VALUES(1,'varsha','varsha@gmail.com',8766546678,'Delhi','Goa','Qantas','QS8799','2024-07-13 11:30','2024-07-13 14:15','Bussiness',12000,2);
INSERT INTO demo.passengers VALUES(2,'spandhana','spandhana@gmail.com',8765748656,'Delhi','Goa','Qantas','QS8799','2024-07-13 11:30','2024-07-13 14:15','Bussiness',12000,3);
drop TABLE flights;
ALTER TABLE demo.passengers ALTER COLUMN Price DECIMAL;

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
            e.EmployeeId = 4;