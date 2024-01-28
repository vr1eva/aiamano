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
  const cssAssistant = {
    instructions: "You are a CSS assistant.",
    name: "Cascade",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl:
        "https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706070815/Cascade.png",
      learningPath: "css",
      chalk: "magenta",
    },
  };

  const englishTeacher = {
    instructions: "You are an English assistant.",
    name: "Tony",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl: `https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706387031/Tony.png`,
      learningPath: "english",
      chalk: "red",
    },
  };

  const tsAssistant = {
    instructions: "You are a TypeScript assistant.",
    name: "Algor",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl:
        "https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706070815/Algor.png",
      learningPath: "typescript",
      chalk: "blue",
    },
  };

  try {
    [cssAssistant, englishTeacher, tsAssistant].map(
      async (assistantInformation) => {
        const { assistant, success: assistantAddedInOpenai } =
          await addAssistant({ assistantInformation });

        if (!assistantAddedInOpenai || !assistant) {
          console.error("There was an error adding assistant.");
          return { success: false };
        }
        console.log(
          assistantInformation.name + " was added to OpenAI. ",
          pc[assistant.metadata.chalk](
            "#" + assistantInformation.metadata.learningPath
          )
        );
      }
    );
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

setup();
