/* eslint-disable no-undef */

describe("BotEditor", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8080");
    cy.get("input#botName").type("Test Bot");
    cy.get("span#createNewBot").click();
  });

  afterEach(() => {
    cy.get("i#home").click();
    // eslint-disable-next-line no-unused-vars
    cy.on("window:confirm", mess => {
      return true;
    });
    cy.get("i#deleteBot").then(deleteBots => {
      const deleteBot = deleteBots[0];
      deleteBot.click();
    });
  });

  // it("creates a bot and deletes it", () => {});

  it("creates a message and deletes it", () => {
    cy.get("div[id|='connectStarter-first']").click();
    cy.get("p#addNode").then(nodes => {
      nodes[0].click();
    });
    cy.get("div#simpleTmp3").click();
    cy.get("div#simpleTmp3")
      .find("div[class='menu delete-node']")
      .click();

    cy.get("div#simpleTmp3").should("not.exist");
  });
});
