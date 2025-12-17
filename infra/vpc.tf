module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
  
  # Only create if create_vpc is true
  create_vpc = var.create_vpc

  name = var.vpc_name
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = false
  single_nat_gateway = true # Ignored if enable_nat_gateway is false
  enable_vpn_gateway = false

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Environment = "dev"
    Project     = "lab-final"
  }
}

# --- Logic for reusing existing VPC ---

data "aws_vpc" "existing" {
  count = var.create_vpc ? 0 : 1
  filter {
    name   = "tag:Name"
    values = [var.vpc_name]
  }
}

data "aws_subnets" "existing_public" {
  count = var.create_vpc ? 0 : 1
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.existing[0].id]
  }
  # Simplify: Assumes all subnets in that VPC are usable/public for this lab context
}

locals {
  # If creating, use module output. If reusing, use data source.
  vpc_id     = var.create_vpc ? module.vpc.vpc_id : data.aws_vpc.existing[0].id
  subnet_ids = var.create_vpc ? module.vpc.public_subnets : data.aws_subnets.existing_public[0].ids
}
