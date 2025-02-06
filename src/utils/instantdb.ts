"use client";

import { id, i, init, InstaQLEntity } from "@instantdb/react";

const APP_ID = "dd29d8b1-ea0c-413b-80ee-754f260947c4"

// Optional: Declare your schema!
const schema = i.schema({
    entities: {
        event: i.entity({
            name: i.string(),
            data: i.json(),
            createdAt: i.number(),
        }),
    },
});

export type Event = InstaQLEntity<typeof schema, "event">;

const db = init({ appId: APP_ID, schema });

export function logEvent(name: string, event: Partial<Event>) {
    db.transact(
        db.tx.event[id()].update({
            ...event,
            name,
            createdAt: Date.now()
        })
    );
}

export default db;