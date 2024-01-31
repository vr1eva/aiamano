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
      pronouns: ["he", "him"]
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
      pronouns: ["he", "him"]
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
      pronouns: ["he", "him"]
    },
  };

  const doctor = {
    instructions: "You are a General Medicine Doctor.",
    name: "Doc",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo-1106",
    metadata: {
      avatarUrl:
        "https://res.cloudinary.com/dpm6zdvxy/image/upload/v1706070815/Doc.png",
      duty: "medicine",
      chalk: "cyan",
      pronouns: ["he", "him"]
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
      pronouns: ["he", "him"]
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
      pronouns: ["he", "him"]
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
      pronouns: ["he", "him"]
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
      pronouns: ["he", "him"]
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
      pronouns: ["he", "him"]
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
