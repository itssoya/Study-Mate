const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const officeParser = require("officeparser");

async function extractText(filePath, fileType) {
  switch (fileType) {
    case "pdf": {
      const buffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text;
    }

    case "docx": {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    case "pptx": {
      const ast = await officeParser.parseOffice(filePath);
      const result = await ast.to("text");
      return result.value; // pull the string out — this line is likely missing or wrong right now
    }
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

module.exports = { extractText };
