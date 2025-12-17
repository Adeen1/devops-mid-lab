$ErrorActionPreference = "Stop"
$clusterName = "adeen-devops"
$region = "us-east-1"

Write-Host "Checking for existing EKS cluster: $clusterName..."

try {
    $clusterInfo = aws eks describe-cluster --name $clusterName --region $region
    $status = $clusterInfo | ConvertFrom-Json | Select-Object -ExpandProperty cluster | Select-Object -ExpandProperty status
    
    if ($status -eq "ACTIVE" -or $status -eq "UPDATING") {
        Write-Host "Cluster $clusterName found ($status). Syncing state..."
        
        # 1. Handle Cluster Import
        $currentCluster = terraform state show module.eks.aws_eks_cluster.this[0] 2>$null
        if ($currentCluster -match "id\s+=\s+`"$clusterName`"") {
            Write-Host "Cluster $clusterName already in state."
        } else {
            if ($currentCluster) {
                Write-Host "State contains a DIFFERENT cluster. Removing..."
                terraform state rm module.eks.aws_eks_cluster.this[0]
            }
            Write-Host "Importing Cluster: $clusterName"
            terraform import module.eks.aws_eks_cluster.this[0] $clusterName
        }

        # 2. Handle VPC Import (Crucial: Use the VPC the cluster is actually IN)
        $vpcId = $clusterInfo | ConvertFrom-Json | Select-Object -ExpandProperty cluster | Select-Object -ExpandProperty resourcesVpcConfig | Select-Object -ExpandProperty vpcId
        Write-Host "Cluster is in VPC: $vpcId"
        
        $currentVpc = terraform state show module.vpc.aws_vpc.this[0] 2>$null
        if ($currentVpc -match "id\s+=\s+`"$vpcId`"") {
             Write-Host "VPC $vpcId already in state."
        } else {
             if ($currentVpc) {
                 Write-Host "State contains a DIFFERENT VPC. Removing..."
                 terraform state rm module.vpc.aws_vpc.this[0]
             }
             Write-Host "Importing VPC: $vpcId"
             terraform import module.vpc.aws_vpc.this[0] $vpcId
        }
        
        # 3. Handle IAM Role Import
        $roleArn = $clusterInfo | ConvertFrom-Json | Select-Object -ExpandProperty cluster | Select-Object -ExpandProperty roleArn
        $roleName = $roleArn.Split("/")[-1]
        Write-Host "Cluster Role: $roleName"
        
        $currentRole = terraform state show module.eks.aws_iam_role.this[0] 2>$null
        if ($currentRole -match "id\s+=\s+`"$roleName`"") {
             Write-Host "Role $roleName already in state."
        } else {
             if ($currentRole) {
                 Write-Host "State contains a DIFFERENT Role. Removing..."
                 terraform state rm module.eks.aws_iam_role.this[0]
             }
             Write-Host "Importing Role: $roleName"
             terraform import module.eks.aws_iam_role.this[0] $roleName
        }

    } else {
        Write-Host "Cluster found but status is $status. Letting Terraform handle it."
    }
} catch {
    Write-Host "Cluster $clusterName not found in AWS. Terraform will create it."
}
