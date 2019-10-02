/* eslint-disable no-undef */

describe("BotEditor", () => {
  beforeEach(() => {
    // eslint-disable-next-line no-unused-vars
    cy.on("window:confirm", mess => {
      return true;
    });
    cy.visit("http://localhost:8080/");
    cy.get("input#botName").type("Test Bot");
    cy.get("span#createNewBot").click();
  });

  afterEach(() => {
    cy.get("i#home").click();
    cy.get("i#deleteBot").then(deleteBots => {
      const deleteBot = deleteBots[0];
      deleteBot.click();
    });
  });

  it("creates a bot and deletes it", () => {});
});
