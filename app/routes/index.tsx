import { redirect, useLoaderData } from "remix";
import prisma from "~/prisma";

export const action = async () => {
  let count = (await prisma.post.count()) + 1;
  await prisma.post.create({
    data: {
      title: `Post ${count}`,
      body: `Post body ${count}`,
    },
  });

  return redirect("/");
};

export const loader = async () => {
  let posts = prisma.post.findMany();
  return posts;
};

export default function Index() {
  let posts = useLoaderData();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      <form method="post" action="/?index">
        <button>Create New Post</button>
      </form>
      <ul>
        {posts.map((post: any) => (
          <li key={post.id}>
            {post.title} - {post.body}
          </li>
        ))}
      </ul>
    </div>
  );
}
