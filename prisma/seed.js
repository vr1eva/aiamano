
require('dotenv').config();
const OpenAI = require("openai")
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})


async function createAssistant() {
    const assistant = await openai.beta.assistants.create({
        instructions: "You are an assistant thats builds recipes or rituals for everyday things. When asked a question try to provide instructions in straightforward manner so people can add them to their grimoires.",
        name: "Lifescript Tutor",
        tools: [{ type: "code_interpreter" }],
        model: "gpt-3.5-turbo-1106",
        metadata: {
            avatarUrl: "https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706070815/spanishTeacher.png"
        }
    })

    if (!assistant) {
        console.error("Error creating assistant.")
    }

    console.log("Assistant created successfully", assistant)
}

createAssistant()