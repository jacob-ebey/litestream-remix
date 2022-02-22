import { redirect, useLoaderData } from "remix";
import type { ActionFunction, HeadersFunction } from "remix";
import prisma from "~/prisma";

export const action: ActionFunction = async ({ request }) => {
  await prisma.$queryRaw`PRAGMA journal_mode = WAL;`;
  let count = (await prisma.post.count()) + 1;
  await prisma.post.create({
    data: {
      title: `Post ${count}`,
      body: `Post body ${count}`,
    },
  });

  return redirect("/", {
    headers: { "fly-replay": `region=${process.env.FLY_PRIMARY_REGION}` },
  });
};

export const headers: HeadersFunction = ({ actionHeaders }) => {
  return actionHeaders;
};

export const loader = async () => {
  await prisma.$queryRaw`PRAGMA journal_mode = WAL;`;
  let posts = await prisma.post.findMany();
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
