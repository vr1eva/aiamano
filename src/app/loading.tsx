import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Loading() {
  return <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <p className="text-lg flex gap-2 items-center"> <LoadingSpinner />Loading...</p>
  </div>
}