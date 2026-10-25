# Research log: how the catalog and billing report was built

Oct 23, 2026 · @Om Srivastava

## What this log is for

This log records what was done to build the catalog-and-billing report, so a new chat can continue without repeating it. The report is Untitled.

To hand over: give the new chat the report and this log, ask it to read both first, and start from "Not done and where to start". Every page in the source register has already been read; reopen one only if it is marked as a lead.

This log was rebuilt from this chat, the saved sub-agent records and the report's own links. The earliest main-thread steps (before 22 Oct 2026) were not kept, so for those the report's links are the only record.

## Where things stand

The report is finished and delivered; three small fixes found afterwards are written down below but not yet applied.

| Item | State |
| --- | --- |
| Report | Complete: 9 sections, 83 distinct sources (123 link marks), at revision 25 |
| Evidence checked | 22 and 23 Oct 2026 |
| Worked example | `worked_example.py` (SQLite, for Task 3) was sent with the report |
| Checks done | 38 GitHub permalinks resolve at the pinned commits; risky quotes re-read against their pages; task list closed |
| Open | Three report fixes (see "Corrections"); the leads in "Not done and where to start" |

## Method and evidence rules

Every claim in the report carries one of three tags, and these rules decide which.

| Tag | Meaning |
| --- | --- |
| \[Confirmed\] | Stated in a primary source I opened (a company statement, official docs, or code at a pinned commit), with a link |
| \[Inferred\] | My reasoning from confirmed facts, with the reasoning stated; it also covers anything that rests only on press or secondary sources |
| \[Unknown\] | No public evidence found |

- **Order of work:** the report skeleton was created first, research then ran in lanes (see the register), sections were written one at a time, and verification and fixes came last.
- **Lanes:** Swiggy; Zomato, Blinkit and Eternal; super-app and delivery analogues; marketplaces (Amazon, Walmart, eBay, Etsy, Flipkart); Shopify, Stripe and tax for billing; unit standards; five open-source codebases read from local clones.
- **Sub-agents:** 11 launches across those lanes. Most stopped at a usage limit before reporting back.
- **Fetch tool:** the page reader returns model-written summaries, so the report quotes only short phrases and links every claim.
- **Thin evidence on Indian companies:** Swiggy, Zomato, Blinkit and Flipkart publish little architecture. The report uses the closest documented analogues and marks the rest \[Unknown\]: Grab, Gojek, Uber, DoorDash and Instacart for shared platforms and menus; Amazon, Walmart, eBay, Etsy and Shopify for variants and bundles; Stripe for billing; Odoo, Magento, Saleor, Medusa and Spree code for schemas.
- **Safety:** cloned code was treated as untrusted data and never run; pages that block automated readers were not worked around.

## Source register

About 80 distinct pages were fetched in the kept records, and the report cites 83 sources (38 are code permalinks, covered in the next section). Every page is listed here by lane with its status, so nobody reads it twice. **Cited** = linked in the report. **Read, not cited** = opened and set aside, or not yet added. **Not read** = rate-limited, blocked or errored.

### Swiggy

Primary evidence exists only for product facts and UI tooling. Nothing public covers databases or the internals of Bolt and Toing.

| Source | What it gave | Status |
| --- | --- | --- |
| [Bolt launch release, Oct 2024](https://www.swiggy.com/corporate/press-release/swiggy-launches-bolt-delivering-your-favorite-food-in-just-10-minutes/) | Bolt launched as a tile on the Food page; delivery partners are not told an order is Bolt | Cited |
| [Bolt expansion release, May 2025](https://nsearchives.nseindia.com/corporate/SWIGGY_02052025162900_CoveringLetter_Press_Release_Bolt_Expansion.pdf) | Curated quick-serve menu; same partner treatment | Cited |
| [Shareholder letter, Jul 2026](https://nsearchives.nseindia.com/corporate/SWIGGY_30072026154100_Covering_Letter_Letter_to_Shareholders_-_signed.pdf) | Toing is a standalone app reusing existing tech and infrastructure; Bolt is “our faster Food delivery proposition” | Cited |
| [Instamart App Store listing](https://apps.apple.com/in/app/instamart-10-mins-grocery-app/id6738619733) | A standalone Instamart app exists | Cited |
| [Business Today, Jan 2025](https://www.businesstoday.in/amp/technology/news/story/swiggy-launches-instamart-as-a-standalone-app-available-on-android-and-ios-460547-2025-01-13) and [interview, Dec 2025](https://www.businesstoday.in/amp/magazine/interview/story/trying-multiple-ways-to-succeed-swiggy-food-marketplace-ceo-rohit-kapoor-508841-2025-12-31) | Instamart app launch and CEO remarks; Toing as a marketplace experiment | Cited (press only) |
| [Storyboard18, Sep 2025](https://www.storyboard18.com/brand-makers/-80944.htm) | Toing in Pune, meals under Rs 99 | Cited (press only) |
| [Swiggy Bytes, Jul 2026](https://medium.com/swiggy-bytes/how-we-made-all-swiggy-apps-operations-ai-native-1343612ec228) | Several business lines and shell apps share tooling | Cited |
| [Swiggy Bytes, Engineering challenges at Swiggy](https://bytes.swiggy.com/engineering-challenges-at-swiggy-430dea6c86a3) | Undated, no author. Hundreds of services in order fulfilment; multi-tenant systems across order management, promotions, pricing and delivery logistics rather than siloed per business line; federated development | Read, not cited |
| [Swiggy Bytes, Dynamic Widget](https://bytes.swiggy.com/a-deep-dive-into-dynamic-widget-swiggys-server-driven-ui-system-92cdc3b16ec6) | 22 Mar 2024, Sarthak Mishra. Server-driven UI engine with a JSON layout language and a Kotlin Multiplatform schema; behind an experiment for a few widgets on Track and Search; no mention of the home page, Food, Instamart or Bolt | Read, not cited |
| [Toing App Store listing](https://apps.apple.com/app/id6748918399) | Title “toing - Food Delivery”; seller BUNDL TECHNOLOGIES PRIVATE LIMITED, the same as the main app; “© 2025, Swiggy”; own site toingit.com; no mention of a Swiggy login; undated snapshot | Read, not cited |
| [Swiggy App Store listing](https://apps.apple.com/us/app/-/id989540920) | Title “Swiggy: Food Instamart Dineout”, same seller; Bolt and Genie not named in the description | Read, not cited |
| Other pages opened: [Q4 FY26 release](https://www.swiggy.com/corporate/wp-content/uploads/2026/05/Press-release_Q4FY26.pdf), [Inc42 on Toing](https://inc42.com/buzz/swiggy-toing-app-launch-affordable-meal-delivery/), [MediaNama on Toing](https://www.medianama.com/2025/09/223-toing-app-swiggy-save-money-on-meals/), [TechCrunch, Dec 2024](https://techcrunch.com/2024/12/02/swiggy-scales-10-minute-food-delivery-to-400-cities-in-quick-commerce-push), [YourStory, Oct 2026](https://yourstory.com/2026/10/swiggys-next-big-bet-90-of-indians-yet-try-food-delivery), [Toing privacy policy](https://www.toingit.com/privacy-policy), [swiggy.com/corporate/?p=16832](https://www.swiggy.com/corporate/?p=16832) | Product and results background; nothing taken from them | Read, not cited |
| [Base.com blog](https://base.com/en-IN/blog/?p=21172) | The only source found on Instamart's catalog; a vendor blog | Read, not relied on |
| Job posts: [Cutshort](https://cutshort.io/job/Architect-Principal-Engineer-Bengaluru-Bangalore-Swiggy-bQHofGmx), [Weekday](https://jobs.weekday.works/swiggy-software-engineer%2C-platform) | Stack hints in job-post style | Read, not relied on |
| Swiggy Bytes home page; the Bytes serviceability post; daily.dev, ZenML and LetsDataScience pages | Home page errored; the serviceability post blocks automated readers (not worked around); the rest were rate-limited | Not read |

Two sub-agents ran 13 searches each (Toing, Bolt, app tabs, Bytes engineering posts, server-driven UI, micro-frontend or BFF, Instamart catalog, RHP, patents, job posts, Toing on Google Play, Swiggy's MCP server). The RHP, patent and job searches returned only aggregator pages (CB Insights, Mergr, GlobalData), so no RHP, patent or Google Play page was opened.

### Zomato, Blinkit and Eternal

| Source | What it gave | Status |
| --- | --- | --- |
| [Eternal Q4 FY25 shareholder letter](https://b.zmtcdn.com/investor-relations/d9c290cd23764a09789769c39682276a_1746094084.pdf) | The going-out offering moves to the separate District app | Cited |
| Blinkit ambulance: [Business Today](https://www.businesstoday.in/amp/india/story/profit-is-not-a-goal-here-blinkit-rolls-out-10-minute-ambulance-service-starting-in-gurugram-459361-2025-01-02), [MediaNama](https://www.medianama.com/2025/01/223-demand-and-scalability-questions-around-blinkits-10-min-ambulance-service/), [YourStory](https://yourstory.com/2025/01/blinkit-launches-ten-minute-ambulance-service-gurugram) | Gurugram launch, bookable in the app; price and booking details thin | Cited (press only) |
| [Entrackr, 2 Jan 2025](https://entrackr.com/news/blinkit-launches-10-min-ambulance-service-starting-from-gurugram-8585968) | Five ambulances at launch; 10-minute response promise; paramedics and assistants with a driver; “affordable cost”, no fares | Read, not cited |
| [Storyboard18 ambulance article](https://www.storyboard18.com/amp/brand-marketing/blinkit-expands-ambulance-services-in-gurugram-aims-to-reach-emergency-patients-within-10-minutes-76687.htm), [Inc42 on Eternal Q2](https://inc42.com/buzz/eternal-q2-profit-tanks-63-yoy-to-inr-65-cr-revenue-up-183-yoy/) | More launch and results coverage | Read, not cited |
| [MongoDB case study on Zomato](https://mongodb.com/company/blog/innovation/zomato-manages-high-volume-data-delivers-high-speed-success) | Order tracking and assignment only; nothing on menus or catalog | Read, set aside |
| [UrbanPiper: Zomato menu constraints](https://api-docs.urbanpiper.com/downstream/aggregator-constraints/zomato) | UrbanPiper's own docs on Zomato's rules: two levels of nested option groups; digits in item names ignored; markup prices only for QVM items; undated | Read, not cited (lead for Task 2a) |
| [UrbanPiper: manage and publish your menu](https://help.urbanpiper.com/ordering-channels/zomato/manage-and-publish-your-menu) | Error table: a zero item-level price needs a variant with a price; modifier-group max versus minimum selectable; publish flow POS to UrbanPiper to Zomato; undated | Read, not cited (lead for Task 2a) |
| Blinkit's engineering blog, Lambda by Blinkit: [Debezium post](https://lambda.blinkit.com/how-integer-and-int-produced-different-schemas-in-debezium-9c98e8a80aa2), [deadlock post](https://lambda.blinkit.com/how-a-deadlock-froze-blinkits-supply-chain-4b7c4d6d4a3f), [OpenSearchCon post](https://lambda.blinkit.com/blinkit-at-opensearchcon-india-2026-37fd0046c318) | 2 Sep 2026 (Prathit Malik): MySQL change capture with Debezium into a Hudi data lake. 29 May 2026 (Ratul Dawar): a Trino and Hudi deadlock that delayed inventory replenishment jobs. 24 Jul 2026 (Harshit Prasad): one OpenSearch cluster to several. None covers catalog, variants, bundles, billing or service boundaries | Read, not cited (see Corrections) |
| Blog indexes: [blog home](https://lambda.blinkit.com/), [sitemap](https://lambda.blinkit.com/sitemap/sitemap.xml), [feeder.co mirror](https://feeder.co/discover/8ac8d17e26/lambda-blinkit-com-source-rss-42df4a1e8725-4) | The home page shows no post list. The sitemap lists 238 URLs, mostly tag pages back to 2015, and the summary showed only the first 38. The mirror lists the 12 latest posts, none on catalog or pricing | Read |
| Medium tag pages on Blinkit's blog (microservices, database, grocery-shopping, e-commerce-business) | Render empty for the page reader (tried 24 Oct 2026) | Dead end |
| [lambda.grofers.com](https://lambda.grofers.com), [StackShare](https://stackshare.io/grofers/grofers) | Redirect; error | Not read |

Two sub-agents ran 17 searches (ambulance launch and price, the Eternal letter, Blinkit and Grofers engineering blogs and catalog, Zomato engineering blog and menu service, UrbanPiper menu push, Blinkit seller catalog guidelines, one login across Eternal's apps). No primary source on Zomato's backend turned up.

### Super-app and delivery analogues

| Source | What it gave | Status |
| --- | --- | --- |
| Grab: [app modularisation](https://engineering.grab.com/app-modularisation-at-scale), [order platform](https://engineering.grab.com/how-we-store-millions-orders), [GrabMart](https://engineering.grab.com/grabmart-product-team-experience) | Feature modules in one app; one Order Platform for GrabFood and GrabMart; GrabMart built on GrabFood | Cited |
| Uber: [domain-oriented architecture](https://www.uber.com/us/en/blog/microservice-architecture/), [fulfillment platform](https://www.uber.com/us/en/blog/fulfillment-platform-rearchitecture/), [Eats menu guide](https://developer.uber.com/docs/eats/guides/menu-integration), [example menu payloads](https://developer.uber.com/docs/eats/references/api/v2/example-menu-payloads) | Layers and gateways; one fulfillment platform for all verticals; menu and modifier-group shapes | Cited |
| DoorDash: [new verticals on CockroachDB](https://careersatdoordash.com/blog/how-we-scaled-new-verticals-fulfillment-backend-with-cockroachdb/), [product knowledge graph](https://careersatdoordash.com/blog/building-doordashs-product-knowledge-graph-with-large-language-models/) | Retail fulfillment data service; catalog enrichment | Cited |
| Gojek: [road to a merchant superapp](https://blog.gojek.io/the-road-to-a-merchant-superapp) | GoResto to GoBiz; wallets for merchants; move to microservices | Cited |
| Instacart: [catalog story](https://company.instacart.com/tech-innovation/the-story-behind-an-instacart-order-part-1-building-a-digital-catalog), [catalog docs](https://docs.instacart.com/connect/fulfillment_guide/concepts/catalog/) | Digital catalog design; catalog concepts | Cited |
| Uber Eats [menu API reference](https://developer.uber.com/docs/eats/references/api/v2/put-eats-stores-storeid-menu); DoorDash [store menu sample](https://developer.doordash.com/en-US/docs/marketplace/reference/sample_get_store_menu_details_response_partner), [get menu](https://developer.doordash.com/docs/marketplace/how_to/get_doordash_menu), [pizza menus](https://developer.doordash.com/docs/marketplace/how_to/implement_pizza_menus), [retail integration options](https://developer.doordash.com/en-US/docs/marketplace/retail/about/integration_options); Instacart [pricing help](https://instacart.com/help/section/pricing), [catalog API overview](https://docs.instacart.com/catalog/catalog_api/product/overview) | Menu and catalog payload detail | Read, not cited |
| Gojek: [Hobson's choice for the food menu](https://blog.gojek.io/architecting-a-hobsons-choice-for-our-food-menu-1), [GoFood order flow, part 1](https://blog.gojek.io/gofood-order-flow-part1) | Not read (rate-limited); possible detail on menu modelling | Not read |

### Marketplaces and platform docs (variants and bundles)

| Source | What it gave | Status |
| --- | --- | --- |
| Amazon SP-API: [Catalog Items reference](https://developer-docs.amazon/sp-api/docs/catalog-items-api-v2022-04-01-reference), [variation-theme changelog](https://developer-docs.amazon/sp-api/changelog/upcoming-removal-of-unused-variation-themes-in-the-listings-items-api), [Product Type Definitions](https://developer-docs.amazon/sp-api/docs/product-type-definitions-api) | Parent and child ASINs; per-type JSON schemas | Cited |
| Amazon bundling: [selling blog](https://sell.amazon.com/blog/product-bundling), [seller forum announcement](https://sellercentral.amazon.com/seller-forums/discussions/t/aeff34dfb538fbb69e2f2af22af23fec) | Virtual and physical bundles | Cited |
| [eBay item groups](https://developer.ebay.com/api-docs/sell/static/inventory/inventory-item-groups.html), [Walmart variants](https://developer.walmart.com/us-marketplace/docs/setting-up-multiple-variants-of-an-item), [Etsy listings](https://developers.etsy.com/documentation/tutorials/listings/) | Variant groups as linked items | Cited |
| Shopify: [variant limit](https://community.shopify.dev/t/the-product-variant-limit-is-now-2048-for-all-merchants/23938), [fixed bundle guide](https://shopify.dev/docs/apps/build/product-merchandising/bundles/add-product-fixed-bundle), [LineItemGroup](https://shopify.dev/docs/api/admin-graphql/2024-10/objects/LineItemGroup), [ProductVariant](https://shopify.dev/docs/api/admin-graphql/latest/objects/ProductVariant) | Child variants; bundles as grouped lines | Cited |
| Medusa docs: [inventory kit](https://docs.medusajs.com/resources/commerce-modules/inventory/inventory-kit), [bundled products recipe](https://docs.medusajs.com/resources/recipes/bundled-products/examples/standard) | Kits and bundle recipe | Cited |
| Flipkart, third-party only: [Fynd](https://documentation.fynd.com/commerce/docs/openapi/listings-management/flipkart/faq-flipkart), [Streamoid](https://streamoid.com/resources/guides/flipkart-seller-guide) | Integration guides; no Flipkart variant model published | Cited |
| [Shopify community thread on 2k variants](https://community.shopify.dev/t/new-graphql-product-apis-and-early-access-to-2048-aka-2k-variants/5852/23) | Background on the variant limit | Read, not cited |
| [Flipkart seller API listing reference](https://seller.flipkart.com/api-docs/listing-api-docs/LMAPIRef.html) | Rate-limited; the Flipkart seller API page that did open covers sign-up and OAuth only | Not read |

### Billing and tax

| Source | What it gave | Status |
| --- | --- | --- |
| Stripe: [invoice line item](https://docs.stripe.com/api/invoice-line-item/object), [Prices](https://docs.stripe.com/api/prices/object), [Checkout Sessions](https://docs.stripe.com/api/checkout/sessions/create), [invoice workflow](https://docs.stripe.com/invoicing/integration/workflow-transitions) | Invoice lines with parent and period; one-time versus recurring prices | Cited |
| Shopify: [LineItem](https://shopify.dev/docs/api/admin-graphql/latest/objects/LineItem), [SellingPlan](https://shopify.dev/docs/api/admin-graphql/latest/objects/SellingPlan), [recurring billing policy](https://shopify.dev/docs/api/admin-graphql/latest/objects/SellingPlanRecurringBillingPolicy), [community answer on a null line-item variant](https://community.shopify.com/t/graphql-admin-api-orders-query-null-lineitem-variant/366644) | Selling-plan details on the order line | Cited |
| [Medusa subscriptions recipe](https://docs.medusajs.com/resources/recipes/subscriptions/examples/standard) | Scheduled job builds a new order each cycle | Cited |
| [CGST Rule 46](https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/rules/cgst_rules/active/chapter6/rule46_v1.00.html) | What an Indian tax invoice must contain | Cited |

### Units and standards

| Source | What it gave | Status |
| --- | --- | --- |
| Shopify [UnitPriceMeasurement](https://shopify.dev/docs/api/admin-graphql/latest/objects/UnitPriceMeasurement); Instacart [product quantity](https://docs.instacart.com/connect/fulfillment_guide/concepts/product_quantity) | Unit price fields; ordered, fulfilled and charged quantities | Cited |
| GS1: [Germany netContent attribute](https://gdsn.gs1-germany.de/BMSattribute?id=3733), [variable measure trade item](https://support.gs1.org/support/solutions/articles/43000734396-what-is-a-variable-measure-trade-item-) | Net content for packaged goods | Cited |
| UNECE: [Recommendation 20](https://unece.org/trade/documents/2021/06/uncefact-rec20-0), [code vocabulary](https://service.unece.org/trade/uncefact/vocabulary/rec20/) | Unit-of-measure codes | Cited |
| GS1 Navigator | Needs JavaScript; the GS1 Germany copy was used instead | Not read |

Amazon's docs host `developer-docs.amazon.com` redirects, so the report links use the `developer-docs.amazon` host that the page reader accepted. Seller Central help pages need a login, and the Orders API model page would not load.

## Code reading

Five open-source codebases were read from local clones at the commits below, and every code citation in the report is a permalink to one of them.

| Project | Pinned commit | Key files read |
| --- | --- | --- |
| Saleor | `5acd08ffe7389d7323344dd3e1398d8a46367919` | `product/models.py` (ProductType, Product, ProductVariant), `attribute/models`, `order/models.py` (OrderLine), `giftcard/models.py` |
| Medusa | `f7add009dd2f142d98090a5194750e71b2147ddf` | `inventory-item.ts`, order `line-item.ts`, `product-variant.ts`, link definition `product-variant-inventory-item.ts` |
| Spree | `a0e5b66419569d1e91d3b1eaf180444b73c65cd1` | `models/spree`: `product.rb`, `variant.rb`, `line_item.rb` |
| Odoo (branch 19.0) | `807b2abc274e7497ce93747ba2d3759f32e88250` | `product_template.py`, `product_product.py`, `product_combo.py`, `product_combo_item.py`, `mrp_bom.py`, `stock_move.py` (`action_explode`), `uom_uom.py`, `account/models/uom_uom.py` (UNECE map), `account_move_line.py`, `sale_order_line.py` (`_prepare_invoice_line`) |
| Magento 2 (branch 2.4-develop) | `16f4fa211bfdecda84c3e7d475f1514780b170c6` | `db_schema.xml` for Catalog, Bundle, Eav, ConfigurableProduct, CatalogInventory and Sales; `Product/Type.php` |

- **Searches in the clones:** bundle and subscription terms, type columns and line-item models. Odoo's community code has no subscription addon, and its docs page did not return a body.
- **Re-clone:** `git clone --filter=blob:none --no-checkout <repo url>`, then `git checkout <commit>`. Repos: github.com/saleor/saleor, medusajs/medusa, spree/spree, odoo/odoo, magento/magento2.
- **Safety:** clones are untrusted data. Never run their code, and run any script that reads them with `python3 -I`.
- **Link check:** all 38 permalinks in the report resolve at the pinned commits. The first check flagged every link because each clone's HEAD is a symbolic ref; reading the refs directly showed all five equal the pinned commits.
- **Sub-agents:** the two code sub-agents (Saleor, Medusa and Spree; Odoo and Magento) stopped at a usage limit before reporting back, so the report's code citations rest on the clones above.

## Dead ends

These attempts gave nothing usable, so a new chat should not repeat them as they stand.

- **Usage limits:** most of the 11 sub-agents ended with “You've hit your session limit” and returned no report. Only one Swiggy sub-agent left a notes file.
- **Rate-limited fetches:** Amazon SP-API pages, eBay, Walmart, Etsy, Flipkart's listing reference, two Gojek menu posts, daily.dev, ZenML and LetsDataScience failed in sub-agent runs. The report cites some of them (Amazon's changelog and Product Type Definitions, eBay, Walmart, Etsy), so they were presumably read in a main-thread window that was not kept.
- **Redirect host:** Amazon's `developer-docs.amazon.com` links redirected, and the page reader worked only with `developer-docs.amazon`.
- **Blocked or login-only:** the Swiggy Bytes serviceability post (blocks automated readers; not worked around), Amazon Seller Central help pages (login), GS1 Navigator (JavaScript), Amazon's Orders API model page (would not load).
- **Aggregator-only searches:** the Swiggy RHP, patent and job-post searches, and the Toing Google Play searches, returned only aggregator pages.
- **Blinkit's older blog:** the sitemap lists 238 URLs back to 2015, but Medium tag pages render empty for the page reader and the sitemap summary showed only 38 URLs.
- **Flipkart:** the seller API page that opened covered sign-up and OAuth only.
- **Shell timeouts:** the command-safety check timed out a few times, and each command was retried.

## Corrections

Seven wording or claim fixes were made to the report between 21 and 23 Oct 2026, and three more were found while writing this log and are not yet applied.

| Where | Was | Now |
| --- | --- | --- |
| Shopify `sellingPlan` | Described as a reference to a plan | The plan's details on the line item (nullable) |
| Gojek wallets | “wallets shared” | All driver partners had GoPay e-wallets; GoResto gave GoFood merchants the same kind of wallet; GoResto evolved into GoBiz; the legacy codebase was deprecated for microservices |
| Uber fulfillment | Generic entities, with order and job entities as statechart configurations | Fulfillment entities (for example an order entity and a job entity), each defined statically through a statechart configuration |
| Toing in Pune | Stated as a launch fact | A Sep 2025 press report says it served select Pune locations, claimed meals under Rs 99 and promised free delivery above Rs 99 |
| Odoo e-invoice | “when it imports an e-invoice” | Removed: no source |
| Shopify `taxable` | A claim in an early draft | Removed |
| Task 1b takeaway | “no platform …” | “none of the platforms I could read …” |

Added in the later patches: the Odoo UN/CEFACT mapping paragraph, the subscription table (Stripe, Shopify, Medusa), the Blinkit ambulance paragraph with its gap row, and the date line “Checked on 22 and 23 Oct 2026”.

**Found afterwards, not applied** (the request was for the log only):

1. **Zomato and Blinkit paragraph (Task 1a).** It says the only items found were third-party and that no primary engineering source covers Zomato's or Blinkit's databases. Blinkit has its own engineering blog, and three 2026 posts cover MySQL change capture, a Trino deadlock and OpenSearch, but none covers catalog or service boundaries. Fix: say so, link the three posts, and narrow “databases” to how catalogs, orders and services are modelled.
2. **“No Swiggy source describes this” (Task 1a, one app presenting several verticals).** The nearest Swiggy source is the Dynamic Widget post, which covers Track and Search widgets only. Fix: replace the sentence with that, and add a server-driven UI row to the patterns table.
3. **Evidence missing from the report.** The undated Swiggy Bytes engineering-challenges post and the App Store seller facts (Toing and the main app share one seller; Toing carries “© 2025, Swiggy”) are not cited. Fix: add a row to the Swiggy table and a line under Toing's identity question, and keep Toing's login and database sharing \[Unknown\]. Gap row R1 and the Task 1a takeaway would then mention them.

## Verification record

The report's links and riskiest quotes were checked on 22 and 23 Oct 2026; the pages in the last row were re-read for this log.

| Check | Result |
| --- | --- |
| 38 GitHub permalinks resolve at the pinned commits | All pass |
| Riskiest quotes (Gojek, Uber, Toing in Pune, Blinkit ambulance, Shopify selling plan) re-read against their pages | Wrong wording fixed (see Corrections) |
| Report state | Revision 25, 9 sections, 123 link marks, 83 distinct links |
| Report links against the kept fetch records | The kept records show about 80 fetched pages. About 60 of the report's links come from windows that were not kept: 38 code permalinks and roughly 20 web pages |
| Pages re-fetched for this log (23 and 24 Oct) | Two Swiggy Bytes posts, both App Store listings, three Blinkit blog posts, two UrbanPiper pages, Entrackr, four Blinkit tag pages |

## Not done and where to start

Start with the three open report fixes, then the leads below; everything else in the brief is answered or marked \[Unknown\] in the report.

1. **Apply the three report fixes** listed under Corrections.
2. **Blinkit and Grofers archive.** Find individual post URLs by searching titles or topics, then fetch each post, because tag pages render empty. Look for catalog, inventory, order and microservices posts from 2015 to 2023.
3. **Zomato menu rules.** The UrbanPiper pages (read, not cited) could support a Task 2a note on Zomato option groups and variants. Tag it as UrbanPiper's undated statement of Zomato's rules.
4. **Primary filings not opened.** Swiggy and Eternal RHP or DRHP on SEBI or exchange sites, Google Patents by assignee (Bundl Technologies), and applicant-tracking job posts (Greenhouse, Lever). The searches returned aggregators only.
5. **Not searched as such.** Conference talks by Swiggy, Zomato or Blinkit engineers, and seller-portal catalog guidelines beyond one Blinkit search.
6. **Unread pages.** Gojek's food-menu posts (Hobson's choice; GoFood order flow, part 1) and Toing's Google Play page.
7. **Tax rounding rules per jurisdiction.** Not researched (gap row R13).
8. **No public source found for:** Amazon's internal catalog storage and invoice-line internals, how dark stores expand combos into picks, loose-item pricing in quick commerce, Flipkart's variant model, and Odoo's subscription implementation.

## Report map

The report has nine sections; this map shows what each concludes and how much of it is linked.

| Report section | What it concludes | Evidence used | Links (marks / distinct) |
| --- | --- | --- | --- |
| Summary | A few designs repeat: a shared platform under separate app shells, a typed core product record, variants as SKU children, combos as a priced record plus a recipe, one base unit with factors, invoice lines that copy what was sold | All lanes | n/a |
| Product facts check | Bolt is a tile on Food, Instamart also has its own app, Toing is a standalone app pitched on affordability | Swiggy | 9 / 8 |
| Task 1a: shared or separate backends | Several apps sit on shared capabilities; whether Swiggy's databases are shared is \[Unknown\]; Grab, Uber and DoorDash document one shared platform | Swiggy, Zomato and Blinkit, analogues | 15 / 14 |
| Task 1b: one table or many | A core product with a type column, attributes in EAV or JSON, side tables for bundles, downloads and gift cards | Code, Amazon, Uber Eats, Instacart, DoorDash | 24 / 23 |
| Task 2a: variants | The sellable SKU is its own record under a parent: a child table or a full item grouped by a key | Code, marketplace docs | 18 / 18 |
| Task 2b: combos | A priced sellable plus a recipe that is multiplied out at pick time | Odoo, Magento, Medusa, Shopify, Amazon | 19 / 15 |
| Task 2c: units | One base unit with conversion factors; weighted items keep ordered, fulfilled and charged quantities; UN/CEFACT and GS1 standards | Odoo, Magento, Medusa, Shopify, Instacart, standards | 15 / 14 |
| Task 3: billing | The line row copies quantity, price and tax at sale; subscriptions sit in a separate billing layer; one worked example | Code, Stripe, Shopify, Medusa, CGST Rule 46 | 23 / 18 |
| What I couldn't find | 13 gaps (R1 to R13), each with the closest analogue used | n/a | n/a |
