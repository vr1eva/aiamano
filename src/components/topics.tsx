import { currentUser } from "@clerk/nextjs/server";
import { Topic } from "@/types"
import Link from "next/link"


export default async function Topics({ topics }: { topics: Topic[] }) {
    const user = await currentUser()
    if (!user) {
        return null
    }

    return (
        <>
            <h1 className="text-xl">Hello, {user.firstName}. What would you like to talk about?</h1>
            <ul className="flex gap-2">
                {topics.map(({ name, color, assistantId }) => (
                    <Link className="hover:underline" href={"/assistant/" + assistantId} key={assistantId} style={{ color, backgroundColor: name === "filmmaking" ? "black" : "white" }}>{name}</Link>
                ))}
            </ul>
        </>
    )
}