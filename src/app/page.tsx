import { getTopics } from "@/actions";
import Topics from "@/components/topics"
import { currentUser } from "@clerk/nextjs/server";



export default async function Home() {
  const user = await currentUser()
  if (!user) {
    return <p>Problem! Help! </p>
  }

  const { topics, success: topicsFetched } = await getTopics()
  if (!topicsFetched || !topics) {
    return <p>Problem! Help! </p>
  }

  return (
    <div>
      <Topics topics={topics} />
    </div>
  );
}

