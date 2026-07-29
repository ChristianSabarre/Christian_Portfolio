"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import SubmitButton from "./SubmitButton";
import ConfirmSubmit from "./ConfirmSubmit";
import { deleteLinkCardAction, saveLinkCardAction, type ActionState } from "@/app/admin/actions";

export type LinkCardItem = {
  id: number;
  kind: "NEWSLETTER" | "FOOTER" | "SOCIAL";
  label: string;
  title: string;
  description: string;
  url: string;
  order: number;
  published: boolean;
};

const initialState: ActionState = {};

const KIND_LABELS: Record<LinkCardItem["kind"], string> = {
  NEWSLETTER: "Newsletter card",
  FOOTER: "Footer link",
  SOCIAL: "Social link",
};

function CardFields({ item }: { item?: LinkCardItem }) {
  return (
    <>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Type</label>
          <select name="kind" defaultValue={item?.kind ?? "NEWSLETTER"} className="field cursor-pointer">
            {(Object.keys(KIND_LABELS) as LinkCardItem["kind"][]).map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">
            Eyebrow <span className="font-normal text-faint">(optional)</span>
          </label>
          <input name="label" defaultValue={item?.label ?? ""} className="field" />
        </div>
      </div>

      <div>
        <label className="label">Title</label>
        <input name="title" defaultValue={item?.title ?? ""} required className="field" />
      </div>

      <div>
        <label className="label">
          Description <span className="font-normal text-faint">(newsletter cards only)</span>
        </label>
        <textarea
          name="description"
          defaultValue={item?.description ?? ""}
          rows={3}
          className="field resize-y"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
        <div>
          <label className="label">URL</label>
          <input
            name="url"
            type="url"
            defaultValue={item?.url ?? ""}
            required
            placeholder="https://…"
            className="field"
          />
        </div>
        <div>
          <label className="label">Order</label>
          <input name="order" type="number" min={0} defaultValue={item?.order ?? 0} className="field" />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={item?.published ?? true}
          className="size-4 accent-[color:var(--accent)]"
        />
        Visible on the public site
      </label>
    </>
  );
}

export default function LinkCardManager({ items }: { items: LinkCardItem[] }) {
  const [state, formAction] = useActionState(saveLinkCardAction, initialState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {state.message ? (
        <p
          role="status"
          className={`rounded-lg border px-3 py-2 text-sm ${
            state.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      {items.map((item) =>
        editingId === item.id ? (
          <form
            key={item.id}
            action={(fd) => {
              formAction(fd);
              setEditingId(null);
            }}
            className="glass space-y-3 rounded-2xl p-5"
          >
            <CardFields item={item} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingId(null)} className="btn btn-ghost">
                Cancel
              </button>
              <SubmitButton />
            </div>
          </form>
        ) : (
          <div key={item.id} className="glass flex items-start gap-3 rounded-2xl p-5">
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-faint">
                {KIND_LABELS[item.kind]}
                {item.published ? "" : " · hidden"}
              </p>
              <p className="mt-1 truncate font-display font-semibold">{item.title}</p>
              {item.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>
              ) : null}
              <p className="mt-1.5 truncate font-mono text-xs text-accent">{item.url}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditingId(item.id)}
              className="btn btn-ghost size-9 shrink-0 !px-0"
              aria-label={`Edit ${item.title}`}
            >
              <Pencil className="size-4" />
            </button>
            <form action={deleteLinkCardAction} className="shrink-0">
              <input type="hidden" name="id" value={item.id} />
              <ConfirmSubmit message={`Delete “${item.title}”?`} className="btn btn-danger size-9 !px-0">
                <Trash2 className="size-4" />
              </ConfirmSubmit>
            </form>
          </div>
        ),
      )}

      {adding ? (
        <form
          action={(fd) => {
            formAction(fd);
            setAdding(false);
          }}
          className="glass space-y-3 rounded-2xl p-5"
        >
          <CardFields />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAdding(false)} className="btn btn-ghost">
              <X className="size-4" />
              Cancel
            </button>
            <SubmitButton pendingLabel="Adding…">Add card</SubmitButton>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="btn btn-primary">
          <Plus className="size-4" />
          Add link card
        </button>
      )}
    </div>
  );
}
