export default function AudioPage({
    params: { id },
}: {
    params: { id: number };
}) {
    return <div className="card">{id}</div>;
}