import { Topic } from "@/types"
import Link from "next/link"


export default async function Topics({ topics }: { topics: Topic[] }) {

    return (
        <>
            <h1 className="text-xl">Hello, what would you like to talk about?</h1>
            <ul className="flex gap-2">
                {topics.map(({ name, color, assistantId }) => (
                    <Link className="hover:underline" href={"/assistant/" + assistantId} key={assistantId} style={{ color, backgroundColor: name === "filmmaking" ? "black" : "white" }}>{name}</Link>
                ))}
            </ul>
        </>
    )
}