// test-ai.js
require("dotenv").config();
const aiService = require("./services/aiService");

(async () => {
  const sampleText =
    "Mitochondria are membrane-bound organelles found in most eukaryotic cells. They generate most of the cell's ATP through cellular respiration...";
  const result = await aiService.detectSubjectAndTopics(sampleText);
  console.log(result);
})();
