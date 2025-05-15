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
    cy.get('.inline-form input[type="text"]').type(newTodoText);
    cy.get('.inline-form input[type="submit"]').click();

    // Verify the new todo is added
    cy.get(".todo-list li").should("have.length", 2); // Initial + new
    cy.contains(".todo-list li", newTodoText).should("exist");
  });

  it("should keep add button disabled when description is empty", () => {
    cy.get('.inline-form input[type="submit"]').should("be.disabled");
    cy.get('.inline-form input[type="text"]').type(" ");
    cy.get('.inline-form input[type="submit"]').should("be.disabled");
  });

  it("should toggle todo item status when clicked", () => {
    cy.get(".todo-item")
      .contains("Task") // looks for a todo item containing "task"
      .parents(".todo-item") // go up to the full todo item element
      .within(() => {
        cy.get(".checker")
          .click() // verify it's unchecked
          .should("have.class", "checked");
      });

    cy.get(".todo-item")
      .contains("Task") // looks for a todo item containing "task"
      .parents(".todo-item") // go up to the full todo item element
      .within(() => {
        cy.get(".checker")
          .click() // verify it's unchecked
          .should("have.class", "unchecked");
      });
  });

  it("R8UC3 – Delete a todo item", () => {
    // Interceptera DELETE-requesten
    cy.intercept("DELETE", "/todos/byid/*").as("deleteTodo");

    // Kontrollera att todo finns
    cy.contains(".todo-item", "Task").as("todoItem").should("exist");

    // Klicka på delete-knappen
    cy.get("@todoItem").find("span.remover").click();

    // Vänta tills DELETE-requesten är klar
    cy.wait("@deleteTodo");

    // Vänta på att DOM uppdateras efter borttagning
    cy.contains(".todo-item", "Task", { timeout: 7000 }).should("not.exist");
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
