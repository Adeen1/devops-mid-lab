module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.29"

  cluster_endpoint_public_access  = true

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.intra_subnets

  # EKS Managed Node Group(s)
  eks_managed_node_groups = {
    green = {
      min_size     = 1
      max_size     = 2
      desired_size = 1

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
    }
  }

  enable_cluster_creator_admin_permissions = true

  # Avoid recreation if cluster exists
  create_iam_role = false
  iam_role_arn    = "arn:aws:iam::184437145027:role/rouse-restaurant-eks-cluster-role-dev"
  bootstrap_self_managed_addons = false

  tags = {
    Environment = "dev"
    Terraform   = "true"
  }
}
