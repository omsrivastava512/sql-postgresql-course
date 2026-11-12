# Research log: personalized offers and pricing

Started, expanded and checked 2 Nov 2026. The user's goal is a broad, connected business-app investigation, including actual database records and backend behavior. The first pass was marked complete too early relative to the comparative depth requested. The deliverables remain this log and the [report](How%20business%20apps%20personalize%20offers%20and%20prices.md), with inline SQL and verified numerical and concurrency scenarios. The expansion covers retail/marketplaces, travel, subscriptions/retention, loyalty/referrals, dedicated promotion engines, B2B pricing and five open-source implementations. The final acceptance record appears at the end.

## Repository and scope

Preflight on 2 Nov 2026: authoritative remote `omsrivastava512/sql-postgresql-course`, default `main`, live head `9fbadbedca2e2828d619d9d47b47a6f31baf0887`. Local `main` at `d7c95fb` was 6 ahead / 0 behind. Additional commits include `60da999` for the prior catalog walkthrough and course work through `d7c95fb`. Searches for promotion/personalization/discount/coupon issues, PRs and remote commits found no matching work. No update or Git mutation was performed.

Unrelated user changes at preflight: `tests/cases.json`, `tests/verify-sessions.mjs`, untracked articles 30–32 and labs 30–32. Do not edit, stage or overwrite them. The approved scope is only this new research folder.

## Coverage matrix

| Question | Evidence / coverage | Limits |
| --- | --- | --- |
| Same app, contextual decisions and caching | OpenFeature contextual evaluation; historical Swiggy XP, WiRa widget scores and POP business layer; synthetic request/response, identity, facts and cache failure | The historical systems are not combined into a fabricated Swiggy call graph; current internals unknown |
| Campaign definitions, audiences, code and redemption | Swiggy partner configuration; Shopify, Stripe, Instacart and eBay contracts; five pinned commerce codebases and a vendor SDK; synthetic records | Only specifically described method paths were traced; third-party applications were not executed; private internals remain unknown |
| Candidate selection, presentation and targeting | DoorDash causal targeting, Target CORE, Swiggy XP, RevenueCat first-match/default, Booking.com context, Talon.One and Voucherify contracts; distinct exposure records | Provider contracts, engineering accounts and synthetic examples have different evidence strength; no measured private app reconstruction |
| Business objectives, targeting and experiments | DoorDash incremental lift, Swiggy allocation, treatment/control arithmetic and caveats | No claim that a model proves an individual order's counterfactual |
| Base price, fee, stacking and allocation | commercetools price scopes, scoped Uber policy, Shopify combination fields, Adobe checkout-dependent rules; synthetic bill and partial return | Example tax, funding and rule precedence are invented and jurisdiction-dependent |
| Checkout, usage limits, budgets and funding | Cancellation, idempotency and payment sources; SQL executed on PostgreSQL 17.11; two actual sessions tested commit and rollback contention | Single-counter test does not prove entire checkout/payment/refund workflow is race-safe |
| Operational recovery and explanations | Adobe tracking incident, Stripe webhook duplicate/order guidance, synthetic failure and support traces | Exact provider retry limits and private support systems vary; no universal recovery policy asserted |

## Source register: opened 2 Nov 2026

| Source | Evidence and access | Use / limits |
| --- | --- | --- |
| [Swiggy XP part 1](https://medium.com/swiggy-bytes/experimentation-platform-xp-at-swiggy-part-1-e50b7dbdc773) | Body opened; 12 Oct 2021; promotion experiments, consumer/user/device/session units and allocation | Cited as historical evidence; does not show current end-to-end promotion path |
| [DoorDash causal promotions](https://careersatdoordash.com/blog/doordash-smarter-promotions-with-causal-machine-learning/) | Body opened; 16 Dec 2025; uplift and constrained optimization | Cited; do not generalize to all companies or promotions |
| [commercetools pricing and discounts](https://docs.commercetools.com/api/pricing-and-discounts-overview) | Body opened; variant price scope and discount separation | Cited as public contract; not proof of internal database layout |
| [commercetools discount codes](https://docs.commercetools.com/merchant-center/discount-codes) | Body opened; overall/per-customer limits and non-restoration upon cancellation | Cited as platform-specific behavior |
| [Shopify discounts](https://shopify.dev/docs/apps/build/discounts) | Page opened during planning; automatic and code discounts | Cited for documented public behavior; inspect full policy details before comparison |
| [OpenFeature evaluation context](https://openfeature.dev/specification/sections/evaluation-context/) | Body opened; contextual targeting key and custom fields | Cited as an analogue for flags, not a Swiggy promotion implementation |
| [Uber US principles](https://tb-static.uber.com/prod/uber-static/uber-sites/_pdf/ai-on-uber/Pricing_Principles_one-pager.pdf) | PDF body opened, including scope footnote, company statement with explicit US/Uber-set-price scope | Cited with narrow scope; third-party menu prices and other countries expressly outside its generalization |
| [Adobe Commerce tracking discrepancy](https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-25898) | Body opened; usage-update consumer and no retroactive correction | Cited as an operational case, dated 18 Aug 2026 |
| [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests) | Body opened; API retry and parameter comparison behavior | Cited as provider-specific behavior; does not implement merchant-side idempotency |
| [Stripe webhooks](https://docs.stripe.com/webhooks) | Body opened; event IDs and non-guaranteed ordering | Cited for provider-specific delivery behavior |
| Medusa `f7add009dd2f142d98090a5194750e71b2147ddf` promotion models | Raw page-reader requests missed cache; GitHub contents API subsequently returned `promotion.ts`, `campaign.ts`, `campaign-budget.ts`, `campaign-budget-usage.ts`, `promotion-rule.ts`, `promotion-rule-value.ts`, `application-method.ts` | Read all seven model files; cited exact pinned model paths. `services/promotion-module.ts` inspected at relevant `registerUsage`, `revertUsage` and `computeActions` excerpts; not executed |
| Magento `16f4fa211bfdecda84c3e7d475f1514780b170c6` `app/code/Magento/SalesRule/etc/db_schema.xml` | Raw page-reader request missed cache; GitHub contents API returned pinned file | Read and inspected the `salesrule`, coupon, coupon usage, customer usage and related table definitions; not executed |
| [Swiggy WiRa, 16 Jun 2022](https://medium.com/swiggy-bytes/personalising-the-swiggy-homepage-layout-part-i-1048dba5e703) | Body opened; widget ranking model endpoint and presentation layer; coupons widget among experimental candidates | Cited with placement-vs-eligibility boundary |
| [Swiggy POP, 4 May 2020](https://medium.com/swiggy-bytes/pop-faster-how-automated-ops-improved-ux-led-to-17-more-orders-c155af3a169b) | Body opened; historical geo/time curation and POP business layer connecting presentation and checkout | Cited as a separate historical system, not joined to WiRa as an actual call graph |
| [Stripe subscription coupons](https://docs.stripe.com/billing/subscriptions/coupons) | Body opened; coupon definition, promotion code and discount object | Cited for Stripe-specific distinctions |
| [Adobe cart price rules](https://experienceleague.adobe.com/en/docs/commerce-admin/marketing/promotions/cart-rules/price-rules-cart) | Body opened; automatic/code conditions and checkout-specific payment/shipping conditions | Cited as product-specific behavior |
| [Shopify DiscountCombinesWith](https://shopify.dev/docs/api/admin-graphql/2026-10/objects/DiscountCombinesWith) | Body opened at latest 2026-10; discount classes and two-way tags for eligible same-line combinations | Cited with version and Shopify Plus limits |
| [Swiggy Discount Self Serve](https://blog.swiggy.com/swiggy-catalyst/empowering-success-how-swiggy-enabled-1-lakh-restaurants-to-take-control-of-their-discounting/) | Body opened; 8 Apr 2024; restaurants configure discounts and target segments | Cited as a company account; no inference about exact rule engine |
| [Swiggy Match Day Mania terms](https://blog.swiggy.com/terms-and-conditions/match-day-mania-mdm-campaign-offer-terms-conditions/) | Body opened; historical restaurant and payment-partner offers | Cited for that campaign, not for present funding splits |
| [PostgreSQL 17 transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html) | Read committed wait and predicate re-evaluation | Used to explain the tested single-row contention |
| [Medusa campaign documentation](https://docs.medusajs.com/resources/commerce-modules/promotion/campaign) | Indexed text found; direct fetch timed out | Not treated as fully read; retry if needed and distinguish current documentation from pinned code |
| [Swiggy ad tracking incident](https://medium.com/swiggy-bytes/behindthebug-the-invisible-mistake-an-overlooked-backend-payload-and-its-impact-on-ad-revenue-d57a7bcdf260) | Indexed text found; direct fetch returned only page chrome | Not treated as fully read; no source-specific claim taken |
| [Swiggy Mother's Day UI](https://medium.com/swiggy-bytes/nostalgia-coupons-and-a-state-machine-the-swiggy-mothers-day-story-8e9a4df15a8f) | Body opened, 9 Jul 2026; coupon/reward presentation driven by backend values | Read, not cited; UI rendering evidence only, not selection or redemption logic |

Search results also surfaced a Medusa issue reporting budget-check races and an Adobe support case. Issue text is an allegation/maintainer discussion, not evidence of current behavior without checking the cited revision and relevant resolution. Do not execute downloaded third-party code.

## Initial-pass verification (historical)

- All three report SQL blocks executed first in PGlite 0.5.10 and then on a disposable PostgreSQL **17.11** instance. The three quote totals were 49200, 55000 and 58000 paise. The line query returned 50000 items, 8000 discount, 4200 tax and 8000 funding; a separate query confirmed the accepted order total equals the sum of discounted lines, line tax and delivery. The seeded rows demonstrate storage and reconciliation; they do not execute a real pricing engine.
- In a separate PostgreSQL test table with one available use, two independent `READ COMMITTED` transactions ran the guarded `UPDATE`. An observer checked `pg_blocking_pids`: B waited while A held the row. After A **committed**, B returned zero rows; in a reset test after A **rolled back**, B returned one. Both final counters were 1. This demonstrates only that guarded single-row counter, not a complete redemption workflow.
- No PostgreSQL server was initially available on PATH and `COURSE_DATABASE_URL` was unset. Used the PostgreSQL.org-linked EDB 17.11-3 Windows binary archive in a temporary folder, verified its SHA-256 against [EDB's published checksum](https://github.com/EnterpriseDB/edb-installers/issues/682), initialized a temporary password-protected cluster, bound it to localhost, and stopped it after testing. The first sandboxed launch failed due to a Windows token restriction; the successful run used the authorized elevated environment. No persistent service was registered.
- `npm run check:links` passed after the report and log were written: 969 local links in 81 Markdown files.
- Numerical policy cross-check: A's ₹80 capped discount splits ₹48/₹32 across the two lines; 10% synthetic item tax is ₹42; ₹420 + ₹42 + ₹30 = ₹492. Refund of the first line is ₹252 + ₹25.20 = ₹277.20. Its ₹48 discount splits ₹28.80 / ₹19.20 between the two funders. B and C totals are ₹550 and ₹580 under the stated synthetic assumptions.

## Cross-industry continuation, 2 Nov 2026

The user clarified that the restaurant examples were starting points, not industry boundaries. Re-read the original attached catalog/billing brief, the earlier report and log, and the new report. At that point the earlier report had 117 distinct linked URLs and five inspected codebases, while the first offers report had 26 links and two codebases. Those counts exposed an imbalance but were not set as a source quota. The continuation instead sought materially different mechanisms and enough evidence to trace configuration, facts, decision, response, enforcement and reversal.

Read-only preflight refreshed: upstream `main` still `9fbadbedca2e2828d619d9d47b47a6f31baf0887`; local `main` still `d7c95fb`, six ahead and zero behind. The live all-state PR list was empty; promotion/personalized issue searches returned no matches. The direct-commit search returned the already-known catalog/billing research commit, not equivalent offer work. One comparison query failed because the local-only SHA was not on the remote; comparison against the verified upstream SHA was then performed locally. Incorrectly parsed initial CLI searches were replaced by direct API searches. No Git state was mutated.

The GitHub connector returned a transport failure, so read-only `gh api` was used. An approval-review timeout on a read was retried successfully. Existing unrelated changes also include course indexes, audit/review/publication documents and edits to lessons 6, 16 and 29; they were left untouched. Only the two documents in this research folder were edited.

### Coverage added

| Area | Concrete evidence and resulting teaching coverage | Remaining boundary |
| --- | --- | --- |
| Retail and marketplaces | Target CORE chooses spend/reward offers; Instacart separates conditions, rewards, activation, special prices and clipped coupons; eBay configures seller listing sets and thresholds | These public accounts do not disclose every private price/assignment table or sponsor ledger |
| Travel | Booking.com supply configuration, Demand request context, preview consistency and display requirements | API objects are not physical database evidence; no actual partner booking was made |
| Subscriptions and retention | RevenueCat first-match targeting/defaults/placements; Apple signed promotional offers and win-back criteria; Stripe discount application/duration | No live app-store purchase or entitlement integration was exercised |
| Promotion engines | Talon.One evaluation/profile/session/effects and rollback; Voucherify qualification, validation, redemption, stacking and rollback contracts | No claim of live provider concurrency or shared transactions with merchant systems |
| Loyalty and referrals | Square reserve/redeem/delete states; Talon.One's two-party referral example; Odoo current/future-order programs | Abuse and refund policies are merchant decisions unless explicitly documented |
| B2B | Shopify company-location catalogs, publications, price lists and quantity breaks | Negotiated context is distinguished from personal behavioral targeting |
| Implementation evidence | Added Saleor, Spree and Odoo at the earlier report's pinned commits; inspected models and specific evaluation/apply paths | Five commerce codebases now inspected; none was executed as a third-party application |
| Connected backend examples | Added ordered package selection with independent impressions and point reservation/release, in executable PostgreSQL | Synthetic, bounded examples rather than provider implementations or complete ledgers |

### Additional primary sources read

All readings below were on 2 Nov 2026. “Body read” refers to the relevant documentation/article text, not only its search title. Current documentation is a dated contract snapshot, not proof that a particular merchant enables every feature.

| Source | Read and used for | Limits |
| --- | --- | --- |
| [Target CORE, 11 Jul 2024](https://tech.target.com/blog/contextual-offer-recommendation-engine) | Body read; spend/reward offers, guest/offer features, contextual bandit, exploration and separate incremental-sales holdout | Historical engineering account; no physical schema or private online endpoint asserted |
| [Instacart offer structure](https://docs.instacart.com/discounting_platform/offers/offer_structure/) | Body read; condition/reward/redemption distinctions, segment targeting and method-dependent support | Do not assume every condition/reward combination is supported |
| [Instacart creation](https://docs.instacart.com/discounting_platform/offers/create_offers/) | Body read; portal campaign offers versus catalog promotions | Configuration contract, not storage |
| [Instacart special pricing](https://docs.instacart.com/discounting_platform/pricing/special_pricing) | Body read; sale/loyalty price selection and offers on top | Do not generalize into an undocumented complete stacking policy |
| [Instacart coupons](https://docs.instacart.com/discounting_platform/coupons/overview) | Body read; clipping requirement for third-party coupons | Third-party integration contract only |
| [eBay creating discounts](https://developer.ebay.com/api-docs/sell/static/marketing/pm-creating-discounts.html) | Body read; seller/marketplace scope, listing-set/rule selection, dates, draft/preview | Does not prove personalized audience targeting or physical tables |
| [eBay threshold examples](https://developer.ebay.com/api-docs/sell/static/marketing/pm-discount-examples.html) | Body read; specification and benefit payload separation | Public configuration examples, not executed requests |
| [Booking.com Demand discounts](https://developers.booking.com/demand/docs/accommodations/discounts) | Body read; booker platform/country/groups, partner-dependent rate access, consistent context and preview | User-group input does not create eligibility; stacking is configuration-dependent |
| [Booking.com supply promotions](https://developers.booking.com/connectivity/docs/b_xml-promotions) | Body read; property/room/rate scope, dates, mobile and country rates | Different API boundary from Demand; no physical schema inference treated as confirmed |
| [Booking.com display rules](https://developers.booking.com/demand/docs/accommodations/display-discounts) | Body read; eligible-traveler display constraints | UI tags do not establish the underlying calculation |
| [RevenueCat targeting](https://www.revenuecat.com/docs/tools/targeting) | Body read; ordered first match/default, audience updates and fetch-time evaluation | Private persistence unknown; offering selection is not a purchase |
| [RevenueCat placements](https://www.revenuecat.com/docs/tools/targeting/placements) | Body read; per-placement offerings, null case and compatibility fallback | SDK/version requirements apply |
| [Apple promotional offers](https://developer.apple.com/documentation/storekit/implementing-promotional-offers-in-your-app) | HTML required JavaScript. The linked `.md` could not be parsed by the page reader, so fetched its official Markdown using PowerShell and read the body | Specific `SKProduct`/`SKPaymentDiscount` flow; not all offer families or current StoreKit APIs are claimed identical |
| [Apple win-back configuration](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-win-back-offers) | Body read; paid/lapsed duration, wait, storefront, priority and overlapping offer selection | Actual eligibility and availability depend on configured subscription/storefront |
| [Talon.One evaluation](https://docs.talon.one/docs/product/applications/evaluation-order-for-rules-and-filters) | Body read; profile lookup, campaign/rule/effect ordering and budgets | No inference that response-array order is an integration contract |
| [Talon.One effects](https://docs.talon.one/docs/dev/integration-api/api-effects) | Body read; merchant-applied monetary effects, provenance and rollback types | Effects are not proof of a merchant's actual order/payment mutation |
| [Talon.One sessions](https://docs.talon.one/docs/dev/concepts/entities/customer-sessions) | Body read; open/closed/cancelled/partial returns, budget timing and exceptions | Reversal exclusions and optional reevaluation matter |
| [Square rewards](https://developer.squareup.com/docs/loyalty-api/loyalty-rewards) | Body read; reserve, redeem, delete, terminal states and Orders API integration differences | No provider physical ledger or universal points-refund policy asserted |
| [Talon.One referrals](https://docs.talon.one/docs/product/tutorials/sample-campaigns/generate-referral-code) | Body read; rewards for both advocate and friend | Tutorial capability, not universal anti-abuse/qualifying-purchase policy |
| [Shopify B2B](https://shopify.dev/docs/apps/build/b2b) | Body read; company contacts/locations and negotiated catalogs | Buyer organization authorization remains integration-specific |
| [Shopify catalog management](https://shopify.dev/docs/apps/build/b2b/manage-catalogs) | Body read; publication/price-list/catalog relationships | Catalog and market behavior is version/configuration-sensitive |
| [Shopify QuantityPriceBreak](https://shopify.dev/docs/api/admin-graphql/latest/objects/QuantityPriceBreak) | Full body read at latest, displaying API 2026-10; minimum quantity, price, price list and variant | Initial 2026-01 page fetch missed cache; report cites the successfully read latest reference and records date/version |

### Additional pinned source inspection

Retrieved each file through GitHub's contents API, decoded it into a temporary research directory, and read the relevant declarations and function bodies. Did not install dependencies, build or execute any of these projects. The report links each inspected model/method to its pinned revision.

| Project and pin | Files inspected | Concrete evidence |
| --- | --- | --- |
| Saleor `5acd08ffe7389d7323344dd3e1398d8a46367919` | `saleor/discount/models.py`, `utils/promotion.py`, `utils/checkout.py` | Voucher/code/channel/customer relations, predicates and realized discount models; checkout → promotion helper → best-rule selection and discount/gift branches |
| Spree `a0e5b66419569d1e91d3b1eaf180444b73c65cd1` | `promotion.rb`, `promotion_handler/cart.rb`, rules `first_order.rb`, `one_use_per_user.rb` under `spree/core/app/models/spree` | Candidate scope, eligibility and action activation; store-scoped first-order/email semantics versus customer-only prior-use check |
| Odoo `807b2abc274e7497ce93747ba2d3759f32e88250` | `addons/loyalty/models/loyalty_{program,rule,reward,card}.py`, `addons/sale_loyalty/models/sale_order.py` | Program/rule/reward/card relations and balance/threshold fields; code→rule/card resolution, program row lock and usage check, automatic program/update path |
| Voucherify SDK `7e4295da2ae6de9dbe151deee18e5c7863064287` | `docs/QualificationsApi.md`, `ValidationsApi.md`, `RedemptionsApi.md`, `StackingRules.md` | Separate discovery/validate/redeem/reverse contracts; qualification ignores several redemption limits and caches results five minutes; explicit stacking modes |

The Voucherify repository is a **generated client contract**, not a sixth inspected promotion-engine implementation. Its pin was obtained from the live repository commit endpoint and used for all four subsequent contents reads and report permalinks. Readable npm mirrors were search leads only; the report relies on the official repository instead.

### Dead ends and rejected overgeneralizations

- `docs.voucherify.io/docs/stacking-rules` was inaccessible; used pinned vendor SDK documentation rather than claiming the page was read.
- Expedia's older supply-promotions PDF was indexed, but opening redirected to an unreadable connectivity portal. No PDF-specific implementation claim was added. Booking.com provides the travel comparison with readable first-party contracts.
- Apple HTML initially returned a JavaScript shell; the linked official Markdown supplied the actual body. No authenticated account or browser restriction was bypassed.
- Did not add company names just to match the previous report's link count. Each additional case supplies a different documented rule, ownership boundary, lifecycle or algorithm. Exact private table layouts remain unknown where no code/schema is published.

### Expansion verification and acceptance

- Six SQL fences in the expanded report executed in order on PGlite 0.5.10. Retained the earlier **historical** PostgreSQL 17.11 two-session evidence above; the new package/points examples were not subjected to new native concurrent-session testing.
- Package decisions returned `comeback`, `trial`, `standard` via rules 501/502/503. Only the first had a recorded impression. This verifies the synthetic first-match/default and selection-versus-render distinction, not RevenueCat runtime behavior.
- Points issue changed `(available,reserved)` from `(100,0)` to `(60,40)`; release restored `(100,0)`. Repeating the release changed no row. A separate account with 30 points failed a 40-point claim, created no reward and retained its balance.
- Rechecked the original quote totals and refund/funder arithmetic. No third-party checkout, purchase, campaign creation or provider state mutation was performed.
- Local-link checker passed after report expansion: 969 local links in 81 Markdown files. Markdown fences/tables and all JSON examples passed structural checks. Sixteen newly cited pinned source links were matched to retrieved files; all three line-specific links point to the named functions.
- Final audit: sections 6–12 cover all promised business areas and five commerce implementations; section 13 compares seven different mechanisms, connects their data flow and includes non-delivery row examples. Sections 5 and 14 retain bill/funding, concurrency, payment/reversal and operations coverage. The gaps section identifies private storage, settlement, live provider behavior and uninspected paths without claiming they were established.
- Final report has 64 distinct linked URLs, compared with 26 in the first pass. This measures expansion, not proof of quality or exhaustive coverage. Only this report and log were changed for this continuation; no staging, commit or push was performed.

## Connected teaching pass, 11 Nov 2026

The user requested warranted revisions across the four existing report/log pairs, with particular attention to offers. Read the objective attachment, referenced Backend Research chat and all eight documents. The permissions/identity research idea is parked; it is not another deliverable in this pass.

Read-only preflight: GitHub repository metadata and live branch lookup confirmed authoritative `omsrivastava512/sql-postgresql-course`, default `main`, head `9fbadbedca2e2828d619d9d47b47a6f31baf0887`. Local `main` at `25befd4` was exactly 10 ahead / 0 behind and clean. All-state PR and issue searches returned none; remote commit history identified the existing catalog research, not an equivalent collection-wide revision. Local research commits are `60da999`, `b683564`, `0149291` and `25befd4`. A shell remote lookup failed DNS; the connector supplied the live evidence. No Git state was mutated and no branch update was needed.

### Gap and repair

The report already distinguished selection, exposure and redemption, but its executable example jumped directly to seeded accepted rows. The surrounding paragraphs named capacity, idempotency and payment without following one request through them. Added a reading route, explanations of the existing columns/constraints, and a continuous customer-10/decision-101/quote-1001/order-5001 journey. It now states trusted inputs, consent versus authoritative price, before/after logical records, transaction ordering, rollback, response loss after expiry, cancellation and refund uncertainty. The partial-return and full-cancellation examples are explicitly alternative branches.

The additional request receipt, global capacity and customer-use records are a **proposed transaction protocol**, not additional SQL tables or a tested endpoint. A's policy consumes one use on acceptance and retains it after cancellation. Payment-time consumption is identified as an alternative rather than silently changing the meaning of the same use. The exercise changes that policy to an expiring hold and explains the late-payment race with hints and an answer. The compact decision record covers the order snapshots, package-selection and points examples and their remaining production work.

Existing sources informed the decisions without a new survey: commercetools supplies a non-restoration contrast; Stripe motivates request/result identities without implementing merchant idempotency; Square motivates separate reservation/consumption/release states. Existing Saleor/RevenueCat/Voucherify comparisons are connected to selection and discovery choices. No new provider claim required a new source reading, and no existing source is represented as refreshed.

### What the reader should be able to explain

Explain why two identical baskets can receive different proposals; why a quote, rendering event and accepted use are different records; why a duplicate request and a second quote are different concurrency problems; and why an expired quote does not erase an already-accepted order. Work through capacity rollback and cancellation without inventing another order, refund or restored use. The changed-requirement exercise remains a learner task: supplying an explained answer does not demonstrate independent understanding.

### Verification and remaining limits

The 2 Nov snapshot, package and points SQL and historical single-counter two-session experiment remain the evidence for those unchanged examples. No SQL was added or changed in this pass, so no new SQL execution or separate-session outcome is claimed. The complete checkout, customer-facts coordination, request fingerprinting, payment/refund and hold-expiry protocol is reasoned and still requires implementation and integration/concurrency tests. Cross-industry systems remain comparisons rather than complete implementations.

Final artifact checks on 11 Nov: the existing checker passed 978 local links in 85 Markdown files, including new reading-route anchors. A comparison against pre-edit HEAD, normalizing line endings, confirmed every fenced example and both embedded harnesses across the collection are unchanged; this report retains its six SQL blocks. All eight documents passed fence/table structure checks; JSON examples parsed; external source-target sets were preserved. Integer arithmetic rechecked A's 49200 total, 27720 meal refund and 8000 funding. Reviewed the narrative's identities, consent/expiry rules, alternative cancellation branches and evidence labels against the examples. `git diff --check` passed and status showed exactly the eight authorized documents, with no additional file. These checks establish artifact consistency, not learner understanding, live provider behavior or production readiness.

Final review on 12 Nov: live upstream main remained at 9fbadbedca2e2828d619d9d47b47a6f31baf0887; the local branch remained 10 ahead / 0 behind. The same link and heading checks restricted to tracked Markdown passed 978 links in 85 files. Fence/table checks and unchanged-example/source comparisons passed again. The full recursive link checker now reports a thread-scheme link in the independently added, untracked learning/Full-Stack-Backend-Curriculum.md as a missing local file. That file and the checker were left untouched. The tracked diff remains confined to the eight authorized research documents; the earlier 11 Nov results remain dated observations.
