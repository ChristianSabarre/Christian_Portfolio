"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import SubmitButton from "./SubmitButton";
import { saveSiteSettingsAction, type ActionState } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/queries";

const initialState: ActionState = {};

function Field({
  name,
  label,
  defaultValue,
  hint,
  error,
  textarea,
  rows = 3,
}: {
  name: string;
  label: string;
  defaultValue: string;
  hint?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
        {hint ? <span className="ml-1.5 font-normal text-faint">{hint}</span> : null}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          rows={rows}
          className="field resize-y"
        />
      ) : (
        <input id={name} name={name} defaultValue={defaultValue} className="field" />
      )}
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

export default function SiteContentForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState(saveSiteSettingsAction, initialState);
  const err = (f: string) => state.errors?.[f];

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <p
          role="status"
          className={`rounded-lg border px-3 py-2 text-sm ${
            state.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {state.ok ? <Check className="mr-1 inline size-4" /> : null}
          {state.message}
        </p>
      ) : null}

      <section className="glass space-y-4 rounded-2xl p-5">
        <h2 className="font-display text-base font-semibold">Identity</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="siteTitle" label="Site title" defaultValue={settings.siteTitle} error={err("siteTitle")} />
          <Field name="ownerName" label="Owner name" defaultValue={settings.ownerName} error={err("ownerName")} />
        </div>
        <Field
          name="tagline"
          label="Footer tagline"
          defaultValue={settings.tagline}
          textarea
          rows={2}
          error={err("tagline")}
        />
      </section>

      <section className="glass space-y-4 rounded-2xl p-5">
        <h2 className="font-display text-base font-semibold">Hero</h2>
        <Field name="heroEyebrow" label="Eyebrow" defaultValue={settings.heroEyebrow} error={err("heroEyebrow")} />
        <Field
          name="heroHeadline"
          label="Headline"
          defaultValue={settings.heroHeadline}
          textarea
          rows={2}
          error={err("heroHeadline")}
        />
        <Field
          name="heroIntro"
          label="Intro paragraph"
          defaultValue={settings.heroIntro}
          textarea
          rows={4}
          error={err("heroIntro")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="heroCtaLabel" label="Primary button" defaultValue={settings.heroCtaLabel} error={err("heroCtaLabel")} />
          <Field
            name="heroCtaUrl"
            label="Primary button link"
            hint="(#projects for on-page)"
            defaultValue={settings.heroCtaUrl}
            error={err("heroCtaUrl")}
          />
          <Field name="heroAltLabel" label="Secondary button" defaultValue={settings.heroAltLabel} error={err("heroAltLabel")} />
          <Field name="heroAltUrl" label="Secondary button link" defaultValue={settings.heroAltUrl} error={err("heroAltUrl")} />
        </div>
      </section>

      <section className="glass space-y-4 rounded-2xl p-5">
        <h2 className="font-display text-base font-semibold">Stat counters</h2>
        <p className="-mt-2 text-xs text-muted">
          Leave a value blank to count it live from the database.
        </p>
        {([1, 2, 3] as const).map((n) => (
          <div key={n} className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <Field
              name={`statLabel${n}`}
              label={`Stat ${n} label`}
              defaultValue={settings[`statLabel${n}`]}
              error={err(`statLabel${n}`)}
            />
            <Field
              name={`statValue${n}`}
              label="Value"
              hint="(auto)"
              defaultValue={settings[`statValue${n}`] ?? ""}
              error={err(`statValue${n}`)}
            />
          </div>
        ))}
        <Field
          name="libraryHeading"
          label="Library section heading"
          defaultValue={settings.libraryHeading}
          error={err("libraryHeading")}
        />
      </section>

      <section className="glass space-y-4 rounded-2xl p-5">
        <h2 className="font-display text-base font-semibold">Newsletter section</h2>
        <Field name="newsletterEyebrow" label="Eyebrow" defaultValue={settings.newsletterEyebrow} error={err("newsletterEyebrow")} />
        <Field
          name="newsletterHeading"
          label="Heading"
          defaultValue={settings.newsletterHeading}
          textarea
          rows={2}
          error={err("newsletterHeading")}
        />
        <Field
          name="newsletterIntro"
          label="Intro"
          defaultValue={settings.newsletterIntro}
          textarea
          rows={3}
          error={err("newsletterIntro")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="newsletterCtaLabel" label="Button label" defaultValue={settings.newsletterCtaLabel} error={err("newsletterCtaLabel")} />
          <Field name="newsletterCtaUrl" label="Button link" defaultValue={settings.newsletterCtaUrl} error={err("newsletterCtaUrl")} />
        </div>
        <Field name="footerNote" label="Footer note" defaultValue={settings.footerNote} error={err("footerNote")} />
      </section>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
