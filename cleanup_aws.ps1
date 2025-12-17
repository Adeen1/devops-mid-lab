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

# 3.5 Delete KMS Alias (Critical for "AlreadyExists")
Write-Host "Deleting KMS Alias..."
aws kms delete-alias --alias-name alias/eks/lab-exam-cluster

# 4. VPC Cleanup (Enhanced)
Write-Host "Scanning for 'lab-exam-vpc' or related VPCs..."
# Try finding by Name
$vpcIds = aws ec2 describe-vpcs --filters "Name=tag:Name,Values=lab-exam-vpc" --query "Vpcs[*].VpcId" --output text
# Try finding by EKS Cluster tag (if Name text failed)
$vpcIds2 = aws ec2 describe-vpcs --filters "Name=tag:kubernetes.io/cluster/lab-exam-cluster,Values=shared" --query "Vpcs[*].VpcId" --output text

# Combine and unique
$allVpcs = ($vpcIds -split "`t") + ($vpcIds2 -split "`t") | Select-Object -Unique | Where-Object { $_ -ne "None" -and $_ -ne "" }

if ($allVpcs) {
    foreach ($vpcId in $allVpcs) {
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
        
        # Delete Security Groups (except default) - Optional but good for cleanliness
        # (Omitted for brevity, VPC delete might catch getting stuck if SGs have dependencies outside)

        # Finally, Delete VPC
        Write-Host "Deleting VPC: $vpcId"
        aws ec2 delete-vpc --vpc-id $vpcId
    }
} else {
    Write-Host "No VPCs found matching project tags. If 'VpcLimitExceeded' persists, checks AWS Console for untagged VPCs."
    aws ec2 describe-vpcs --query "Vpcs[*].{ID:VpcId, Tags:Tags}" --no-cli-pager
}

Write-Host "Cleanup commands issued."
