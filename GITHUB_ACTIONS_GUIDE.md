# GitHub Actions Guide

## Overview
This project uses GitHub Actions for CI/CD. The workflows are defined in `.github/workflows/`.

- **CI (`ci.yml`)**: Runs on `push` to `main` and all `pull_request`s. It runs:
  - Backend tests
  - Frontend build and linting
- **CD (`deploy.yml`)**: Runs on `push` to `main`. It performs:
  - Terraform infrastructure provisioning (EKS, RDS, ECR)
  - Docker build and push to ECR
  - Kubernetes deployment to EKS

## Prerequisites (Secrets)
To ensure the pipeline runs successfully, you MUST configure the following secrets in your GitHub Repository settings:

| Secret Name | Description |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Access Key ID for your AWS account. |
| `AWS_SECRET_ACCESS_KEY` | Secret Access Key for your AWS account. |
| `AWS_SESSION_TOKEN` | (Required for Learner Lab) The temporary session token. |

> [!IMPORTANT]
> If you are using AWS Learner Lab, your credentials expire every few hours. You must update these secrets before pushing code if they have expired.

## Terraform Backend Warning
In `infra/providers.tf`, the S3 bucket for the backend is set to `lab-exam-state-bucket`.
**Ensure this bucket exists** in your AWS account in `us-east-1` (or your configured region), OR change the name to a bucket you control. Terraform *cannot* create the backend bucket for you; it must strictly exist beforehand.

## How to Trigger
- **CI**: Create a PR or push to `main`.
- **CD**: Merge a PR or push directly to `main`.
- **Manual Trigger**: `deploy.yml` is configured with `workflow_dispatch`, so you can manually run it from the "Actions" tab in GitHub.
