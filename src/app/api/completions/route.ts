import {openai} from "@/openai"

export async function POST(request: Request) {
  const {messages} = await request.json()

    const completion = await openai.chat.completions.create({
        messages,
        model: "gpt-3.5-turbo",
    });
   
    return Response.json({completion: completion.choices[0]})
  }