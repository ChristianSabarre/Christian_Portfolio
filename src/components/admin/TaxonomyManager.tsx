"use client";

import { useActionState, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import SubmitButton from "./SubmitButton";
import ConfirmSubmit from "./ConfirmSubmit";
import { deleteTaxonomyAction, saveTaxonomyAction, type ActionState } from "@/app/admin/actions";

export type TaxonomyItem = { id: number; name: string; order?: number; usage: number };

const initialState: ActionState = {};

export default function TaxonomyManager({
  kind,
  title,
  description,
  items,
  ordered = true,
}: {
  kind: "category" | "tag" | "platform";
  title: string;
  description: string;
  items: TaxonomyItem[];
  ordered?: boolean;
}) {
  const [state, formAction] = useActionState(saveTaxonomyAction, initialState);
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <section className="glass rounded-2xl">
      <div className="border-b border-line px-5 py-4">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>

      <ul className="divide-y divide-[color:var(--border)]">
        {items.map((item) =>
          editingId === item.id ? (
            <li key={item.id} className="px-5 py-3">
              <form
                action={(fd) => {
                  formAction(fd);
                  setEditingId(null);
                }}
                className="flex flex-wrap items-center gap-2"
              >
                <input type="hidden" name="kind" value={kind} />
                <input type="hidden" name="id" value={item.id} />
                <input
                  name="name"
                  defaultValue={item.name}
                  required
                  autoFocus
                  aria-label="Name"
                  className="field !w-auto flex-1"
                />
                {ordered ? (
                  <input
                    name="order"
                    type="number"
                    min={0}
                    defaultValue={item.order ?? 0}
                    aria-label="Sort order"
                    className="field !w-20"
                  />
                ) : null}
                <SubmitButton className="btn btn-primary" pendingLabel="Saving…">
                  <Check className="size-4" />
                </SubmitButton>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="btn btn-ghost"
                  aria-label="Cancel"
                >
                  <X className="size-4" />
                </button>
              </form>
            </li>
          ) : (
            <li key={item.id} className="flex items-center gap-3 px-5 py-3">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
              <span className="chip shrink-0">
                {item.usage} {item.usage === 1 ? "project" : "projects"}
              </span>
              <button
                type="button"
                onClick={() => setEditingId(item.id)}
                className="btn btn-ghost shrink-0 size-9 !px-0"
                aria-label={`Rename ${item.name}`}
              >
                <Pencil className="size-4" />
              </button>
              <form action={deleteTaxonomyAction} className="shrink-0">
                <input type="hidden" name="kind" value={kind} />
                <input type="hidden" name="id" value={item.id} />
                <ConfirmSubmit
                  message={
                    item.usage > 0
                      ? `“${item.name}” is used by ${item.usage} project(s) and cannot be deleted until they are reassigned. Try anyway?`
                      : `Delete “${item.name}”?`
                  }
                  className="btn btn-danger size-9 !px-0"
                >
                  <Trash2 className="size-4" />
                </ConfirmSubmit>
              </form>
            </li>
          ),
        )}
      </ul>

      <form action={formAction} className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-4">
        <input type="hidden" name="kind" value={kind} />
        <input
          name="name"
          required
          placeholder={`New ${kind} name…`}
          aria-label={`New ${kind} name`}
          className="field !w-auto flex-1"
        />
        {ordered ? (
          <input
            name="order"
            type="number"
            min={0}
            defaultValue={items.length}
            aria-label="Sort order"
            className="field !w-20"
          />
        ) : null}
        <SubmitButton className="btn btn-primary" pendingLabel="Adding…">
          <Plus className="size-4" />
          Add
        </SubmitButton>
      </form>

      {state.message ? (
        <p
          role="status"
          className={`px-5 pb-4 text-xs ${state.ok ? "text-emerald-400" : "text-red-400"}`}
        >
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
