module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "lab-exam-cluster"
  cluster_version = "1.30"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.public_subnets # Use public subnets to avoid NAT GW requirement
  cluster_endpoint_public_access = true

  # Required for v20+ to allow the creator (Terraform) to access the cluster
  enable_cluster_creator_admin_permissions = true

  eks_managed_node_group_defaults = {
    ami_type = "AL2_x86_64"
  }

  eks_managed_node_groups = {
    one = {
      name = "node-group-1"

      instance_types = ["t3.small"] # Low cost for exam

      min_size     = 1
      max_size     = 2
      desired_size = 1
    }
  }
}
