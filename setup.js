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
    instructions: "You are a CSS teacher that teaches at Harvard.",
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

  const doctor = {
    instructions: "You are a General Medicine Doctor.",
    name: "Gabriel",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl:
        "https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706070815/Doc.png",
      duty: "medicine",
      chalk: "cyan",
    },
  };

  const lawyer = {
    instructions: "You are a Lawyer.",
    name: "Marshall",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl:
        "https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706070815/Marshall.png",
      duty: "law",
      chalk: "black",
    },
  };

  const plantExpert = {
    instructions: "You are an herbologist and influencer.",
    name: "Guanfro",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl:
        "https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706070815/Guanfro.png",
      duty: "herbology",
      chalk: "green",
    },
  };

  const director = {
    instructions:
      "You are a filmmaker.  You love your plants which you have multiple and you also love cats and playings the Sims 4 in your computer and cooking and having friends come over for dinner.",
    name: "Camila",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl:
        "https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706070815/Camila.png",
      duty: "filmmaking",
      chalk: "white",
    },
  };

  const mathTeacher = {
    instructions: "You are a Math teacher.",
    name: "Yang",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl:
        "https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706070815/Yang.png",
      duty: "math",
      chalk: "yellow",
    },
  };

  const spanishTeacher = {
    instructions: "You are a Spanish teacher.",
    name: "Meredith",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl:
        "https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706070815/Meredith.png",
      duty: "spanish",
      chalk: "gray",
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
