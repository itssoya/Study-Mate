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
      const result = await officeParser.parseOffice(filePath);
      return result.to("text");
    }
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

module.exports = { extractText };
