$ErrorActionPreference = "Stop"
$clusterName = "adeen-devops"

Write-Host "Checking for existing EKS cluster: $clusterName..."

try {
    $cluster = aws eks describe-cluster --name $clusterName --query "cluster.status" --output text
    if ($cluster -eq "ACTIVE" -or $cluster -eq "UPDATING") {
        Write-Host "Cluster $clusterName found ($cluster). Attempting import..."
        
        # Check if already in state
        $state = terraform state list
        if ($state -match "module.eks.aws_eks_cluster.this\[0\]") {
            Write-Host "Cluster already in Terraform state. Skipping import."
        } else {
            Write-Host "Importing cluster into Terraform state..."
            terraform import module.eks.aws_eks_cluster.this[0] $clusterName
            if ($LASTEXITCODE -eq 0) {
                 Write-Host "Import successful."
            } else {
                 Write-Error "Import failed!"
            }
        }
    } else {
        Write-Host "Cluster found but status is $cluster. Letting Terraform handle it."
    }
} catch {
    Write-Host "Cluster $clusterName not found in AWS. Terraform will create it."
}
