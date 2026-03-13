#!/usr/bin/env bash

set -euo pipefail

# Bootstrap script for a first-pass dev environment on GCP.
# This is not intended as a long-term solution, but rather a way to quickly get
# the necessary GCP resources in place to enable development and testing of the 
# GitHub Actions deploy flow, without having to manually click around in the GCP Console.
#
# Usage:
# export PROJECT_ID="your-gcp-project-id"
# export GITHUB_OWNER="your-github-user-or-org"
# export GITHUB_REPO="cloudsmiths"
# bash infra/dev/bootstrap-gcp.sh
#
# Goal:
# - create the minimum GCP resources needed for the GitHub Actions deploy flow
# - keep everything explicit and easy to later replace with Terraform
#
# What it creates/configures:
# - required service APIs
# - Artifact Registry docker repository
# - deploy service account
# - Workload Identity Pool + Provider for GitHub Actions OIDC
# - IAM bindings for Cloud Run + Artifact Registry deployments
#
# This script is intentionally idempotent where possible.

PROJECT_ID="${PROJECT_ID:-}"
PROJECT_NUMBER="${PROJECT_NUMBER:-}"
REGION="${REGION:-europe-west1}"
GAR_LOCATION="${GAR_LOCATION:-$REGION}"
GAR_REPOSITORY="${GAR_REPOSITORY:-cloudsmiths}"

BACKEND_SERVICE_NAME="${BACKEND_SERVICE_NAME:-cloudsmiths-backend}"
FRONTEND_SERVICE_NAME="${FRONTEND_SERVICE_NAME:-cloudsmiths-frontend}"

GITHUB_OWNER="${GITHUB_OWNER:-}"
GITHUB_REPO="${GITHUB_REPO:-}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"

WORKLOAD_IDENTITY_POOL_ID="${WORKLOAD_IDENTITY_POOL_ID:-github-actions-pool}"
WORKLOAD_IDENTITY_PROVIDER_ID="${WORKLOAD_IDENTITY_PROVIDER_ID:-github-provider}"
DEPLOY_SERVICE_ACCOUNT_ID="${DEPLOY_SERVICE_ACCOUNT_ID:-github-deployer}"

function require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "error: required environment variable '$name' is not set" >&2
    exit 1
  fi
}

require_var PROJECT_ID
require_var GITHUB_OWNER
require_var GITHUB_REPO

if [[ -z "$PROJECT_NUMBER" ]]; then
  PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
fi

DEPLOY_SERVICE_ACCOUNT_EMAIL="${DEPLOY_SERVICE_ACCOUNT_ID}@${PROJECT_ID}.iam.gserviceaccount.com"
POOL_RESOURCE="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WORKLOAD_IDENTITY_POOL_ID}"
PROVIDER_RESOURCE="${POOL_RESOURCE}/providers/${WORKLOAD_IDENTITY_PROVIDER_ID}"
GITHUB_REPO_PRINCIPAL="principalSet://iam.googleapis.com/${POOL_RESOURCE}/attribute.repository/${GITHUB_OWNER}/${GITHUB_REPO}"

echo "==> Bootstrap configuration"
echo "    PROJECT_ID=${PROJECT_ID}"
echo "    REGION=${REGION}"
echo "    GAR_LOCATION=${GAR_LOCATION}"
echo "    GAR_REPOSITORY=${GAR_REPOSITORY}"
echo "    GITHUB_OWNER=${GITHUB_OWNER}"
echo "    GITHUB_REPO=${GITHUB_REPO}"

echo "==> Setting gcloud project to ${PROJECT_ID}"
gcloud config set project "$PROJECT_ID" >/dev/null

echo "==> Enabling required APIs"
gcloud services enable \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  sts.googleapis.com

echo "==> Ensuring Artifact Registry repository exists"
if ! gcloud artifacts repositories describe "$GAR_REPOSITORY" \
  --location "$GAR_LOCATION" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$GAR_REPOSITORY" \
    --repository-format=docker \
    --location "$GAR_LOCATION" \
    --description="Docker images for ${GITHUB_REPO}"
fi

echo "==> Ensuring deploy service account exists"
if ! gcloud iam service-accounts describe "$DEPLOY_SERVICE_ACCOUNT_EMAIL" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$DEPLOY_SERVICE_ACCOUNT_ID" \
    --display-name="GitHub Actions deployer"
fi

echo "==> Granting project roles to deploy service account"
for role in \
  roles/run.admin \
  roles/artifactregistry.writer \
  roles/iam.serviceAccountUser \
  roles/cloudbuild.builds.editor
do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${DEPLOY_SERVICE_ACCOUNT_EMAIL}" \
    --role="$role" \
    --quiet >/dev/null
done

echo "==> Ensuring Workload Identity Pool exists"
if ! gcloud iam workload-identity-pools describe "$WORKLOAD_IDENTITY_POOL_ID" \
  --location=global >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "$WORKLOAD_IDENTITY_POOL_ID" \
    --location=global \
    --display-name="GitHub Actions Pool"
fi

echo "==> Ensuring Workload Identity Provider exists"
if ! gcloud iam workload-identity-pools providers describe "$WORKLOAD_IDENTITY_PROVIDER_ID" \
  --location=global \
  --workload-identity-pool="$WORKLOAD_IDENTITY_POOL_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc "$WORKLOAD_IDENTITY_PROVIDER_ID" \
    --location=global \
    --workload-identity-pool="$WORKLOAD_IDENTITY_POOL_ID" \
    --display-name="GitHub Provider" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.aud=assertion.aud,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
    --attribute-condition="assertion.repository=='${GITHUB_OWNER}/${GITHUB_REPO}' && assertion.ref=='refs/heads/${GITHUB_BRANCH}'"
fi

echo "==> Allowing GitHub OIDC principal to impersonate the deploy service account"
gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/iam.workloadIdentityUser" \
  --member="$GITHUB_REPO_PRINCIPAL" \
  --quiet >/dev/null

cat <<OUTPUT

Bootstrap complete.

Use these values in GitHub:

Secrets:
  GCP_WORKLOAD_IDENTITY_PROVIDER=${PROVIDER_RESOURCE}
  GCP_SERVICE_ACCOUNT_EMAIL=${DEPLOY_SERVICE_ACCOUNT_EMAIL}
  SUPABASE_DATABASE_URL=<paste-from-supabase>

Repository variables:
  GCP_PROJECT_ID=${PROJECT_ID}
  GCP_REGION=${REGION}
  GAR_LOCATION=${GAR_LOCATION}
  GAR_REPOSITORY=${GAR_REPOSITORY}
  BACKEND_SERVICE_NAME=${BACKEND_SERVICE_NAME}
  FRONTEND_SERVICE_NAME=${FRONTEND_SERVICE_NAME}
  FRONTEND_BACKEND_API_URL=<fill-after-first-backend-deploy>
  FRONTEND_AUTH_BASE_URL=https://dummyjson.com/auth

Suggested next steps:
  1. Add the GitHub secrets and variables above.
  2. Push to main or run the deploy workflow manually.
  3. After backend deploy, copy its Cloud Run URL into FRONTEND_BACKEND_API_URL.
  4. Re-run the deploy workflow for the frontend.

Terraform note:
  This script is intended as a one-time dev bootstrap. The resources and naming
  conventions here should be moved into Terraform once the dev environment is stable.

OUTPUT