// import and require modules
const inquirer = require('inquirer');
const consoleTable = require('console.table')
const mysql = require('mysql2');
const promiseMySql = require('promise-mysql');

// variable for connection criteria
const dbConnectionProperties =
{
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1234',
    database: 'employee_db'
}

console.log('---------------------------\nEMPLOYEE MANAGER\n---------------------------')

//main prompt for all functions
const mainPrompt = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'main',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Exit']
        }
    ])
        .then(value => {
            switch (value.main) {
                case 'View All Employees':
                    viewAllEmployees();
                    break;
                case 'Add Employee':
                    addEmployee();
                    break;
                case 'Update Employee Role':
                    updateEmployeeRole();
                    break;
                case 'View All Roles':
                    viewAllRoles();
                    break;
                case 'Add Role':
                    addRole();
                    break;
                case 'View All Departments':
                    viewAllDepartments();
                    break;
                case 'Add Department':
                    addDepartment();
                    break;
                case 'Exit':
                    dbConnection.end();
                    console.log('Thank you! Goodbye!')
            }
        });
}

// variable for connecting to database
const dbConnection = mysql.createConnection(dbConnectionProperties);

// connect to database
dbConnection.connect(err => {
    if (err) {
        throw err;
    }
    console.log('Connection to Database Successful!');
    mainPrompt();
})

// function for viewing all employees in console
function viewAllEmployees() {
    dbConnection.query("SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS departments, roles.salary, CONCAT(e.first_name, ' ' ,e.last_name) AS manager FROM employees INNER JOIN roles ON roles.id = employees.role_id INNER JOIN departments ON departments.id = roles.department_id LEFT JOIN employees e ON employees.manager_id = e.id;",
        (err, results) => {
            if (err) {
                throw err;
            }
            console.table(results);
            mainPrompt();
        }
    );
}

// function for adding a new employee to database
function addEmployee() {
    let managerArr = [];
    let roleArr = [];

    // query for selecting managers from employees table
    dbConnection.query('SELECT first_name, last_name FROM employees WHERE manager_id IS NULL',
        (err, results) => {
            if (err) throw err;
            results.map(manager =>
                managerArr.push(`${manager.first_name} ${manager.last_name}`));
            return managerArr;
        }
    );

    // query for selecting role titles from database
    dbConnection.query('SELECT * FROM roles', (err, results) => {
        if (err) throw err;
        results.map(roles => roleArr.push(`${roles.title}`));
        return roleArr;
    });
    // prompt for entering new employee information
    inquirer
        .prompt([
            {
                type: 'input',
                message: "What is the employee's first name?",
                name: 'first_name',
            },
            {
                type: 'input',
                message: "What is the employee's last name?",
                name: 'last_name',
            },
            {
                type: 'rawlist',
                message: "What is the employee's role?",
                name: 'role',
                choices: roleArr,
            },
            {
                type: 'rawlist',
                message: "Who is the employee's manager?",
                name: 'manager',
                choices: managerArr,
            },
        ])
        .then(results => {
            //variables set for role and manager id so tables can be connected in same function
            const role_id = roleArr.indexOf(results.role) + 1;
            const manager_id = managerArr.indexOf(results.manager) + 1;

            //variable for new employees
            const newEmployee = {
                first_name: results.first_name,
                last_name: results.last_name,
                manager_id: manager_id,
                role_id: role_id,
            };

            //insert new employee into database
            dbConnection.query('INSERT INTO employees SET ?', newEmployee, err => {
                if (err) throw err;
                mainPrompt();
            });
        });
}

// function for updating employee role with salary and department
function updateEmployeeRole() {
    let employeeArr = [];
    let roleArr = [];

    promiseMySql
        .createConnection(dbConnectionProperties)
        .then(conn => {
            return Promise.all([
                conn.query('SELECT id, title FROM roles ORDER BY title ASC'),
                conn.query("SELECT employees.id, CONCAT(employees.first_name, ' ', employees.last_name) AS Employee from employees ORDER BY Employee ASC"),
            ]);
        })
        .then(([roles, employees]) => {
            roles.map(roles => roleArr.push(roles.title));

            employees.map(employees => employeeArr.push(employees.Employee));

            return Promise.all([roles, employees]);
        })
        .then(([roles, employees]) => {
            inquirer
                .prompt([
                    {
                        type: 'list',
                        message: "Which employee's role do you want to update?",
                        name: 'employee',
                        choices: employeeArr
                    },
                    {
                        type: 'list',
                        message: 'Which role would you like assigned to the employee?',
                        name: 'role',
                        choices: roleArr
                    },
                ])
                .then(results => {
                    let role_id;
                    let employee_id;

                    for (let i = 0; i < roles.length; i++) {
                        if (results.role == roles[i].title) {
                            role_id = roles[i].id;
                        }
                    }

                    for (let i = 0; i < employees.length; i++) {
                        if (results.employee == employees[i].Employee) {
                            employee_id = employees[i].id;
                        }
                    }
                    // update role values
                    dbConnection.query(`UPDATE employees SET role_id = ${role_id} WHERE id = ${employee_id}`,
                        (err, results) => {
                            if (err) return err;
                            mainPrompt();
                        }
                    );
                });
        });
}

// function for viewing roles with id, title and salary shown
function viewAllRoles() {
    dbConnection.query('SELECT roles.id, roles.title, roles.salary FROM roles',
        (err, results) => {
            if (err) {
                throw err;
            }
            console.table(results);
            mainPrompt();
        }
    );
}

// function for adding new role with choices for department and salary
function addRole() {
    let departmentArr = [];

    promiseMySql
        .createConnection(dbConnectionProperties)
        .then(conn => {
            return conn.query('SELECT departments.id, departments.name FROM departments');
        })
        .then(results => {
            results.map(result => departmentArr.push(result.name));
            return results;
        })
        .then(results => {
            inquirer
                .prompt([
                    {
                        type: 'input',
                        message: 'What is the name for this new role?',
                        name: 'role',
                    },
                    {
                        type: 'number',
                        message: 'What is the salary for this new role?',
                        name: 'salary',
                    },
                    {
                        type: 'list',
                        message: 'What department is this new role in?',
                        name: 'department',
                        choices: departmentArr,
                    },
                ])
                .then(answer => {
                    let department_id;

                    for (let i = 0; i < results.length; i++)
                        if (answer.departments = results[i].name) {
                            department_id = results[i].id;
                        }
                    // department id, salary and role added to table
                    dbConnection.query(`INSERT INTO roles (title, salary, department_id) VALUES ('${answer.role}', ${answer.salary}, ${department_id})`,
                        (err, res) => {
                            if (err) throw err;
                            mainPrompt();
                        }
                    );
                });
        });
}

function viewAllDepartments() {
    dbConnection.query("SELECT id, name AS 'Deparment Name' FROM departments",
        (err, results) => {
            if (err) {
                throw err;
            }
            console.table(results);
            mainPrompt();
        }
    );
}

function addDepartment() {
    inquirer
        .prompt([
            {
                type: 'input',
                message: 'What is the department you want to add?',
                name: 'department',
            },
        ])
        .then(answer => {
            dbConnection.query(`INSERT INTO departments (name) VALUES ('${answer.department}')`,
                (err, results) => {
                    if (err) throw err;
                    mainPrompt();
                }
            )
        })
}