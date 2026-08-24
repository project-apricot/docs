import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { CodeSample } from '@/components/code-sample';
import { docsUrl, getLibrary } from '@/lib/libraries';

/**
 * The landing's worked examples: one tab per library, each showing the two halves that make it
 * make sense — how it is declared and how it is called — then a way into the full docs.
 *
 * Every snippet is taken from that library's own usage page rather than invented.
 */

interface Panel {
  file: string;
  lang?: string;
  code: string;
}

interface Example {
  slug: string;
  panels: Panel[];
  note: string;
}

const EXAMPLES: Example[] = [
  {
    slug: 'data-ops',
    panels: [
      {
        file: 'Data/Authors.DataOps.xml',
        lang: 'xml',
        code: `<DataConfiguration Timeout="PT30S" Compatibility="PostgreSql" AutoTransaction="ReadCommitted" />

<OperationGroup Name="Authors">
  <SqlOperation Name="ById">
    <TextCommand ExpectedResult="Row">SELECT id, full_name FROM authors WHERE id = @Id</TextCommand>
  </SqlOperation>
  <SqlOperation Name="Create">
    <TextCommand ExpectedResult="RowCount">INSERT INTO authors (full_name) VALUES (@FullName)</TextCommand>
  </SqlOperation>
</OperationGroup>`,
      },
      {
        file: 'Data/AuthorRepository.cs',
        code: `var author = await dataOps.Connect().QueryFirst("Authors", "ById").ExecuteAsync<Author>(new { Id = id });

var affected = await dataOps.Connect().NonQuery("Authors", "Create").ExecuteAsync(newAuthor);`,
      },
    ],
    note: 'The call site names an operation; it never spells out SQL. Retuning a query, or adding a dialect for another engine, is an edit to the XML — and because the timeout and transaction level are declared alongside, they are reviewed with the statement rather than buried in code.',
  },
  {
    slug: 'discovery-client',
    panels: [
      {
        file: 'EmbeddedResources/services.yaml',
        lang: 'yaml',
        code: `services:
  billing:
    namespace: payments             # Kubernetes only
    domain: cluster.local           # Kubernetes only
    ports:
      - { protocol: http,  roles: [ 'api' ],  port: 11100 }
      - { protocol: https, roles: [ 'api' ],  port: 11101 }
      - { protocol: https, roles: [ 'grpc' ], port: 11105 }`,
      },
      {
        file: 'Billing/BillingClient.cs',
        code: `var url = await discovery.GetApiUrl("billing", $"/v1/customers/{customerId}/invoices");
var invoices = await http.GetFromJsonAsync<Invoice[]>(url);

// localhost + http -> http://localhost:11100/v1/customers/42/invoices
// k8s + https       -> https://billing.payments.svc.cluster.local:11101/v1/customers/42/invoices`,
      },
    ],
    note: 'The call site names a service and a path. Which host and port that becomes is a deployment concern, so promoting a build from localhost to Kubernetes changes configuration, not code — and there is no discovery server to run or keep alive.',
  },
  {
    slug: 'intl',
    panels: [
      {
        file: 'Translations/all.en.json',
        lang: 'json',
        code: `{
  "checkout.thanks": "Thanks, {name} — your order is on its way.",
  "errors.out_of_stock": "{product} is out of stock."
}`,
      },
      {
        file: 'Program.cs',
        code: `builder.Services.AddIntlCore(builder.Configuration);
builder.Services.AddJsonTranslationSource("en-US", () => File.OpenRead("Translations/all.en.json"));
builder.Services.AddJsonTranslationSource("hy-AM", () => File.OpenRead("Translations/all.hy.json"));`,
      },
      {
        file: 'Checkout/CheckoutController.cs',
        code: `// No locale argument — it is resolved from the current request.
var message = intl.Format("checkout.thanks", new Dictionary<string, object?> { ["name"] = customer.Name });`,
      },
    ],
    note: 'Translations are flat key-to-string files, and the locale for a request is resolved for you — so a controller formats a message without deciding whose language it is in. Pass a locale explicitly only where there is no ambient one, such as a background job.',
  },
  {
    slug: 'captcha',
    panels: [
      {
        file: 'Accounts/AccountController.cs',
        code: `// The endpoint declares what it needs. "AdminPortal" is a configured provider instance,
// so this surface can use its own key and policy without the client knowing.
[HttpPost("sign-in")]
[ValidateCaptcha(Provider = "AdminPortal", Policy = CaptchaValidationPolicy.High, AllowedActions = ["sign_in"])]
public Task<SignInResult> SignIn(SignInRequest request)
{
    return this.service.SignIn(request);
}`,
      },
      {
        file: 'Program.cs',
        code: `// Where there is no controller to attribute, ask the guard directly.
// EnsureAsync throws on failure; ValidateAsync returns the decision instead.
app.MapPost("/api/subscribe", async (HttpContext ctx, ICaptchaGuard guard, CancellationToken ct) =>
{
    await guard.EnsureAsync(ctx, new CaptchaRequirements(), options: null, ct);

    return Results.Accepted();
});`,
      },
    ],
    note: 'reCAPTCHA, hCaptcha and Turnstile behind one interface, with each provider’s answer normalised before it is judged. Provider instances are configuration, not code, so adding a second site key is a deployment change — and every instance is validated at startup rather than failing as a visitor’s problem.',
  },
  {
    slug: 'password-hasher',
    panels: [
      {
        file: 'Accounts/Register.cs',
        code: `var hash = hasher.Hash(password);

// The algorithm, salt and iteration count travel with the hash, so raising
// the work factor later invalidates nobody.
await users.CreateAsync(email, hash.AsHash());`,
      },
      {
        file: 'Accounts/SignIn.cs',
        code: `var result = hasher.Verify(user.PasswordHash, candidate);

if (!result.Verified)
{
    return Unauthorized();
}

if (result.NeedsUpgrade)
{
    // Verified means the plain password is in hand right now — the only moment a rehash is free.
    await users.UpdatePasswordHashAsync(user.Id, hasher.Hash(candidate).AsHash());
}`,
      },
    ],
    note: 'One PBKDF2-HMAC hash carries everything needed to verify it, including the parameters it was made with. That is what makes the upgrade path work: verification reports a hash that is behind, and the sign-in that discovered it is the one request able to fix it.',
  },
];

const TAB_LABELS = EXAMPLES.map((example) => getLibrary(example.slug)?.name ?? example.slug);

function CodePanel({ panel }: { panel: Panel }) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <p className="border-b border-fd-border px-4 py-2 font-mono text-xs text-fd-muted-foreground">
        {panel.file}
      </p>
      <CodeSample code={panel.code} lang={panel.lang} className="grow" />
    </div>
  );
}

export function FeatureTabs() {
  return (
    <Tabs items={TAB_LABELS}>
      {EXAMPLES.map((example, index) => {
        const library = getLibrary(example.slug);

        return (
          <Tab key={example.slug} value={TAB_LABELS[index]}>
            <div className="flex flex-col gap-4">
              {example.panels.map((panel) => (
                <CodePanel key={panel.file} panel={panel} />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <p className="max-w-3xl text-sm leading-relaxed text-fd-muted-foreground">
                {example.note}
              </p>
              {library ? (
                <Link
                  href={docsUrl(library)}
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-fd-primary hover:underline"
                >
                  {library.name} docs
                  <ArrowRight className="size-3.5" />
                </Link>
              ) : null}
            </div>
          </Tab>
        );
      })}
    </Tabs>
  );
}
