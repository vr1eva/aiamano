require("dotenv").config();
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const { PrismaClient } = require("@prisma/client");
export const prisma = new PrismaClient();

async function addAssistant({ assistant }) {
  const openaiAssistant = await openai.beta.assistants.create({
    instructions: assistant.instructions,
    name: assistant.name,
    tools: assistant.tools,
    model: assistant.model,
    metadata: assistant.metadata,
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
    },
  };

  const englishTeacher = {
    instructions: "You are an English assistant.",
    name: "Tony",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl: `https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706387031/Tony.png`,
    },
  };

  const jsAssistant = {
    instructions: "You are a TypeScript assistant.",
    name: "Algor",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl:
        "https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706070815/Algor.png",
    },
  };

  try {
    [cssAssistant, englishTeacher, jsAssistant].map(
      async (assistantInformation) => {
        const { assistant, success: assistantAddedInOpenai } =
          await addAssistant({ assistant });
        if (!assistantAddedInOpenai || !assistant) {
          console.error("There was an error adding the assistant.");
          return { success: false };
        }
        console.log(assistant.name + " was added to OpenAI.");

        const avatar = await prisma.avatar.create({
          openaiId: assistant.id,
          avatarUrl: assistantInformation.metadata.avatarUrl,
        });
        if (!avatar) {
          return {
            success: false,
          };
        }
        console.log(assistant.name + " avatar created in Prisma.");
      }
    );
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

setup();
