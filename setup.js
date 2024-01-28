const pc = require("picocolors");
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function addAssistant({
  assistantInformation: { instructions, name, tools, model, metadata },
}) {
  const openaiAssistant = await openai.beta.assistants.create({
    instructions,
    name,
    tools,
    model,
    metadata,
  });
  if (!openaiAssistant) {
    return {
      success: false,
    };
  }

  return {
    success: true,
    assistant: openaiAssistant,
  };
}

async function setup() {
  const cssTeacher = {
    instructions: "You are a CSS teacher that teaches on Harvard.",
    name: "Cascade",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl:
        "https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706070815/Cascade.png",
      duty: "css",
      chalk: "magenta",
    },
  };

  const englishProfessor = {
    instructions: "You are an English professor.",
    name: "Tony",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl: `https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706387031/Tony.png`,
      duty: "english",
      chalk: "red",
    },
  };

  const typeScriptDeveloper = {
    instructions: "You are a TypeScript senior developer.",
    name: "Algor",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl:
        "https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706070815/Algor.png",
      duty: "typescript",
      chalk: "blue",
    },
  };

  try {
    [
      cssTeacher,
      englishProfessor,
      typeScriptDeveloper,
      doctor,
      lawyer,
      plantExpert,
      director,
      mathTeacher,
      spanishTeacher,
    ].map(async (assistantInformation) => {
      const { assistant, success: assistantAddedInOpenai } = await addAssistant(
        { assistantInformation }
      );

      if (!assistantAddedInOpenai || !assistant) {
        console.error("There was an error adding assistant.");
        return { success: false };
      }
      console.log(
        assistantInformation.name + " was added to OpenAI. ",
        pc[assistant.metadata.chalk]("#" + assistantInformation.metadata.duty)
      );
    });
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

setup();
