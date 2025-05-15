// cypress/e2e/todo_add.cy.js
describe("Adding a new todo item", () => {
  let uid;
  let name;
  let email;
  let taskId;

  before(function () {
    // Create a test user and task
    cy.fixture("user.json").then((user) => {
      cy.request({
        method: "POST",
        url: "http://localhost:5000/users/create",
        form: true,
        body: user,
      }).then((response) => {
        uid = response.body._id.$oid;
        email = user.email;
        name = user.firstName + " " + user.lastName;
      });
    });
  });

  beforeEach(function () {
    // Login and navigate to the task
    // Create a test task
    const taskData = {
      title: "Task",
      description: "Task created for testing",
      userid: uid,
      url: "https://www.youtube.com/watch?v=u8vMu7viCm8",
      todos: "Task",
    };

    cy.request({
      method: "POST",
      url: "http://localhost:5000/tasks/create",
      form: true,
      body: taskData,
    }).then((taskResponse) => {
      taskId = taskResponse.body[0]._id.$oid;
      const toDodData = {
        taskid: taskId,
        description: "Task to active again",
        done: "true",
      };

      cy.request({
        method: "POST",
        url: "http://localhost:5000/todos/create",
        form: true,
        body: toDodData,
      });
    });
    cy.wait(1000);

    cy.visit("http://localhost:3000");
    cy.contains("div", "Email Address").find("input[type=text]").type(email);
    cy.get("form").submit();
    cy.get("h1").should("contain.text", "Your tasks, " + name);
    cy.get(".container-element").find("img").click();
    cy.get(".todo-list").should("exist");
  });

  it("should add a new todo item when description is not empty", () => {
    const newTodoText = "New test todo item";

    // Add new todo
    cy.get('.inline-form input[type="text"]').type(newTodoText, {
      force: true,
    });

    cy.get('.inline-form input[type="submit"]').click({ force: true });

    // Verify the new todo is added
    cy.get(".todo-list li").should("have.length", 3);
    cy.contains(".todo-list li", newTodoText).should("exist");
  });

  it("should keep add button disabled when description is empty", () => {
    cy.get('.inline-form input[type="submit"]').should("be.disabled");
    cy.get('.inline-form input[type="text"]').type(" ", { force: true });
    cy.get('.inline-form input[type="submit"]').should("be.disabled");
  });

  it("should toggle todo item status when clicked", () => {
    cy.get(".todo-item")
      .contains("Task")
      .parents(".todo-item")
      .within(() => {
        cy.get(".checker").click().should("have.class", "checked");
      });
  });

  it("should toggle todo item status when clicked to actice", () => {
    cy.get(".todo-item")
      .contains("Task to active again")
      .parents(".todo-item")
      .within(() => {
        cy.get(".checker").click().should("have.class", "unchecked");
      });
  });

  it("R8UC3 – Delete a todo item", () => {
    cy.intercept("DELETE", "/todos/byid/*").as("deleteTodo");

    cy.contains(".todo-item", "Task to active again")
      .as("todoItem")
      .should("exist");

    cy.get("@todoItem").find("span.remover").click({ force: true });

    cy.wait("@deleteTodo");

    cy.contains(".todo-item", "Task to active again", { timeout: 7000 }).should(
      "not.exist"
    );
  });

  afterEach(function () {
    // Clean up
    cy.request({
      method: "DELETE",
      url: `http://localhost:5000/tasks/byid/${taskId}`,
    });
  });
  after(function () {
    // Clean up
    cy.request({
      method: "DELETE",
      url: `http://localhost:5000/users/${uid}`,
    });
  });
});
