import Assistants from "@/components/assistants"

export default async function Admin() {
    return (
        <Dashboard />
    )
}

async function Dashboard() {
    return (
        <main>
            <Assistants />
        </main>
    )
}