
### supabase command
db-start:
	supabase start
db-start-test:
	cd supabase-test && supabase start
db-stop:
	supabase stop
db-stop-test:
	cd supabase-test && supabase stop
db-reset:
	supabase db reset
db-reset-test:
	cd supabase-test && supabase db reset
function:
	supabase functions new $(name)
fn-start:
	supabase functions serve
fn-start-test:
	cd supabase-test && supabase functions serve
set-env:
	supabase secrets set --env-file ./supabase/functions/.env
fn-deploy-st:
	supabase functions deploy ${name} --project-ref qcjkqqleblmyrwtglqnf
fn-deploy-st-no-verify:
	supabase functions deploy ${name} --project-ref qcjkqqleblmyrwtglqnf --no-verify-jwt
fn-deploy-pr:
	supabase functions deploy ${name} --project-ref ****
fn-deploy-pr-no-verify:
	supabase functions deploy ${name} --project-ref **** --no-verify-jwt
set-env-st:
	supabase secrets set --env-file ./supabase/functions/.env.st
set-env-pr:
	supabase secrets set --env-file ./supabase/functions/.env.pr --project-ref ****
db-push-st:
	supabase db push --linked qcjkqqleblmyrwtglqnf
db-push-pr:
	supabase db push --linked ****
db-diff:
	supabase db diff --use-migra -f ${name}
db-link-st:
	supabase link --project-ref qcjkqqleblmyrwtglqnf
db-link-pr:
	supabase link --project-ref ****
db-create-migrate:
	supabase db diff --use-migra -f maigrate