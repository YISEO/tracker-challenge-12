// Global variables
const inquirer = require("inquirer");
const db = require("../db/connection");

const initialPrompt = () => {
    inquirer.prompt([{
        type: "list",
        name: "options",
        message: "What would you like to do?",
        choices: [
            "View all departments",
            "View all roles",
            "View all employees",
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
            "Delete a department",
            "Delete a role",
            "Delete a employee",
            "Quit"
        ]
    }])
    .then(answers => {
        switch (answers.options) {
            case "View all departments":
                viewDepartments();
                break;
            case "View all roles":
                viewRoles();
                break;
            case "View all employees":
                viewEmployees();
                break;
            case "Add a department":
                addDepartment();
                break;
            case "Add a role":
                addRole();
                break;
            case "Add an employee":
                addEmployee();
                break;
            case "Update an employee role":
                updateEmployeeRole();
                break;
            case "Delete a department":
                deleteDepartment();
                break;
            case "Delete a role":
                deleteRole();
                break;
            case "Delete a employee":
                deleteEmployee();
                break;
            case "Quit":
                process.exit();
        }
    });
};

// View all departments
const viewDepartments = () => {
    db.query(`SELECT * FROM department`, (err, results) => {
        if(err){
            console.error(err);
            return;
        }

        console.table(results);
        initialPrompt();
    });
};

// View all roles
const viewRoles = () => {
    const sql = `SELECT role.id, title, department.name AS department, salary 
                 FROM role 
                 LEFT JOIN department ON role.department_id = department.id`;
                
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return;
        }

        console.table(results);
        initialPrompt();
    });
};

// View all employees
const viewEmployees = () => {
    const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title AS title, department.name AS department,
                 role.salary AS salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                 FROM employee
                 LEFT JOIN role ON employee.role_id = role.id
                 LEFT JOIN department ON role.department_id = department.id
                 LEFT JOIN employee AS manager ON employee.manager_id = manager.id`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return;
        }

        console.table(results);
        initialPrompt();
    });
};

// Add a department
const addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is the name of the department?"
        }
    ])
    .then(answer => {
        if(answer.name == "") {
            console.error("Please enter the name of department");
        }else{
            const sql = `INSERT INTO department (name) VALUES (?)`;
            const params = answer.name;
            db.query(sql, params, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(`Added ${params} to the database`);
                    initialPrompt();
                }
            });
        };
    });
};

// Add a role
const addRole = () => {
    let newRole;
    inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "What is the name of the role?"
        },
        {
            type: "input",
            name: "salary",
            message: "What is the salary of the role?"
        }
    ])
    .then(answer => {
        newRole = answer.title;

        if (answer.title == "" || answer.salary == ""){
            console.error("Please enter the name or salary of the role")
        }else{
            const params = [answer.title, answer.salary];
            const sql = `SELECT * FROM department`;

            db.query(sql, (err, rows) => {
                const departments = rows.map((department) => ({
                    name: department.name,
                    value: department.id
                }));

                inquirer.prompt([
                    {
                        type: "list",
                        name: "department",
                        message: "What department does this role belong to?",
                        choices: departments
                    }
                ])
                .then(departmentAnswer => {
                    const department = departmentAnswer.department;
                    params.push(department);

                    const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                    db.query(sql, params, (err) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log(`Added ${newRole} to the database`);
                            initialPrompt();
                        }
                    })
                })
            });
        };
    });
};

// Add an employee
const addEmployee = () => {
    let employeeFirstName, employeeLastName;
    inquirer.prompt([
        {
            type: "input",
            name: "first_name",
            message: "What is the employee's first name?"
        },
        {
            type: "input",
            name: "last_name",
            message: "What is the employee's last name?"
        }
    ])
    .then(answer => {
        employeeFirstName = answer.first_name;
        employeeLastName = answer.last_name;

        const params = [answer.first_name, answer.last_name];
        const sql = `SELECT * FROM role`;

        db.query(sql, (err, rows) => {
            const roles = rows.map((role) => ({
                name: role.title,
                value: role.id
            }));

            inquirer.prompt([
                {
                    type: "list",
                    name: "role",
                    message: "What is the employee's role?",
                    choices: roles
                }
            ])
            .then(roleAnswer => {
                const role = roleAnswer.role;
                params.push(role);

                const sql = `SELECT * FROM employee`;
                db.query(sql, (err, rows) => {
                    if (err) {
                        console.error(err);
                    }

                    const managers = rows.map((manager) => ({
                        name: `${manager.first_name} ${manager.last_name}`,
                        value: manager.id
                    }));

                    managers.push({name: "No Manager", value: null});
                    inquirer.prompt([
                        {
                            type: "list",
                            name: "manager",
                            message: "Who is the employee's manager?",
                            choices: managers
                        }
                    ])
                    .then(managerAnswer => {
                        const manager = managerAnswer.manager;
                        params.push(manager);

                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                        db.query(sql, params, (err) => {
                            if (err) {
                                console.error(err);
                            }
                            console.log(`Added ${employeeFirstName} ${employeeLastName} to the database`);
                            initialPrompt();
                        })
                    })
                });
            });
        });
    });
};


// Update an employee role
const updateEmployeeRole = () => {
    const sql = `SELECT first_name, last_name, id FROM employee`;
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        const employees = rows.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));

        inquirer.prompt([
            {
                type: "list",
                name: "employee",
                message: "Which employee's role do you want to update?",
                choices: employees
            }
        ])
        .then(answer => {
            const employee = answer.employee;
            const params = [employee];
            const sql = `SELECT title, id FROM role`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.error(err);
                }
                const roles = rows.map((role) => ({
                    name: role.title,
                    value: role.id
                }));

                inquirer.prompt([
                    {
                        type: "list",
                        name: "role",
                        message: "What is the new role of this employee?",
                        choices: roles
                    }
                ])
                .then(roleAnswer => {
                    const role = roleAnswer.role;
                    params.unshift(role);
                    const sql = `UPDATE employee SET role_id = ? WHERE id =?`;
                    
                    db.query(sql, params, (err) => {
                        if (err) {
                            console.error(err);
                        }

                        console.log("Updated employee's role");
                        initialPrompt();
                    })
                });
            });
        });
    });
};

// Delete a department
const deleteDepartment = () => {
    const sql = `SELECT * FROM department`;
    db.query(sql, (err, rows) => {
        if(err) {
            console.error(err);
        }

        const departments = rows.map((department) => ({
            name: department.name,
            value: department.id
        }));

        inquirer.prompt([
            {
                type: "list",
                name: "department",
                message: "Which department would you like to remove?",
                choices: departments
            }
        ])
        .then(answer => {
            const params = answer.department;
            const sql = `DELETE FROM department WHERE id = ?`

            db.query(sql, params, (err) => {
                if(err) {
                    console.error(err);
                }
                console.log("Deleted a department");
                initialPrompt();
            })
        })
    })
}


// Delete a role
const deleteRole = () => {
    const sql = `SELECT id, title FROM role`;
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
        }

        const roles = rows.map((role) => ({
            name: role.title,
            value: role.id
        }));

        inquirer.prompt([{
                type: "list",
                name: "role",
                message: "Which role would you like to remove?",
                choices: roles
            }])
            .then(answer => {
                const params = answer.role;
                const sql = `DELETE FROM role WHERE id = ?`

                db.query(sql, params, (err) => {
                    if (err) {
                        console.error(err);
                    }
                    console.log("Deleted a role");
                    initialPrompt();
                })
            })
    })
}


// Delete an employee
const deleteEmployee = () => {
    const sql = `SELECT first_name, last_name, id FROM employee`;
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
        }

        const employees = rows.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));

        inquirer.prompt([{
                type: "list",
                name: "employee",
                message: "Which employee would you like to remove?",
                choices: employees
            }])
            .then(answer => {
                const params = answer.employee;
                const sql = `DELETE FROM employee WHERE id = ?`

                db.query(sql, params, (err) => {
                    if (err) {
                        console.error(err);
                    }
                    console.log("Deleted an employee");
                    initialPrompt();
                })
            })
    })
}


module.exports = initialPrompt;