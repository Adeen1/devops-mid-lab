$ErrorActionPreference = "SilentlyContinue"

Write-Host "Cleaning up orphaned resources..."

# 1. Delete ECR Repositories
Write-Host "Deleting ECR repositories..."
aws ecr delete-repository --repository-name lab-exam-backend --force
aws ecr delete-repository --repository-name lab-exam-frontend --force

# 2. Delete EKS Cluster (This might take a while and fail if dependencies exist)
Write-Host "Deleting EKS Cluster (if exists)..."
aws eks delete-cluster --name lab-exam-cluster

# 3. Delete Log Group
Write-Host "Deleting CloudWatch Log Group..."
aws logs delete-log-group --log-group-name /aws/eks/lab-exam-cluster/cluster

# 4. Identifying VPCs (Hard to filter specific one without ID, user must do this manually if possible)
Write-Host "WARNING: VPC Cleanup is complex via script. Please verify AWS Console for 'lab-exam-vpc' and delete it manually if 'VpcLimitExceeded' persists."

# 5. IAM Roles (Optional, TF usually handles, but if stuck...)
# aws iam delete-role --role-name ...

Write-Host "Cleanup commands issued. Please ensure the AWS S3 bucket 'lab-exam-state-bucket' exists for the new backend!"
