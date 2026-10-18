# Author-only repository evidence

Reviewed 2026-10-17 against local HEAD abd1afc and the working files. This record is not evidence of a deployed database.

| Topic | Evidence in clinic-demo-be | Status and teaching limit |
|---|---|---|
| Owner validation | docs/schema/supabase_migration.md:182 defines validate_owner_is_admin(); :197 attaches clinics trigger; :290 attaches patients trigger | Existing SQL in the migration document. It checks writes to those tables, not every later role change on profiles. |
| Owner derivation | Same file :368 defines derive_owner_id_from_patient(); :376, :421, :444, :950 attach triggers | Existing SQL. The simplified lab uses integer IDs and a custom schema; it is not a copied production migration. |
| Clinician role | Same file :274, :498, :661, :936 references profiles(id) | These foreign keys establish existence, not a clinician-role check. Do not claim our teaching validator already exists for every clinician column. |
| Invoice counter | Same file :789 onward; process_new_invoice(), then invoices_process_new at :864 | Existing SQL uses UPDATE RETURNING on clinics. Our lab omits access and formatting details to expose rollback. |
| Deferred checking | PostgreSQL feature explained in the study discussion | Teaching example explicitly declares a deferrable FK. Do not assume baseline FKs are deferred. |
| Future workflow | study/business_logic/speciality_and_invoice/, fee_computation/, packages_logic/ | Discussions and proposals must be checked against implemented SQL before being described as implemented. |
| Prior course structure | study/schema-study-plan-v2.md | Historical study plan. Several broad security explanations need correction; it is not a technical authority. |

Authoritative upstream: https://github.com/omsrivastava512/clinic-demo-be, default branch main.
Live upstream HEAD checked: d7c8dc8b9514a25e14215d81bdfc03413374e651.
Local branch: main, ahead 2 / behind 0. The extra commits reorganize documents and untrack personal summaries. GitHub returned no PRs or issues. No Git history or existing documents were changed for this course.

No patient records, credentials, personal backup files, or private transcript text belong in the public course.

