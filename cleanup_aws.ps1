$ErrorActionPreference = "SilentlyContinue"
$env:AWS_PAGER="" # Disable pager to avoid 'cat' errors on Windows

Write-Host "Cleaning up orphaned resources..."

# 1. Delete ECR Repositories
Write-Host "Deleting ECR repositories..."
aws ecr delete-repository --repository-name lab-exam-backend --force
aws ecr delete-repository --repository-name lab-exam-frontend --force

# 1.5 Delete EKS Node Groups
Write-Host "Checking for EKS Node Groups..."
$nodeGroups = aws eks list-nodegroups --cluster-name lab-exam-cluster --query "nodegroups" --output text
if ($nodeGroups -and $nodeGroups -ne "None") {
    foreach ($ng in $nodeGroups.Split("`t")) {
        if ($ng -and $ng -ne "") {
             Write-Host "Deleting Node Group: $ng"
             aws eks delete-nodegroup --cluster-name lab-exam-cluster --nodegroup-name $ng
             Write-Host "Waiting for Node Group $ng to be deleted (this takes time)..."
             aws eks wait nodegroup-deleted --cluster-name lab-exam-cluster --nodegroup-name $ng
        }
    }
}

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
    }
} else {
    Write-Host "No VPCs found matching project tags. Checks AWS Console for untagged VPCs."
}

# 5. Security Group Cleanup (Enhanced)
Write-Host "Checking for lingering Security Groups..."
$sgIds = aws ec2 describe-security-groups --filters "Name=tag:Name,Values=devops-mid-lab-db-sg,devops-mid-lab-eks-node,devops-mid-lab-eks-cluster" --query "SecurityGroups[*].GroupId" --output text

if ($sgIds -and $sgIds -ne "None") {
    foreach ($sg in $sgIds.Split("`t")) {
        if ($sg) {
            Write-Host "Found SG: $sg. Checking dependencies..."
            
            # Find and Delete Network Interfaces using this SG
            $enis = aws ec2 describe-network-interfaces --filters "Name=group-id,Values=$sg" --query "NetworkInterfaces[*].NetworkInterfaceId" --output text
            if ($enis -and $enis -ne "None") {
                 foreach ($eni in $enis.Split("`t")) {
                     if ($eni) {
                        Write-Host "Deleting ENI blocking SG: $eni"
                        aws ec2 delete-network-interface --network-interface-id $eni
                     }
                 }
            }

            Write-Host "Deleting Security Group: $sg"
            # Retries for eventual consistency
            for ($i=0; $i -lt 3; $i++) {
                try {
                    aws ec2 delete-security-group --group-id $sg
                    break
                } catch {
                    Write-Host "Retry delete SG $sg..."
                    Start-Sleep -Seconds 5
                }
            }
        }
    }
}

Write-Host "Cleanup commands issued."
