const pc = require("picocolors");
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function destroy() {
  const assistants = await openai.beta.assistants.list();
  assistants.data.map(async (assistant) => {
    const { success: assistantDeleted, response } = await deleteAssistant({
      assistantId: assistant.id,
    });
    if (!assistantDeleted || !response) {
      console.error("Failed to delete assistants");
      return { success: false };
    }

    console.log(pc.red(assistant.name), " was removed from OpenAI.");
  });
}

async function deleteAssistant({ assistantId }) {
  const response = await openai.beta.assistants.del(assistantId);
  if (!response) {
    console.error(
      "There was an error deleting the assitant with id ",
      assistantId
    );
    return { success: false };
  }
  return {
    success: true,
    response,
  };
}

destroy();
