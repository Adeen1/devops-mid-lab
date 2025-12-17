$ErrorActionPreference = "SilentlyContinue"

Write-Host "Cleaning up orphaned resources..."

# 1. Delete ECR Repositories
Write-Host "Deleting ECR repositories..."
aws ecr delete-repository --repository-name lab-exam-backend --force
aws ecr delete-repository --repository-name lab-exam-frontend --force

# 2. Delete EKS Cluster
Write-Host "Deleting EKS Cluster (if exists)..."
aws eks delete-cluster --name lab-exam-cluster
# Wait for cluster deletion to avoid dependency modification errors? 
# For now, we assume Terraform might need to re-run or user re-runs script.

# 3. Delete Log Group
Write-Host "Deleting CloudWatch Log Group..."
aws logs delete-log-group --log-group-name /aws/eks/lab-exam-cluster/cluster

# 4. VPC Cleanup (Enhanced)
Write-Host "Attempting to find and delete 'lab-exam-vpc'..."
$vpcId = aws ec2 describe-vpcs --filters "Name=tag:Name,Values=lab-exam-vpc" --query "Vpcs[0].VpcId" --output text

if ($vpcId -and $vpcId -ne "None") {
    Write-Host "Found VPC: $vpcId. Cleaning up dependencies..."
    
    # Detach and Delete Internet Gateways
    $igws = aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$vpcId" --query "InternetGateways[*].InternetGatewayId" --output text
    foreach ($igw in $igws.Split("`t")) { 
        if ($igw) {
            Write-Host "Deleting IGW: $igw"
            aws ec2 detach-internet-gateway --internet-gateway-id $igw --vpc-id $vpcId
            aws ec2 delete-internet-gateway --internet-gateway-id $igw
        }
    }

    # Delete Subnets
    $subnets = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpcId" --query "Subnets[*].SubnetId" --output text
    foreach ($subnet in $subnets.Split("`t")) {
        if ($subnet) {
             Write-Host "Deleting Subnet: $subnet"
             aws ec2 delete-subnet --subnet-id $subnet
        }
    }

    # Finally, Delete VPC
    Write-Host "Deleting VPC: $vpcId"
    aws ec2 delete-vpc --vpc-id $vpcId
} else {
    Write-Host "VPC 'lab-exam-vpc' not found or already deleted."
}

Write-Host "Cleanup commands issued."
