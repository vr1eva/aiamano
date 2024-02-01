import { UserButton } from "@clerk/nextjs"
import Link from "next/link"

export default function Navbar() {
    return (
        <div className="flex justify-between">
            <Link href="/"><h1 className="font-bold">Aiamano</h1></Link>
            <ul className="flex gap-2">
                <UserButton afterSignOutUrl="/" />
            </ul>
        </div>
    );
}
