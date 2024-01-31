import { UserButton } from "@clerk/nextjs"

export default function Navbar() {
    return (
        <div className="flex justify-between py-2">
            <h1 className="font-bold">Aiamano</h1>
            <ul className="flex gap-2">
                <UserButton afterSignOutUrl="/" />
            </ul>
        </div>
    );
}
