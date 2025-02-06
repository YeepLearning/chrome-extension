import { i } from "@instantdb/react";

const _schema = i.schema({
  // We inferred 2 attributes!
  // Take a look at this schema, and if everything looks good,
  // run `push schema` again to enforce the types.
  entities: {
    $files: i.entity({
      "content-disposition": i.string().indexed(),
      "content-type": i.string().indexed(),
      "key-version": i.number(),
      metadata: i.string(),
      path: i.string().indexed(),
      size: i.number().indexed(),
      status: i.string().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    conversations: i.entity({}),
    events: i.entity({
      name: i.string(),
      data: i.json(),
      createdAt: i.number(),
    }),
    messages: i.entity({
      content: i.string(),
      role: i.string(),
    }),
  },
  links: {
    messagesConversation: {
      forward: {
        on: "messages",
        has: "one",
        label: "conversation",
      },
      reverse: {
        on: "conversations",
        has: "many",
        label: "messages",
      },
    },
  },
  // If you use presence, you can define a room schema here
  // https://www.instantdb.com/docs/presence-and-topics#typesafety
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema { }
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
