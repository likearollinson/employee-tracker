-- Department seeds
INSERT INTO
  departments (name)
VALUES
  ("Sales"),
  ("Engineering"),
  ("Finance"),
  ("Legal");
-- Role seeds
INSERT INTO
  roles (department_id, title, salary)
VALUES
  (1, "Sales Lead", 100000),
  (1, "Salesperson", 80000),
  (2, "Lead Engineer", 150000),
  (2, "Software Engineer", 120000),
  (3, "Accountant Manager", 160000),
  (3, "Accountant", 125000),
  (4, "Legal Team Lead", 250000),
  (4, "Lawyer", 190000);
-- Employee seeds
INSERT INTO
  employees (first_name, last_name, role_id, manager_id)
VALUEs
  ("John", "Doe", 1, null),
  ("Mike", "Chan", 2, 1),
  ("Ashley", "Rodriguez", 3, null),
  ("Kevin", "Tupik", 4, 3),
  ("Anthony", "Singh", 5, null),
  ("Malia", "Brown", 6, 5),
  ("Sarah", "Lourd", 7, null),
  ("Tom", "Allen", 8, 7);