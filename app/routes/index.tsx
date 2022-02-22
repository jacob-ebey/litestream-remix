import { json, useLoaderData } from "remix";
import type { ActionFunction, HeadersFunction } from "remix";
import prisma from "~/prisma";

export const action: ActionFunction = async ({ request }) => {
  let count = (await prisma.post.count()) + 1;
  await prisma.post.create({
    data: {
      title: `Post ${count}`,
      body: `Post body ${count}`,
    },
  });

  return json(null, {
    headers: { "fly-replay": `region=${process.env.FLY_PRIMARY_REGION}` },
  });
};

export const headers: HeadersFunction = ({ actionHeaders }) => {
  return actionHeaders;
};

export const loader = async () => {
  return await prisma.post.count();
};

export default function Index() {
  let count = useLoaderData();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>{count} Posts</h1>
      <form method="post" action="/?index">
        <button>Create New Post</button>
      </form>
    </div>
  );
}
