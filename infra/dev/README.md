# Dev GCP bootstrap

This folder contains a **temporary bootstrap path** for standing up the first GCP dev environment before the infrastructure is formalized in Terraform.

## Why this exists

The repository now includes a GitHub Actions deployment workflow for:

- backend deployment to Google Cloud Run
- frontend deployment to Google Cloud Run
- image storage in Artifact Registry
- GitHub OIDC authentication through Workload Identity Federation
- Supabase-hosted Postgres via `SUPABASE_DATABASE_URL`

To get the first dev environment running quickly, `bootstrap-gcp.sh` creates the minimum required GCP resources.

After the environment is proven out, this should be replaced with Terraform so infrastructure is fully declarative and reviewable.

## What the script creates

- required Google APIs
- Artifact Registry Docker repository
- deploy service account
- Workload Identity Pool
- Workload Identity Provider for GitHub Actions
- IAM bindings for deployment permissions

## Required inputs

Set these environment variables before running the script:

```bash
export PROJECT_ID="your-gcp-project-id"
export GITHUB_OWNER="your-github-org-or-user"
export GITHUB_REPO="your-github-repo"
```

Optional overrides:

```bash
export PROJECT_NUMBER="123456789012"
export GAR_REPOSITORY="cloudsmiths"
export BACKEND_SERVICE_NAME="cloudsmiths-backend"
export FRONTEND_SERVICE_NAME="cloudsmiths-frontend"
export GITHUB_BRANCH="main"
export WORKLOAD_IDENTITY_POOL_ID="github-actions-pool"
export WORKLOAD_IDENTITY_PROVIDER_ID="github-provider"
export DEPLOY_SERVICE_ACCOUNT_ID="github-deployer"
```

`GAR_LOCATION` must be a valid Artifact Registry location. Safe defaults are:

- `europe-west1`
- `europe`

If you set `REGION=europe-central1`, do **not** assume Artifact Registry also supports `europe-central1`. In that case, explicitly set:

```bash
export REGION="europe-central1"
export GAR_LOCATION="europe-west1"
```

## Run it

```bash
bash infra/dev/bootstrap-gcp.sh
```

The script prints the exact GitHub secrets and repository variables you should configure afterward.

## Common bootstrap failure modes

### 1. "does not have permission to enable service ..."

Being an **Organization Administrator** is not the same as having the project-level permissions needed to enable APIs and create deployment resources.

For this bootstrap script, the user running it typically needs permissions equivalent to:

- `roles/serviceusage.serviceUsageAdmin` or another role that can enable APIs
- `roles/resourcemanager.projectIamAdmin` (or enough IAM rights to grant roles)
- `roles/iam.workloadIdentityPoolAdmin`
- `roles/iam.serviceAccountAdmin`
- `roles/artifactregistry.admin`
- `roles/run.admin`

In many organizations, these are granted through a smaller project-level admin role rather than broad org-admin access.

### 2. Project requires an `environment` tag

If GCP says the project lacks an `environment` tag, that means your organization has an org policy requiring a Resource Manager tag binding on projects.

This is separate from IAM permissions. You must either:

1. add the required tag before running the bootstrap, or
2. ask whoever manages org policy / tag administration to apply it.

Example shape of the requirement:

- key: `environment`
- value: `Development`, `Test`, `Staging`, or `Production`

### 3. Application Default Credentials quota warning

If you see a warning about ADC quota project mismatch, it usually does **not** block the bootstrap. You can fix it with:

```bash
gcloud auth application-default set-quota-project "$PROJECT_ID"
```

### 4. `INVALID_ARGUMENT: invalid project: "projects/<project>/locations/<location>"`

This usually means the chosen Artifact Registry location is invalid or unsupported for repository creation.

Most likely cause:

- you set `REGION` to a Cloud Run region such as `europe-central1`
- the script then reused that same value for `GAR_LOCATION`
- Artifact Registry does not support that location for your setup

Use an explicit supported Artifact Registry location instead, for example:

```bash
export REGION="europe-central1"
export GAR_LOCATION="europe-west1"
bash infra/dev/bootstrap-gcp.sh
```

or use the multi-region:

```bash
export GAR_LOCATION="europe"
```

## If you hit the exact permission error shown above

Ask your GCP admin to confirm that your identity has, at minimum, the ability to:

- enable Google APIs on the target project
- create service accounts
- create Workload Identity Pools and Providers
- grant IAM bindings on the target project
- create Artifact Registry repositories

If they prefer, they can also run the bootstrap script once on your behalf and then hand back the GitHub secret/variable values it prints.

## GitHub configuration produced by the script

### Secrets

- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT_EMAIL`
- `SUPABASE_DATABASE_URL`

### Variables

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GAR_LOCATION`
- `GAR_REPOSITORY`
- `BACKEND_SERVICE_NAME`
- `FRONTEND_SERVICE_NAME`
- `FRONTEND_BACKEND_API_URL`
- `FRONTEND_AUTH_BASE_URL`

## Supabase note

The script does **not** provision Supabase resources. You still need to:

1. create the Supabase project
2. copy the Postgres connection string
3. store it in GitHub as `SUPABASE_DATABASE_URL`

## Terraform follow-up

Once the dev environment is validated, migrate this folder into Terraform-managed infrastructure. At minimum, the following should move into code:

- Artifact Registry repository
- service account and IAM bindings
- Workload Identity Pool + Provider
- Cloud Run services
- any future DNS or custom domain configuration
