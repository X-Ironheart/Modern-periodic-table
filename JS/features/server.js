require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

app.use(express.static("public"));

module.exports = {
  AiFoundation: function AiFoundation() {
    app.post("/api/chat", async (req, res) => {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.HYDROGEN_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ content: req.body.message }],
          }),
        },
      );
      const data = await response.json();
      res.json(data);
    });

    app.listen(process.env.PORT || 3000, () =>
      console.log("Server worked on http://localhost:3000"),
    );
  },
};
