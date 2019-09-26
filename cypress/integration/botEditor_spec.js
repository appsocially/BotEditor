/* eslint-disable no-undef */

describe("BotEditor", () => {
  it("creates a bot and deletes it", () => {
    cy.on("window:confirm", () => {
      return true;
    });

    cy.visit("http://localhost:8080/");
    cy.get("input#botName").type("Test Bot");
    cy.get("span#createNewBot").click();
    cy.get("i#home").click();
    cy.get("i#deleteBot").then(deleteBots => {
      const deleteBot = deleteBots[0];
      deleteBot.click();
    });
  });
});
