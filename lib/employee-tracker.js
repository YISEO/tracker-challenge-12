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

                break;
            case "Add a role":

                break;
            case "Add an employee":
                
                break;
            case "Update an employee role":
                
                break;
            case "Quit":
                process.exit();
        }
    })
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
    })
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
    })
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
    })
};


module.exports = initialPrompt;